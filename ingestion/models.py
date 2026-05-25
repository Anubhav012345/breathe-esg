from django.db import models
from accounts.models import Organisation, User

class IngestionBatch(models.Model):
    SOURCE_CHOICES = [
        ('sap', 'SAP'),
        ('utility', 'Utility'),
        ('travel', 'Travel'),
    ]
    STATUS_CHOICES = [
        ('processing', 'Processing'),
        ('done', 'Done'),
        ('failed', 'Failed'),
    ]

    organisation = models.ForeignKey(Organisation, on_delete=models.CASCADE)
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    filename = models.CharField(max_length=500)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='processing')
    total_rows = models.IntegerField(default=0)
    success_rows = models.IntegerField(default=0)
    failed_rows = models.IntegerField(default=0)
    flagged_rows = models.IntegerField(default=0)
    error_message = models.TextField(blank=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.organisation} | {self.source_type} | {self.filename}"