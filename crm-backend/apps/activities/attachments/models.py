from django.conf import settings
from django.core.exceptions import ValidationError
from django.db import models


class Attachment(models.Model):

    # Attachment information
    file = models.FileField(
        upload_to="attachments/"
    )

    file_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    file_size = models.PositiveBigIntegerField(
        null=True,
        blank=True
    )

    # User who uploaded the attachment
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_attachments"
    )

    # CRM relationships
    lead = models.ForeignKey(
        "leads.Lead",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="attachments"
    )

    deal = models.ForeignKey(
        "deals.Deal",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="attachments"
    )

    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="attachments"
    )

    ticket = models.ForeignKey(
        "tickets.Ticket",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="attachments"
    )

    # Timestamps
    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            "-created_at"
        ]

    def clean(self):

        related_objects = [
            self.lead,
            self.deal,
            self.company,
            self.ticket,
        ]

        if sum(
            obj is not None
            for obj in related_objects
        ) != 1:

            raise ValidationError(
                "Attachment must be associated with exactly one "
                "Lead, Deal, Company, or Ticket."
            )

    def save(self, *args, **kwargs):

        if self.file:

            if not self.file_name:
                self.file_name = self.file.name

            if self.file_size is None:
                self.file_size = self.file.size

        self.full_clean()

        super().save(
            *args,
            **kwargs
        )

    def __str__(self):

        return self.file_name or self.file.name