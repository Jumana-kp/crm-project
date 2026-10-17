from rest_framework import serializers

from apps.users.models import User

from .models import Task


class UserNestedSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = User

        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
        ]


class TaskSerializer(
    serializers.ModelSerializer
):

    # ---------------------------------------------
    # CREATED BY
    # ---------------------------------------------

    created_by = UserNestedSerializer(
        read_only=True
    )

    # ---------------------------------------------
    # ASSIGNED TO
    # ---------------------------------------------

    assigned_to = UserNestedSerializer(
        many=True,
        read_only=True
    )

    assigned_to_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        many=True,
        write_only=True,
        source="assigned_to",
        required=False,
    )

    # ---------------------------------------------
    # META
    # ---------------------------------------------

    class Meta:

        model = Task

        fields = [
            "id",

            "task_name",

            "due_date",

            "due_time",

            "task_type",

            "priority",

            "status",

            "created_by",

            "assigned_to",

            "assigned_to_id",

            "note",

            "lead",

            "deal",

            "company",

            "ticket",

            "created_at",

            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_by",
            "created_at",
            "updated_at",
        ]