from .efact import EfactAdapter
from .nubefact import NubefactAdapter
from .webhook import CustomWebhookAdapter

ADAPTER_REGISTRY = {
    "nubefact": NubefactAdapter,
    "efact": EfactAdapter,
    "custom_webhook": CustomWebhookAdapter,
}


def get_adapter(provider_name):
    """
    Get an adapter instance for the given provider name.
    Returns None if provider is not found.
    """
    adapter_class = ADAPTER_REGISTRY.get(provider_name)
    if adapter_class:
        return adapter_class()
    return None
