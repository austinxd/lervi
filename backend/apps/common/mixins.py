class TenantQuerySetMixin:
    """
    Mixin for DRF viewsets that filters querysets by the current
    user's organization and injects it on create.
    """

    def get_queryset(self):
        qs = super().get_queryset()
        organization = getattr(self.request, "organization", None)
        if organization:
            qs = qs.filter(organization=organization)
        return qs

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.organization,
            created_by=self.request.user,
        )
