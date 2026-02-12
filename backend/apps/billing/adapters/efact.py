from .base import BaseBillingAdapter


class EfactAdapter(BaseBillingAdapter):
    """
    Stub adapter for eFact electronic billing provider.
    To be implemented when eFact API documentation is available.
    """

    def build_payload(self, invoice, config):
        raise NotImplementedError("eFact adapter not yet implemented")

    def send(self, payload, config):
        raise NotImplementedError("eFact adapter not yet implemented")
