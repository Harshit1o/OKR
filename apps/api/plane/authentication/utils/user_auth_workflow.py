# Copyright (c) 2023-present ScaleX Software, Inc. and contributors
# SPDX-License-Identifier: AGPL-3.0-only
# See the LICENSE file for details.

from django.utils.text import slugify

from plane.db.models import Company, CompanyMembership

from .workspace_project_join import process_workspace_project_invitations


def _generate_unique_company_slug(base: str) -> str:
    base = slugify(base) or "company"
    base = base[:40]
    candidate = base
    suffix = 1
    while Company.objects.filter(slug=candidate).exists():
        suffix += 1
        candidate = f"{base}-{suffix}"
    return candidate


def ensure_personal_company(user) -> Company:
    """Each newly authenticated user gets a personal Company they own."""
    existing = CompanyMembership.objects.filter(member=user, is_active=True).first()
    if existing:
        return existing.company

    base_name = user.first_name or user.display_name or user.email.split("@")[0]
    company = Company.objects.create(
        name=f"{base_name}'s company",
        slug=_generate_unique_company_slug(base_name),
        owner=user,
        created_by=user,
        updated_by=user,
    )
    CompanyMembership.objects.create(company=company, member=user, role=20, created_by=user)
    return company


def post_user_auth_workflow(user, is_signup, request):
    if is_signup:
        ensure_personal_company(user)
    process_workspace_project_invitations(user=user)
