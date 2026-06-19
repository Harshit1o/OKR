# Django imports
from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models

# Module imports
from .base import BaseModel


COMPANY_ROLE_CHOICES = ((20, "Owner"), (15, "Admin"), (5, "Member"))


def company_slug_validator(value: str) -> None:
    reserved = {"admin", "api", "auth", "god-mode", "company", "companies", "static", "media"}
    if value.lower() in reserved:
        raise ValidationError("Company slug is reserved")


class Company(BaseModel):
    """A tenant organisation. Owns workspaces, has members."""

    name = models.CharField(max_length=120, verbose_name="Company name")
    slug = models.SlugField(
        max_length=48,
        db_index=True,
        unique=True,
        validators=[company_slug_validator],
    )
    description = models.TextField(blank=True, default="")
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_companies",
    )

    class Meta:
        verbose_name = "Company"
        verbose_name_plural = "Companies"
        db_table = "companies"
        ordering = ("-created_at",)

    def __str__(self) -> str:
        return self.name


class CompanyMembership(BaseModel):
    """A user's role inside a Company."""

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="memberships",
    )
    member = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="company_memberships",
    )
    role = models.PositiveSmallIntegerField(choices=COMPANY_ROLE_CHOICES, default=15)
    is_active = models.BooleanField(default=True)

    class Meta:
        verbose_name = "Company Member"
        verbose_name_plural = "Company Members"
        db_table = "company_memberships"
        ordering = ("-created_at",)
        constraints = [
            models.UniqueConstraint(
                fields=["company", "member"],
                condition=models.Q(deleted_at__isnull=True),
                name="company_membership_unique_company_member_when_deleted_at_null",
            )
        ]

    def __str__(self) -> str:
        return f"{self.member_id} @ {self.company_id} ({self.get_role_display()})"
