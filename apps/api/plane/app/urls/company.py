from django.urls import path

from plane.app.views.company import CompanyViewSet, CompanyWorkspaceListEndpoint


urlpatterns = [
    path(
        "companies/",
        CompanyViewSet.as_view({"get": "list", "post": "create"}),
        name="companies",
    ),
    path(
        "companies/<str:slug>/",
        CompanyViewSet.as_view({"get": "retrieve", "patch": "partial_update", "delete": "destroy"}),
        name="company-detail",
    ),
    path(
        "companies/<str:slug>/workspaces/",
        CompanyWorkspaceListEndpoint.as_view(),
        name="company-workspaces",
    ),
]
