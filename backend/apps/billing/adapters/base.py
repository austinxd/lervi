from abc import ABC, abstractmethod


class BaseBillingAdapter(ABC):
    """
    Abstract base class for billing provider adapters.

    All adapters must implement build_payload() and send().

    Standard send() response format:
    {
        "success": bool,
        "rejected": bool,       # True if SUNAT rejected (vs network error)
        "http_status": int,     # HTTP status from response
        "error_code": str,      # Provider internal error code
        "ticket": str,
        "document_url": str,
        "raw_response": dict,
        "error": str,
    }
    """

    @abstractmethod
    def build_payload(self, invoice, config):
        """Build the provider-specific payload from an Invoice and config dict."""

    @abstractmethod
    def send(self, payload, config):
        """Send the payload to the provider. Returns standard response dict."""
