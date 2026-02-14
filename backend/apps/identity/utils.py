import hashlib
import os
import re

from cryptography.fernet import Fernet
from django.conf import settings


def normalize_document(document_number: str) -> str:
    """Normalize a document number by stripping spaces, dashes and uppercasing."""
    return re.sub(r"[\s\-]", "", document_number).strip().upper()


def make_document_hash(document_type: str, document_number: str) -> str:
    """SHA-256 hash of normalized document_type:document_number."""
    normalized = normalize_document(document_number)
    raw = f"{document_type.lower()}:{normalized}"
    return hashlib.sha256(raw.encode()).hexdigest()


def _get_fernet() -> Fernet:
    key = settings.IDENTITY_ENCRYPTION_KEY
    return Fernet(key.encode() if isinstance(key, str) else key)


def encrypt_value(value: str) -> bytes:
    """Encrypt a string value using Fernet symmetric encryption."""
    return _get_fernet().encrypt(value.encode())


def decrypt_value(encrypted: bytes) -> str:
    """Decrypt a Fernet-encrypted value."""
    return _get_fernet().decrypt(encrypted).decode()


def generate_otp_code() -> str:
    """Generate a 6-digit OTP code."""
    return f"{int.from_bytes(os.urandom(3), 'big') % 1000000:06d}"
