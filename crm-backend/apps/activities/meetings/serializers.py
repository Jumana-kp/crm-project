from rest_framework import serializers

from apps.users.models import User

from .models import Meeting


class UserNestedSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
        ]


class MeetingSerializer(serializers.ModelSerializer):

    # Show complete user details in GET response
    attendees = UserNestedSerializer(
        many=True,
        read_only=True
    )

    # Accept user IDs when creating/updating
    attendee_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=User.objects.all(),
        write_only=True,
        source="attendees",
        required=False
    )

    # Show creator details
    created_by = UserNestedSerializer(
        read_only=True
    )

    class Meta:
        model = Meeting

        fields = [
            "id",
            "title",
            "start_date",
            "start_time",
            "end_time",
            "created_by",
            "attendees",
            "attendee_ids",
            "location",
            "reminder",
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