from rest_framework import generics

from rest_framework.permissions import DjangoModelPermissions

from .models import Note
from .serializers import NoteSerializer


class NoteListCreateView(generics.ListCreateAPIView):

    serializer_class = NoteSerializer

    permission_classes = [
        DjangoModelPermissions
    ]

    filterset_fields = [
        "created_by",
        "lead",
        "deal",
        "company",
        "ticket",
    ]

    search_fields = [
        "title",
        "content",
    ]

    ordering_fields = [
        "title",
        "created_at",
        "updated_at",
    ]

    ordering = [
        "-created_at"
    ]

    def get_queryset(self):

        user = self.request.user

        # Admin -> all notes
        if user.role == "admin":
            return (
                Note.objects
                .select_related(
                    "created_by",
                    "lead",
                    "deal",
                    "company",
                    "ticket"
                )
                .all()
            )

        # Other users -> only their notes
        return (
            Note.objects
            .select_related(
                "created_by",
                "lead",
                "deal",
                "company",
                "ticket"
            )
            .filter(
                created_by=user
            )
        )

    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user
        )


class NoteDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = NoteSerializer

    permission_classes = [
        DjangoModelPermissions
    ]

    def get_queryset(self):

        user = self.request.user

        # Admin -> all notes
        if user.role == "admin":
            return (
                Note.objects
                .select_related(
                    "created_by",
                    "lead",
                    "deal",
                    "company",
                    "ticket"
                )
                .all()
            )

        # Other users -> only their notes
        return (
            Note.objects
            .select_related(
                "created_by",
                "lead",
                "deal",
                "company",
                "ticket"
            )
            .filter(
                created_by=user
            )
        )