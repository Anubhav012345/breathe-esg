from rest_framework import viewsets, permissions, filters
from django_filters.rest_framework import DjangoFilterBackend
from .models import EmissionRecord
from .serializers import EmissionRecordSerializer

class EmissionRecordViewSet(viewsets.ModelViewSet):
    serializer_class = EmissionRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source_type', 'scope', 'status', 'category']
    search_fields = ['category', 'location', 'source_file']
    ordering_fields = ['ingested_at', 'period_start', 'co2e_kg']

    def get_queryset(self):
        return EmissionRecord.objects.filter(
            organisation=self.request.user.organisation
        )