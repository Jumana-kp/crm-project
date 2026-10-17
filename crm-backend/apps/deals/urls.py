
from django.urls import path

from .views import (
    DealListCreateView,
    DealDetailView,
    ImportDealView,
)


urlpatterns = [
    path(
        "",
        DealListCreateView.as_view(),
        name="deal-list-create",
    ),

    path(
        "import/",
        ImportDealView.as_view(),
        name="deal-import",
    ),

    path(
        "<int:pk>/",
        DealDetailView.as_view(),
        name="deal-detail",
    ),
]

