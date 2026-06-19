from django.db import IntegrityError
from django.db.models import Count, OuterRef, Subquery, IntegerField
from django.db.models.functions import Coalesce
from django.utils.text import slugify

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from plane.app.serializers import CompanySerializer, WorkSpaceSerializer
from plane.app.views.base import BaseAPIView, BaseViewSet
from plane.db.models import Company, CompanyMembership, Workspace, WorkspaceMember


def user_company_qs(user):
    """Companies the authenticated user belongs to, annotated with counts + their role."""
    workspace_count_sq = (
        Workspace.objects.filter(company_id=OuterRef("id"))
        .order_by()
        .values("company_id")
        .annotate(c=Count("*"))
        .values("c")
    )
    member_count_sq = (
        CompanyMembership.objects.filter(company_id=OuterRef("id"), is_active=True)
        .order_by()
        .values("company_id")
        .annotate(c=Count("*"))
        .values("c")
    )
    role_sq = (
        CompanyMembership.objects.filter(
            company_id=OuterRef("id"), member=user, is_active=True
        )
        .order_by()
        .values("role")[:1]
    )
    return (
        Company.objects.filter(memberships__member=user, memberships__is_active=True)
        .distinct()
        .annotate(
            workspace_count=Coalesce(Subquery(workspace_count_sq, output_field=IntegerField()), 0),
            member_count=Coalesce(Subquery(member_count_sq, output_field=IntegerField()), 0),
            role=Coalesce(Subquery(role_sq, output_field=IntegerField()), 5),
        )
        .order_by("-created_at")
    )


def _unique_slug(base: str) -> str:
    base = slugify(base) or "company"
    base = base[:40]
    candidate = base
    suffix = 1
    while Company.objects.filter(slug=candidate).exists():
        suffix += 1
        candidate = f"{base}-{suffix}"
    return candidate


class CompanyViewSet(BaseViewSet):
    """List/create/retrieve companies the user belongs to."""

    model = Company
    serializer_class = CompanySerializer
    permission_classes = [IsAuthenticated]
    lookup_field = "slug"

    def get_queryset(self):
        return user_company_qs(self.request.user)

    def create(self, request):
        name = (request.data.get("name") or "").strip()
        if not name:
            return Response({"error": "Name is required"}, status=status.HTTP_400_BAD_REQUEST)
        if len(name) > 120:
            return Response({"error": "Name must be 120 characters or fewer"}, status=status.HTTP_400_BAD_REQUEST)

        requested_slug = (request.data.get("slug") or "").strip()
        slug = _unique_slug(requested_slug or name)

        try:
            company = Company.objects.create(
                name=name,
                slug=slug,
                description=(request.data.get("description") or "").strip(),
                owner=request.user,
                created_by=request.user,
                updated_by=request.user,
            )
        except IntegrityError:
            return Response(
                {"slug": "A company with this slug already exists"},
                status=status.HTTP_409_CONFLICT,
            )

        CompanyMembership.objects.create(
            company=company, member=request.user, role=20, created_by=request.user
        )

        annotated = user_company_qs(request.user).get(pk=company.pk)
        return Response(CompanySerializer(annotated).data, status=status.HTTP_201_CREATED)


class CompanyWorkspaceListEndpoint(BaseAPIView):
    """Workspaces inside a specific company the user belongs to."""

    permission_classes = [IsAuthenticated]

    def get(self, request, slug):
        company = Company.objects.filter(
            slug=slug, memberships__member=request.user, memberships__is_active=True
        ).first()
        if not company:
            return Response({"error": "Company not found"}, status=status.HTTP_404_NOT_FOUND)

        workspaces = (
            Workspace.objects.filter(
                company=company,
                workspace_member__member=request.user,
                workspace_member__is_active=True,
            )
            .distinct()
            .order_by("name")
        )
        return Response(WorkSpaceSerializer(workspaces, many=True).data, status=status.HTTP_200_OK)
