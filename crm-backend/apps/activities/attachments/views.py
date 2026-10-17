from rest_framework import generics
from rest_framework.permissions import DjangoModelPermissions

from .models import Attachment
from .serializers import AttachmentSerializer


class AttachmentListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = AttachmentSerializer

    permission_classes = [
        DjangoModelPermissions
    ]

    filterset_fields = [
        "lead",
        "deal",
        "company",
        "ticket",
        "created_by",
    ]

    search_fields = [
        "file_name",
    ]

    ordering_fields = [
        "file_name",
        "file_size",
        "created_at",
        "updated_at",
    ]

    ordering = [
        "-created_at",
    ]

    def get_queryset(self):

        user = self.request.user

        # Admin -> all attachments
        if user.role == "admin":
            return (
                Attachment.objects
                .select_related(
                    "created_by",
                    "lead",
                    "deal",
                    "company",
                    "ticket",
                )
                .all()
            )

        # Other users -> attachments they created
        return (
            Attachment.objects
            .select_related(
                "created_by",
                "lead",
                "deal",
                "company",
                "ticket",
            )
            .filter(
                created_by=user
            )
        )

    def perform_create(self, serializer):

        serializer.save(
            created_by=self.request.user
        )


class AttachmentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = AttachmentSerializer

    permission_classes = [
        DjangoModelPermissions
    ]

    def get_queryset(self):

        user = self.request.user

        # Admin -> all attachments
        if user.role == "admin":
            return (
                Attachment.objects
                .select_related(
                    "created_by",
                    "lead",
                    "deal",
                    "company",
                    "ticket",
                )
                .all()
            )

        # Other users -> attachments they created
        return (
            Attachment.objects
            .select_related(
                "created_by",
                "lead",
                "deal",
                "company",
                "ticket",
            )
            .filter(
                created_by=user
            )
        )