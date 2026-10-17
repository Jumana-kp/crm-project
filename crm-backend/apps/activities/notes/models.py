from django.db import models
from django.conf import settings


class Note(models.Model):

    title = models.CharField(
        max_length=255
    )

    content = models.TextField()

    # User who created the note
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_notes"
    )

    # Note can belong to a Lead
    lead = models.ForeignKey(
        "leads.Lead",
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True
    )

    # Note can belong to a Deal
    deal = models.ForeignKey(
        "deals.Deal",
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True
    )

    # Note can belong to a Company
    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True
    )

    # Note can belong to a Ticket
    ticket = models.ForeignKey(
        "tickets.Ticket",
        on_delete=models.CASCADE,
        related_name="notes",
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def __str__(self):
        return self.title