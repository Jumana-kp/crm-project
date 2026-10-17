



from rest_framework import serializers

from .models import Email, EmailAttachment
from apps.users.models import User
from apps.activities.attachments.models import Attachment


class UserNestedSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
        ]


class EmailAttachmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailAttachment

        fields = [
            "id",
            "email",
            "file",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
        ]


# class EmailSerializer(serializers.ModelSerializer):

#     sent_by = UserNestedSerializer(
#         read_only=True
#     )

#     attachments = EmailAttachmentSerializer(
#         many=True,
#         read_only=True
#     )

#     # attachment_ids = serializers.ListField(
#     #     child=serializers.IntegerField(),
#     #     write_only=True,
#     #     required=False
#     # )
#     selectedAttachmentIds = serializers.ListField(
#     # selected_attachment_ids = serializers.ListField(
#     child=serializers.IntegerField(),
#     write_only=True,
#     required=False
# )

#     class Meta:
#         model = Email

#         fields = [
#             "id",
#             "sent_by",
#             "lead",
#             "deal",
#             "company",
#             "ticket",
#             "recipients",
#             "cc",
#             "bcc",
#             "subject",
#             "body",
#             "status",
#             "sent_at",
#             "attachments",
#             # "attachment_ids",
#               "selected_attachment_ids",
#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",
#             "sent_by",
#             "attachments",
#             "created_at",
#             "updated_at",
#         ]

#     def create(self, validated_data):

#         selected_attachment_ids = validated_data.pop(
           
#             "selectedAttachmentIds",
#             []
#         )

#         email = Email.objects.create(
#             **validated_data
#         )

#         for attachment_id in selected_attachment_ids:

#             attachment = Attachment.objects.get(
#                 id=attachment_id
#             )

#             EmailAttachment.objects.create(
#                 email=email,
#                 file=attachment.file
#             )

#         return email
class EmailSerializer(serializers.ModelSerializer):

    sent_by = UserNestedSerializer(
        read_only=True
    )

    attachments = EmailAttachmentSerializer(
        many=True,
        read_only=True
    )

    selectedAttachmentIds = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Email

        fields = [
            "id",
            "sent_by",
            "lead",
            "deal",
            "company",
            "ticket",
            "recipients",
            "cc",
            "bcc",
            "subject",
            "body",
            "status",
            "sent_at",
            "attachments",
            "selectedAttachmentIds",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "sent_by",
            "attachments",
            "created_at",
            "updated_at",
        ]

    def create(self, validated_data):

        selected_attachment_ids = validated_data.pop(
            "selectedAttachmentIds",
            []
        )

        email = Email.objects.create(
            **validated_data
        )

        for attachment_id in selected_attachment_ids:

            attachment = Attachment.objects.get(
                id=attachment_id
            )

            EmailAttachment.objects.create(
                email=email,
                file=attachment.file
            )

        return email