from django.urls import path
from . import views


urlpatterns = [
    path(
        "",
        views.CompanyListCreateView.as_view(),
        name="company-list-create",
    ),

    path(
        "import/",
        views.CompanyImportView.as_view(),
        name="company-import",
    ),

    path(
        "<int:pk>/",
        views.CompanyDetailView.as_view(),
        name="company-detail",
    ),
]