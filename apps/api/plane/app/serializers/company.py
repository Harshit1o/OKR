from rest_framework import serializers

from plane.db.models import Company, CompanyMembership

from .base import BaseSerializer
from .user import UserLiteSerializer


class CompanySerializer(BaseSerializer):
    owner_detail = UserLiteSerializer(source="owner", read_only=True)
    workspace_count = serializers.IntegerField(read_only=True)
    member_count = serializers.IntegerField(read_only=True)
    role = serializers.IntegerField(read_only=True)

    class Meta:
        model = Company
        fields = [
            "id",
            "name",
            "slug",
            "description",
            "owner",
            "owner_detail",
            "workspace_count",
            "member_count",
            "role",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "owner", "created_at", "updated_at"]


class CompanyMembershipSerializer(BaseSerializer):
    member_detail = UserLiteSerializer(source="member", read_only=True)

    class Meta:
        model = CompanyMembership
        fields = [
            "id",
            "company",
            "member",
            "member_detail",
            "role",
            "is_active",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]
