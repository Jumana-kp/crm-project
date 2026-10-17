from django.conf import settings
from django.db import models


class Task(models.Model):

    TASK_TYPE_CHOICES = (
        ("to_do", "To Do"),
        ("follow_up", "Follow Up"),
        ("reminder", "Reminder"),
    )

    PRIORITY_CHOICES = (
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
    )

    STATUS_CHOICES = (
        ("pending", "Pending"),
        ("completed", "Completed"),
    )

    task_name = models.CharField(
        max_length=255
    )

    due_date = models.DateField()

    due_time = models.TimeField(
        null=True,
        blank=True
    )

    task_type = models.CharField(
        max_length=20,
        choices=TASK_TYPE_CHOICES,
        default="to_do"
    )

    priority = models.CharField(
        max_length=10,
        choices=PRIORITY_CHOICES,
        default="medium"
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_tasks"
    )

  

    assigned_to = models.ManyToManyField(
    settings.AUTH_USER_MODEL,
    blank=True,
    related_name="assigned_tasks"
    )
   

    note = models.TextField(
        null=True,
        blank=True
    )

    lead = models.ForeignKey(
        "leads.Lead",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="tasks"
    )

    deal = models.ForeignKey(
        "deals.Deal",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="tasks"
    )

    company = models.ForeignKey(
        "companies.Company",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="tasks"
    )

    ticket = models.ForeignKey(
        "tickets.Ticket",
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name="tasks"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            "due_date",
            "due_time"
        ]

    def __str__(self):
        return self.task_name