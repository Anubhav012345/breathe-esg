from rest_framework import serializers
from .models import EmissionRecord

class EmissionRecordSerializer(serializers.ModelSerializer):
    source_type_display = serializers.CharField(source='get_source_type_display', read_only=True)
    scope_display = serializers.CharField(source='get_scope_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reviewed_by_username = serializers.CharField(source='reviewed_by.username', read_only=True)
    ingested_by_username = serializers.CharField(source='ingested_by.username', read_only=True)

    class Meta:
        model = EmissionRecord
        fields = '__all__'
        read_only_fields = ['organisation', 'ingested_at', 'ingested_by', 'locked_for_audit']