from django.utils.functional import SimpleLazyObject


def get_organization(request):
    if not hasattr(request, "_cached_organization"):
        organization = None
        user = request.user
        if user and hasattr(user, "is_authenticated") and user.is_authenticated:
            organization = getattr(user, "organization", None)
        request._cached_organization = organization
    return request._cached_organization


class TenantMiddleware:
    """
    Resolves the current organization from the authenticated user's JWT
    and attaches it to the request as `request.organization`.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.organization = SimpleLazyObject(lambda: get_organization(request))
        return self.get_response(request)
