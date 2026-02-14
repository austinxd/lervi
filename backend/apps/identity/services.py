from datetime import timedelta

from django.conf import settings
from django.utils import timezone

from apps.guests.models import Guest

from .models import GlobalIdentity, IdentityLink, OTPCode
from .utils import (
    decrypt_value,
    encrypt_value,
    generate_otp_code,
    make_document_hash,
    normalize_document,
)


def get_or_create_identity(
    document_type: str,
    document_number: str,
    email: str = "",
    full_name: str = "",
) -> GlobalIdentity:
    """Get or create a GlobalIdentity from document credentials."""
    doc_hash = make_document_hash(document_type, document_number)
    identity, created = GlobalIdentity.objects.get_or_create(
        document_hash=doc_hash,
        defaults={
            "document_type": document_type.lower(),
            "encrypted_email": encrypt_value(email) if email else None,
            "encrypted_name": encrypt_value(full_name) if full_name else None,
            "encryption_version": 1,
        },
    )
    if not created:
        identity.last_seen_at = timezone.now()
        update_fields = ["last_seen_at"]
        if email and not identity.encrypted_email:
            identity.encrypted_email = encrypt_value(email)
            update_fields.append("encrypted_email")
        if full_name and not identity.encrypted_name:
            identity.encrypted_name = encrypt_value(full_name)
            update_fields.append("encrypted_name")
        identity.save(update_fields=update_fields)
    return identity


def create_identity_link(identity: GlobalIdentity, organization, guest: Guest):
    """Create a link between identity and guest in an organization."""
    link, _ = IdentityLink.objects.get_or_create(
        identity=identity,
        organization=organization,
        defaults={"guest": guest},
    )
    return link


def lookup_identity(document_type: str, document_number: str):
    """Lookup a GlobalIdentity by document. Returns (identity, exists)."""
    doc_hash = make_document_hash(document_type, document_number)
    try:
        identity = GlobalIdentity.objects.get(document_hash=doc_hash)
        return identity, True
    except GlobalIdentity.DoesNotExist:
        return None, False


def has_link_in_org(identity: GlobalIdentity, organization) -> bool:
    """Check if identity already has a guest link in this organization."""
    return IdentityLink.objects.filter(
        identity=identity, organization=organization
    ).exists()


def get_guest_for_identity(identity: GlobalIdentity, organization):
    """Get the Guest linked to this identity in this organization, or None."""
    link = IdentityLink.objects.filter(
        identity=identity, organization=organization
    ).select_related("guest").first()
    return link.guest if link else None


def request_otp(identity: GlobalIdentity, organization_name: str = "") -> dict:
    """
    Generate and send an OTP to the identity's email.
    Returns {"ok": True} or {"error": "...", "retry_after": seconds}.
    """
    from apps.common.email import send_otp_email

    now = timezone.now()
    cooldown_seconds = getattr(settings, "OTP_COOLDOWN_SECONDS", 60)
    max_per_hour = getattr(settings, "OTP_MAX_PER_HOUR", 5)

    # Rate limit: max per hour
    one_hour_ago = now - timedelta(hours=1)
    recent_count = OTPCode.objects.filter(
        identity=identity,
        created_at__gte=one_hour_ago,
    ).count()
    if recent_count >= max_per_hour:
        return {"error": "Demasiados intentos. Intente de nuevo en una hora."}

    # Cooldown: check last OTP
    last_otp = OTPCode.objects.filter(identity=identity).first()
    if last_otp:
        elapsed = (now - last_otp.created_at).total_seconds()
        if elapsed < cooldown_seconds:
            retry_after = int(cooldown_seconds - elapsed)
            return {
                "error": f"Espere {retry_after} segundos antes de solicitar otro codigo.",
                "retry_after": retry_after,
            }

    # Generate OTP
    code = generate_otp_code()
    otp_lifetime = getattr(settings, "OTP_LIFETIME_MINUTES", 10)
    OTPCode.objects.create(
        identity=identity,
        code=code,
        expires_at=now + timedelta(minutes=otp_lifetime),
    )

    # Send email
    email = ""
    if identity.encrypted_email:
        email = decrypt_value(identity.encrypted_email)

    if not email:
        return {"error": "No hay un email asociado a esta cuenta."}

    try:
        send_otp_email(email, code, from_name=organization_name)
    except Exception as exc:
        return {"error": f"Error al enviar email: {exc}"}

    return {"ok": True}


def verify_otp(identity: GlobalIdentity, code: str) -> bool:
    """Verify an OTP code. Returns True if valid, False otherwise."""
    otp = OTPCode.objects.filter(
        identity=identity,
        is_used=False,
    ).first()

    if not otp:
        return False

    otp.attempts += 1
    otp.save(update_fields=["attempts"])

    if otp.is_expired:
        return False

    if otp.attempts > 5:
        return False

    if otp.code != code:
        return False

    # Mark as used
    otp.is_used = True
    otp.save(update_fields=["is_used"])

    # Invalidate older unused OTPs
    OTPCode.objects.filter(
        identity=identity,
        is_used=False,
    ).exclude(id=otp.id).update(is_used=True)

    return True
