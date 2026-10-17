from django.urls import path

from .views import (
    LeadListCreateView,
    LeadDetailView,
    LeadImportView,
)


urlpatterns = [
    path(
        "",
        LeadListCreateView.as_view(),
        name="lead-list-create",
    ),

    path(
        "import/",
        LeadImportView.as_view(),
        name="lead-import",
    ),

    path(
        "<int:pk>/",
        LeadDetailView.as_view(),
        name="lead-detail",
    ),
]