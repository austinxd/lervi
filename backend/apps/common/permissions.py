from rest_framework.permissions import BasePermission

# Role hierarchy (higher index = more privileges)
ROLE_HIERARCHY = {
    "maintenance": 0,
    "housekeeping": 1,
    "reception": 2,
    "manager": 3,
    "owner": 4,
    "super_admin": 5,
}


class HasRolePermission(BasePermission):
    """
    Checks that the user has at least the minimum required role.
    Set `required_role` on the view.
    """

    def has_permission(self, request, view):
        required_role = getattr(view, "required_role", None)
        if not required_role:
            return True
        user_role = getattr(request.user, "role", None)
        if not user_role:
            return False
        return ROLE_HIERARCHY.get(user_role, -1) >= ROLE_HIERARCHY.get(required_role, 99)


class IsSuperAdmin(BasePermission):
    def has_permission(self, request, view):
        return getattr(request.user, "role", None) == "super_admin"


class IsOwner(BasePermission):
    def has_permission(self, request, view):
        return getattr(request.user, "role", None) == "owner"


class IsOwnerOrManager(BasePermission):
    def has_permission(self, request, view):
        return getattr(request.user, "role", None) in ("owner", "manager", "super_admin")
