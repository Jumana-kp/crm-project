from django.conf import settings
from django.db import models


class Meeting(models.Model):

    # Meeting information
    title = models.CharField(
        max_length=255
    )

    start_date = models.DateField()

    start_time = models.TimeField()

    end_time = models.TimeField()

    # User who created the meeting
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_meetings"
    )

    # Users attending the meeting
    attendees = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="meetings",
        blank=True
    )

    location = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    # Reminder
    REMINDER_CHOICES = (
        ("none", "None"),
        ("5", "5 minutes before"),
        ("10", "10 minutes before"),
        ("15", "15 minutes before"),
        ("30", "30 minutes before"),
        ("60", "1 hour before"),
        ("1440", "1 day before"),
    )

    reminder = models.CharField(
        max_length=10,
        choices=REMINDER_CHOICES,
        default="none"
    )

    note = models.TextField(
        blank=True,
        null=True
    )

    # CRM relationships
    lead = models.ForeignKey(
        "leads.Lead",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="meetings"
    )

    deal = models.ForeignKey(
        "deals.Deal",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="meetings"
    )

    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="meetings"
    )

    ticket = models.ForeignKey(
        "tickets.Ticket",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="meetings"
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
            "start_date",
            "start_time"
        ]

    def __str__(self):
        return self.title