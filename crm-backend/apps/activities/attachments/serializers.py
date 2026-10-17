from rest_framework import serializers

from .models import Attachment


class AttachmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Attachment

        fields = [
            "id",
            "file",
            "file_name",
            "file_size",
            "created_by",
            "lead",
            "deal",
            "company",
            "ticket",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "file_name",
            "file_size",
            "created_by",
            "created_at",
            "updated_at",
        ]