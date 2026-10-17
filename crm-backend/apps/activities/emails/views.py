from django.conf import settings
from django.core.mail import EmailMessage
from django.utils import timezone

from rest_framework import generics, status
from rest_framework.permissions import (
    DjangoModelPermissions,
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView
from apps.activities.attachments.models import Attachment

from .models import Email, EmailAttachment
from .serializers import (
    EmailSerializer,
    EmailAttachmentSerializer,
)


class EmailListCreateView(generics.ListCreateAPIView):

    serializer_class = EmailSerializer

    permission_classes = [
        DjangoModelPermissions
    ]

    filterset_fields = [
        "status",
        "lead",
        "deal",
        "company",
        "ticket",
        "sent_by",
    ]

    search_fields = [
        "subject",
        "body",
    ]

    ordering_fields = [
        "subject",
        "status",
        "created_at",
        "updated_at",
        "sent_at",
    ]

    ordering = [
        "-created_at"
    ]

    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return (
                Email.objects
                .select_related(
                    "sent_by",
                    "lead",
                    "deal",
                    "company",
                    "ticket"
                )
                .all()
            )

        return (
            Email.objects
            .select_related(
                "sent_by",
                "lead",
                "deal",
                "company",
                "ticket"
            )
            .filter(
                sent_by=user
            )
        )

    def perform_create(self, serializer):

        serializer.save(
            sent_by=self.request.user
        )


class EmailDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = EmailSerializer

    permission_classes = [
        DjangoModelPermissions
    ]

    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return (
                Email.objects
                .select_related(
                    "sent_by",
                    "lead",
                    "deal",
                    "company",
                    "ticket"
                )
                .all()
            )

        return (
            Email.objects
            .select_related(
                "sent_by",
                "lead",
                "deal",
                "company",
                "ticket"
            )
            .filter(
                sent_by=user
            )
        )


class EmailAttachmentListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = EmailAttachmentSerializer

    permission_classes = [
        DjangoModelPermissions
    ]

    filterset_fields = [
        "email",
    ]

    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return (
                EmailAttachment.objects
                .select_related(
                    "email",
                    "email__sent_by"
                )
                .all()
            )

        return (
            EmailAttachment.objects
            .select_related(
                "email",
                "email__sent_by"
            )
            .filter(
                email__sent_by=user
            )
        )


class EmailAttachmentDetailView(
    generics.RetrieveUpdateDestroyAPIView
):

    serializer_class = EmailAttachmentSerializer

    permission_classes = [
        DjangoModelPermissions
    ]

    def get_queryset(self):

        user = self.request.user

        if user.role == "admin":
            return (
                EmailAttachment.objects
                .select_related(
                    "email",
                    "email__sent_by"
                )
                .all()
            )

        return (
            EmailAttachment.objects
            .select_related(
                "email",
                "email__sent_by"
            )
            .filter(
                email__sent_by=user
            )
        )
    


class SendEmailView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request, pk):

        try:
            email = Email.objects.get(
                pk=pk,
                sent_by=request.user
            )

        except Email.DoesNotExist:

            return Response(
                {
                    "detail": "Email not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if email.status == "sent":

            return Response(
                {
                    "detail": "Email has already been sent."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        # ==========================================
        # CONVERT RECIPIENTS / CC / BCC TO LISTS
        # ==========================================

        recipients = email.recipients
        cc = email.cc
        bcc = email.bcc

        if isinstance(recipients, str):
            recipients = [
                r.strip()
                for r in recipients.split(",")
                if r.strip()
            ]

        if isinstance(cc, str):
            cc = [
                r.strip()
                for r in cc.split(",")
                if r.strip()
            ]

        if isinstance(bcc, str):
            bcc = [
                r.strip()
                for r in bcc.split(",")
                if r.strip()
            ]

        # ==========================================
        # CREATE EMAIL MESSAGE
        # ==========================================

        message = EmailMessage(
            subject=email.subject,
            body=email.body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            to=recipients,
            cc=cc,
            bcc=bcc,
        )

        # IMPORTANT:
        # Tiptap stores the email body as HTML.
        message.content_subtype = "html"

        # ==========================================
        # ADD ATTACHMENTS
        # ==========================================

        for attachment in email.attachments.all():

            with attachment.file.open("rb") as file:

                filename = attachment.file.name.split("/")[-1]

                message.attach(
                    filename,
                    file.read()
                )

        # ==========================================
        # SEND EMAIL
        # ==========================================

        try:

            message.send(
                fail_silently=False
            )

            email.status = "sent"
            email.sent_at = timezone.now()

            email.save(
                update_fields=[
                    "status",
                    "sent_at"
                ]
            )

            return Response(
                {
                    "message": "Email sent successfully.",
                    "email_id": email.id,
                    "status": email.status
                },
                status=status.HTTP_200_OK
            )

        except Exception as e:

            email.status = "failed"

            email.save(
                update_fields=[
                    "status"
                ]
            )

            return Response(
                {
                    "message": "Failed to send email.",
                    "error": str(e)
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )