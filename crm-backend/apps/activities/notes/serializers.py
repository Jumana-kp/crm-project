from rest_framework import serializers

from .models import Note
from apps.users.models import User


class UserNestedSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
        ]


class NoteSerializer(serializers.ModelSerializer):

    created_by = UserNestedSerializer(
        read_only=True
    )

    class Meta:
        model = Note

        fields = "__all__"

        read_only_fields = [
            "created_by",
            "created_at",
            "updated_at",
        ]