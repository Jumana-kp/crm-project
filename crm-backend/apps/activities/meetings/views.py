from django.shortcuts import render

from django.db.models import Q

from rest_framework import generics
from rest_framework.permissions import DjangoModelPermissions

from .models import Meeting
from .serializers import MeetingSerializer


class MeetingListCreateView(generics.ListCreateAPIView):

    serializer_class = MeetingSerializer

    permission_classes = [
        DjangoModelPermissions
    ]

    filterset_fields = [
        "lead",
        "deal",
        "company",
        "ticket",
        "created_by",
        "attendees",
        "reminder",
    ]

    search_fields = [
        "title",
        "location",
        "note",
    ]

    ordering_fields = [
        "title",
        "start_date",
        "start_time",
        "end_time",
        "created_at",
        "updated_at",
    ]

    ordering = [
        "start_date",
        "start_time",
    ]

    def get_queryset(self):

        user = self.request.user

        # Admin -> all meetings
        if user.role == "admin":
            return (
                Meeting.objects
                .select_related(
                    "created_by",
                    "lead",
                    "deal",
                    "company",
                    "ticket",
                )
                .prefetch_related("attendees")
                .all()
            )

        # Other users ->
        # meetings they created OR meetings they attend
        return (
            Meeting.objects
            .select_related(
                "created_by",
                "lead",
                "deal",
                "company",
                "ticket",
            )
            .prefetch_related("attendees")
            .filter(
                Q(created_by=user) |
                Q(attendees=user)
            )
            .distinct()
        )

    def perform_create(self, serializer):

        serializer.save(
            created_by=self.request.user
        )


class MeetingDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = MeetingSerializer

    permission_classes = [
        DjangoModelPermissions
    ]

    def get_queryset(self):

        user = self.request.user

        # Admin -> all meetings
        if user.role == "admin":
            return (
                Meeting.objects
                .select_related(
                    "created_by",
                    "lead",
                    "deal",
                    "company",
                    "ticket",
                )
                .prefetch_related("attendees")
                .all()
            )

        # Other users ->
        # meetings they created OR meetings they attend
        return (
            Meeting.objects
            .select_related(
                "created_by",
                "lead",
                "deal",
                "company",
                "ticket",
            )
            .prefetch_related("attendees")
            .filter(
                Q(created_by=user) |
                Q(attendees=user)
            )
            .distinct()
        )
