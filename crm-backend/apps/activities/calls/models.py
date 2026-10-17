from django.conf import settings
from django.db import models


class Call(models.Model):

    # =========================================================
    # CALL OUTCOME
    # =========================================================

    CALL_OUTCOME_CHOICES = [
        ("connected", "Connected"),
        ("interested", "Interested"),
        ("not_interested", "Not Interested"),
        ("no_answer", "No Answer"),
        ("busy", "Busy"),
        ("wrong_number", "Wrong Number"),
        ("callback", "Callback"),
    ]

    # =========================================================
    # USER WHO CREATED / LOGGED THE CALL
    # =========================================================

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_calls",
    )

    # =========================================================
    # CRM MODULE RELATIONSHIPS
    # =========================================================

    lead = models.ForeignKey(
        "leads.Lead",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="calls",
    )

    deal = models.ForeignKey(
        "deals.Deal",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="calls",
    )

    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="calls",
    )

    ticket = models.ForeignKey(
        "tickets.Ticket",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="calls",
    )

    # =========================================================
    # CALL DETAILS
    # =========================================================

    # Outcome can initially be empty because the call is created
    # when Twilio starts. User can select the outcome later.
    call_outcome = models.CharField(
        max_length=30,
        choices=CALL_OUTCOME_CHOICES,
        null=True,
        blank=True,
    )

    # CRM call date
    call_date = models.DateField(
        null=True,
        blank=True,
    )

    # CRM call time
    call_time = models.TimeField(
        null=True,
        blank=True,
    )

    # User note
    note = models.TextField(
        blank=True,
        null=True,
    )

    # =========================================================
    # DURATION
    # =========================================================
    #
    # IMPORTANT:
    # Store duration in SECONDS.
    #
    # 125 seconds = 02:05
    #
    # Twilio returns duration in seconds.
    # =========================================================

    duration = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Call duration in seconds.",
    )

    # =========================================================
    # TWILIO DETAILS
    # =========================================================

    # Example:
    # CA1234567890abcdef
    call_sid = models.CharField(
        max_length=100,
        unique=True,
        null=True,
        blank=True,
    )

    # Examples:
    # queued
    # ringing
    # in-progress
    # completed
    # busy
    # failed
    # no-answer
    call_status = models.CharField(
        max_length=30,
        null=True,
        blank=True,
    )

    # Actual Twilio start time
    started_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    # Actual Twilio end time
    ended_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    # =========================================================
    # TIMESTAMPS
    # =========================================================

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    # =========================================================
    # META
    # =========================================================

    class Meta:
        ordering = [
            "-call_date",
            "-call_time",
            "-created_at",
        ]

    # =========================================================
    # STRING REPRESENTATION
    # =========================================================

    def __str__(self):

        if self.lead:
            return f"Call - Lead: {self.lead}"

        if self.deal:
            return f"Call - Deal: {self.deal}"

        if self.company:
            return f"Call - Company: {self.company}"

        if self.ticket:
            return f"Call - Ticket: {self.ticket}"

        if self.call_sid:
            return f"Call - {self.call_sid}"

        return f"Call #{self.id}"