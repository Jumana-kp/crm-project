from django.db import models
from django.conf import settings

from apps.leads.models import Lead


class Deal(models.Model):


    STAGE_CHOICES = [

        ("new", "New"),
        ("qualified", "Qualified"),
        ("proposal", "Proposal"),
        ("negotiation", "Negotiation"),
        ("closed_won", "Closed Won"),
        ("closed_lost", "Closed Lost"),

    ]


    PRIORITY_CHOICES = [

        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),

    ]


    deal_name = models.CharField(
        max_length=255
    )


    lead = models.ForeignKey(
        Lead,
        on_delete=models.CASCADE,
        related_name="deals"
    )


    # Multiple Deal Owners
    owners = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name="assigned_deals",
        blank=True
    )


    amount = models.DecimalField(
        max_digits=12,
        decimal_places=2
    )


    stage = models.CharField(
        max_length=50,
        choices=STAGE_CHOICES
    )


    close_date = models.DateField()


    priority = models.CharField(
        max_length=20,
        choices=PRIORITY_CHOICES
    )


    created_at = models.DateTimeField(
        auto_now_add=True
    )


    updated_at = models.DateTimeField(
        auto_now=True
    )


    class Meta:
     db_table = "deals"
     ordering = ["-created_at"]
     verbose_name = "Deal"
     verbose_name_plural = "Deals"


    def __str__(self):

        return self.deal_name
