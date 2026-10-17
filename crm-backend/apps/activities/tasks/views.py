from django.db.models import Q

from rest_framework import generics
from rest_framework.permissions import DjangoModelPermissions

from .models import Task
from .serializers import TaskSerializer


class TaskListCreateView(generics.ListCreateAPIView):

    serializer_class = TaskSerializer

    permission_classes = [
        DjangoModelPermissions
    ]

    filterset_fields = [
        "lead",
        "deal",
        "company",
        "ticket",
        "created_by",
        "assigned_to",
        "task_type",
        "priority",
        "status",
        "due_date",
    ]

    search_fields = [
        "task_name",
        "note",
    ]

    ordering_fields = [
        "task_name",
        "due_date",
        "due_time",
        "task_type",
        "priority",
        "status",
        "created_at",
        "updated_at",
    ]

    ordering = [
        "due_date",
        "due_time",
    ]

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Task.objects
            .select_related(
                "created_by",
                "lead",
                "deal",
                "company",
                "ticket",
            )
            .prefetch_related(
                "assigned_to",
            )
        )

        # ---------------------------------------------
        # ADMIN
        # ---------------------------------------------

        if user.role == "admin":
            return queryset.all()

        # ---------------------------------------------
        # OTHER USERS
        #
        # Can see:
        # 1. Tasks created by them
        # OR
        # 2. Tasks assigned to them
        # ---------------------------------------------

        return queryset.filter(
            Q(created_by=user)
            | Q(assigned_to=user)
        ).distinct()

    def perform_create(self, serializer):

        serializer.save(
            created_by=self.request.user
        )


class TaskDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = TaskSerializer

    permission_classes = [
        DjangoModelPermissions
    ]

    def get_queryset(self):

        user = self.request.user

        queryset = (
            Task.objects
            .select_related(
                "created_by",
                "lead",
                "deal",
                "company",
                "ticket",
            )
            .prefetch_related(
                "assigned_to",
            )
        )

        # ---------------------------------------------
        # ADMIN
        # ---------------------------------------------

        if user.role == "admin":
            return queryset.all()

        # ---------------------------------------------
        # OTHER USERS
        #
        # Can access:
        # 1. Tasks created by them
        # OR
        # 2. Tasks assigned to them
        # ---------------------------------------------

        return queryset.filter(
            Q(created_by=user)
            | Q(assigned_to=user)
        ).distinct()