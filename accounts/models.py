from django.contrib.auth.models import AbstractUser
from django.db import models

class Organisation(models.Model):
    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = [
        ('analyst', 'Analyst'),
        ('admin', 'Admin'),
        ('auditor', 'Auditor'),
    ]
    organisation = models.ForeignKey(
        Organisation, on_delete=models.CASCADE,
        null=True, blank=True, related_name='users'
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='analyst')

    def __str__(self):
        return f"{self.username} ({self.organisation})"