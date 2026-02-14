import logging

from django.conf import settings

logger = logging.getLogger(__name__)


def send_otp_email(to_email: str, code: str, from_name: str = ""):
    """Send an OTP verification email using Resend."""
    try:
        import resend

        resend.api_key = settings.RESEND_API_KEY

        from_address = settings.RESEND_FROM_EMAIL
        if from_name:
            from_address = f"{from_name} <{from_address}>"

        resend.Emails.send({
            "from": from_address,
            "to": [to_email],
            "subject": "Tu codigo de verificacion",
            "html": (
                f"<div style='font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;'>"
                f"<h2 style='color: #1a1a2e;'>Codigo de verificacion</h2>"
                f"<p>Usa el siguiente codigo para verificar tu identidad:</p>"
                f"<div style='background: #f5f5f5; padding: 20px; text-align: center; "
                f"border-radius: 8px; margin: 20px 0;'>"
                f"<span style='font-size: 32px; font-weight: bold; letter-spacing: 6px; "
                f"color: #1a1a2e;'>{code}</span>"
                f"</div>"
                f"<p style='color: #666; font-size: 14px;'>Este codigo expira en 10 minutos.</p>"
                f"<p style='color: #999; font-size: 12px;'>Si no solicitaste este codigo, "
                f"puedes ignorar este mensaje.</p>"
                f"</div>"
            ),
        })
    except Exception:
        logger.exception("Failed to send OTP email to %s", to_email)


def send_welcome_email(to_email: str, guest_name: str, code: str, from_name: str = ""):
    """Send a welcome email with verification code after guest registration."""
    try:
        import resend

        resend.api_key = settings.RESEND_API_KEY

        from_address = settings.RESEND_FROM_EMAIL
        if from_name:
            from_address = f"{from_name} <{from_address}>"

        resend.Emails.send({
            "from": from_address,
            "to": [to_email],
            "subject": f"Bienvenido a {from_name} — Verifica tu email" if from_name else "Bienvenido — Verifica tu email",
            "html": (
                f"<div style='font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;'>"
                f"<h2 style='color: #1a1a2e;'>Bienvenido, {guest_name}!</h2>"
                f"<p>Tu cuenta ha sido creada exitosamente. Para completar tu registro, "
                f"verifica tu email con el siguiente codigo:</p>"
                f"<div style='background: #f5f5f5; padding: 20px; text-align: center; "
                f"border-radius: 8px; margin: 20px 0;'>"
                f"<span style='font-size: 32px; font-weight: bold; letter-spacing: 6px; "
                f"color: #1a1a2e;'>{code}</span>"
                f"</div>"
                f"<p style='color: #666; font-size: 14px;'>Este codigo expira en 10 minutos.</p>"
                f"<p style='color: #999; font-size: 12px;'>Si no creaste esta cuenta, "
                f"puedes ignorar este mensaje.</p>"
                f"</div>"
            ),
        })
    except Exception:
        logger.exception("Failed to send welcome email to %s", to_email)
