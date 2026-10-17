import uuid

from django.db import models
from django.contrib.auth.models import AbstractUser
from .managers import UserManager
from django.utils import timezone
from datetime import timedelta


class User(AbstractUser):

    username = None

    email = models.EmailField(unique=True)

    first_name = models.CharField(max_length=100)

    last_name = models.CharField(max_length=100)

    phone_number = models.CharField(
        max_length=15,
        blank=True,
        null=True
    )

    ROLE_CHOICES = (
        ("admin", "Admin"),
        ("manager", "Manager"),
        ("sales", "Sales"),
        ("support", "Support"),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="sales"
    )

    # Company Information
    company_name = models.CharField(
        max_length=150,
        blank=True,
        null=True
    )

    country = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )

    industry_type = models.CharField(
        max_length=100,
        blank=True,
        null=True
    )


    # Password Reset Fields

    reset_token = models.UUIDField(
        unique=True,
        null=True,
        blank=True
    )

    reset_token_expiry = models.DateTimeField(
        null=True,
        blank=True
    )


    USERNAME_FIELD = "email"

    REQUIRED_FIELDS = []
    
    objects = UserManager()


    def __str__(self):
        return self.email