from django.urls import path

from .views import (
    TicketListCreateView,
    TicketDetailView,
    ImportTicketView,
)


urlpatterns = [
    path(
        "",
        TicketListCreateView.as_view(),
        name="ticket-list-create",
    ),

    path(
        "import/",
        ImportTicketView.as_view(),
        name="ticket-import",
    ),

    path(
        "<int:pk>/",
        TicketDetailView.as_view(),
        name="ticket-detail",
    ),
]