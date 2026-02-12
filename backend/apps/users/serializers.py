from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

from .models import User


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token["organization_id"] = str(user.organization_id) if user.organization_id else None
        token["role"] = user.role
        token["property_ids"] = [str(p.id) for p in user.properties.all()]
        token["full_name"] = user.full_name
        return token


class UserSerializer(serializers.ModelSerializer):
    properties = serializers.PrimaryKeyRelatedField(
        many=True,
        read_only=True,
    )

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name",
            "role", "organization", "properties",
            "is_active", "created_at", "updated_at",
        ]
        read_only_fields = ["id", "organization", "created_at", "updated_at"]


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "id", "email", "password", "first_name", "last_name",
            "role", "properties", "is_active",
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "properties": {"required": False},
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and hasattr(request, "organization") and request.organization:
            from apps.organizations.models import Property
            self.fields["properties"].child_relation.queryset = Property.objects.filter(
                organization=request.organization
            )

    def create(self, validated_data):
        properties = validated_data.pop("properties", [])
        password = validated_data.pop("password")
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        if properties:
            user.properties.set(properties)
        return user


class MeSerializer(serializers.ModelSerializer):
    properties = serializers.PrimaryKeyRelatedField(many=True, read_only=True)
    organization_name = serializers.CharField(source="organization.name", read_only=True)

    class Meta:
        model = User
        fields = [
            "id", "email", "first_name", "last_name",
            "role", "organization", "organization_name",
            "properties", "is_active",
            "created_at", "updated_at",
        ]
        read_only_fields = fields
