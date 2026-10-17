from django.urls import path

from .views import (
    AttachmentListCreateView,
    AttachmentDetailView,
)


urlpatterns = [
    path(
        "",
        AttachmentListCreateView.as_view(),
        name="attachment-list-create",
    ),

    path(
        "<int:pk>/",
        AttachmentDetailView.as_view(),
        name="attachment-detail",
    ),
]