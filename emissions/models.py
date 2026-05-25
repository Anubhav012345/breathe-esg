from django.db import models
from accounts.models import Organisation, User

class EmissionRecord(models.Model):
    SCOPE_CHOICES = [
        ('scope1', 'Scope 1'),
        ('scope2', 'Scope 2'),
        ('scope3', 'Scope 3'),
    ]
    SOURCE_CHOICES = [
        ('sap', 'SAP Fuel/Procurement'),
        ('utility', 'Utility/Electricity'),
        ('travel', 'Corporate Travel'),
    ]
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('flagged', 'Flagged'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ]

    organisation = models.ForeignKey(Organisation, on_delete=models.CASCADE, related_name='emission_records')
    source_type = models.CharField(max_length=20, choices=SOURCE_CHOICES)
    source_file = models.CharField(max_length=500, blank=True)
    source_row = models.IntegerField(null=True, blank=True)
    ingested_at = models.DateTimeField(auto_now_add=True)
    ingested_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='ingested_records')

    scope = models.CharField(max_length=10, choices=SCOPE_CHOICES)
    category = models.CharField(max_length=100)

    raw_quantity = models.FloatField()
    raw_unit = models.CharField(max_length=50)
    normalized_quantity = models.FloatField()
    normalized_unit = models.CharField(max_length=20, default='kg_co2e')

    period_start = models.DateField()
    period_end = models.DateField()
    location = models.CharField(max_length=255, blank=True)

    emission_factor = models.FloatField(null=True, blank=True)
    emission_factor_source = models.CharField(max_length=100, blank=True)
    co2e_kg = models.FloatField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    flag_reason = models.TextField(blank=True)
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_records')
    reviewed_at = models.DateTimeField(null=True, blank=True)

    is_edited = models.BooleanField(default=False)
    edit_note = models.TextField(blank=True)
    locked_for_audit = models.BooleanField(default=False)

    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ['-ingested_at']

    def __str__(self):
        return f"{self.organisation} | {self.source_type} | {self.category} | {self.period_start}"