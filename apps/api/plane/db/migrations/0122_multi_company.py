import uuid

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion

import plane.db.models.company


def drop_legacy_workspace_data(apps, schema_editor):
    """Fresh start: clear all workspace data so the new NOT NULL company FK can be added."""
    Workspace = apps.get_model("db", "Workspace")
    # Workspace cascade-deletes every child (projects, issues, members, etc.).
    Workspace.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ("db", "0121_alter_estimate_type"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        # 1. Clear legacy workspaces and their children.
        migrations.RunPython(drop_legacy_workspace_data, reverse_code=migrations.RunPython.noop),
        # 2. Create the Company table.
        migrations.CreateModel(
            name="Company",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("deleted_at", models.DateTimeField(null=True)),
                ("name", models.CharField(max_length=120, verbose_name="Company name")),
                (
                    "slug",
                    models.SlugField(
                        max_length=48,
                        unique=True,
                        validators=[plane.db.models.company.company_slug_validator],
                    ),
                ),
                ("description", models.TextField(blank=True, default="")),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="%(class)s_created_by",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="%(class)s_updated_by",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "owner",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="owned_companies",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Company",
                "verbose_name_plural": "Companies",
                "db_table": "companies",
                "ordering": ("-created_at",),
            },
        ),
        # 3. Create the CompanyMembership table.
        migrations.CreateModel(
            name="CompanyMembership",
            fields=[
                ("created_at", models.DateTimeField(auto_now_add=True, verbose_name="Created At")),
                ("updated_at", models.DateTimeField(auto_now=True, verbose_name="Last Modified At")),
                ("id", models.UUIDField(db_index=True, default=uuid.uuid4, editable=False, primary_key=True, serialize=False, unique=True)),
                ("deleted_at", models.DateTimeField(null=True)),
                (
                    "role",
                    models.PositiveSmallIntegerField(
                        choices=[(20, "Owner"), (15, "Admin"), (5, "Member")],
                        default=15,
                    ),
                ),
                ("is_active", models.BooleanField(default=True)),
                (
                    "company",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="memberships",
                        to="db.company",
                    ),
                ),
                (
                    "created_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="%(class)s_created_by",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "updated_by",
                    models.ForeignKey(
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="%(class)s_updated_by",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "member",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="company_memberships",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "verbose_name": "Company Member",
                "verbose_name_plural": "Company Members",
                "db_table": "company_memberships",
                "ordering": ("-created_at",),
            },
        ),
        migrations.AddConstraint(
            model_name="companymembership",
            constraint=models.UniqueConstraint(
                condition=models.Q(("deleted_at__isnull", True)),
                fields=("company", "member"),
                name="company_membership_unique_company_member_when_deleted_at_null",
            ),
        ),
        # 4. Wire Workspace -> Company (NOT NULL is safe because step 1 cleared everything).
        migrations.AddField(
            model_name="workspace",
            name="company",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="workspaces",
                to="db.company",
            ),
        ),
    ]
