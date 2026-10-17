from django.urls import path

from .views import (
    EmailListCreateView,
    EmailDetailView,
    EmailAttachmentListCreateView,
    EmailAttachmentDetailView,
    SendEmailView,
)


urlpatterns = [

    path(
        "",
        EmailListCreateView.as_view(),
        name="email-list-create"
    ),

    path(
        "<int:pk>/",
        EmailDetailView.as_view(),
        name="email-detail"
    ),

    path(
        "attachments/",
        EmailAttachmentListCreateView.as_view(),
        name="email-attachment-list-create"
    ),

    path(
        "attachments/<int:pk>/",
        EmailAttachmentDetailView.as_view(),
        name="email-attachment-detail"
    ),
    path(
         "<int:pk>/send/",
          SendEmailView.as_view(),
          name="email-send"
    ),
]