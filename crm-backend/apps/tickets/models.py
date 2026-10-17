from django.db import models

from apps.deals.models import Deal
from apps.users.models import User


class TicketStatus(models.TextChoices):
    OPEN = "Open", "Open"
    IN_PROGRESS = "In Progress", "In Progress"
    ON_HOLD = "On Hold", "On Hold"
    RESOLVED = "Resolved", "Resolved"
    CLOSED = "Closed", "Closed"


class TicketPriority(models.TextChoices):
    LOW = "Low", "Low"
    MEDIUM = "Medium", "Medium"
    HIGH = "High", "High"
    URGENT = "Urgent", "Urgent"


class TicketSource(models.TextChoices):
    EMAIL = "Email", "Email"
    PHONE = "Phone", "Phone"
    WEBSITE = "Website", "Website"
    CHAT = "Chat", "Chat"
    OTHER = "Other", "Other"


class Ticket(models.Model):

    ticket_name = models.CharField(
        max_length=255
    )

    description = models.TextField(
        blank=True
    )

    ticket_status = models.CharField(
        max_length=20,
        choices=TicketStatus.choices,
        default=TicketStatus.OPEN
    )

    source = models.CharField(
        max_length=20,
        choices=TicketSource.choices
    )

    priority = models.CharField(
        max_length=20,
        choices=TicketPriority.choices,
        default=TicketPriority.MEDIUM
    )

    ticket_owners = models.ManyToManyField(
        User,
        related_name="tickets",
        blank=True
    )

    associated_deal = models.ForeignKey(
        Deal,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="tickets"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        db_table = "tickets"
        ordering = ["-created_at"]
        verbose_name = "Ticket"
        verbose_name_plural = "Tickets"

    def __str__(self):
        return self.ticket_name