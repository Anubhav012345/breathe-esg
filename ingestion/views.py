from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions, serializers, viewsets
from emissions.models import EmissionRecord
from .models import IngestionBatch
from .parsers import parse_sap, parse_utility, parse_travel
import traceback

SOURCE_PARSER_MAP = {
    'sap': parse_sap,
    'utility': parse_utility,
    'travel': parse_travel,
}

class IngestionBatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = IngestionBatch
        fields = '__all__'

class IngestionBatchViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = IngestionBatchSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return IngestionBatch.objects.filter(organisation=self.request.user.organisation)

class UploadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        file = request.FILES.get('file')
        source_type = request.data.get('source_type')

        if not file or not source_type:
            return Response({'error': 'file and source_type required'}, status=400)
        if source_type not in SOURCE_PARSER_MAP:
            return Response({'error': f'Invalid source_type. Choose: {list(SOURCE_PARSER_MAP.keys())}'}, status=400)

        batch = IngestionBatch.objects.create(
            organisation=request.user.organisation,
            source_type=source_type,
            filename=file.name,
            uploaded_by=request.user,
            status='processing',
        )

        try:
            parser = SOURCE_PARSER_MAP[source_type]
            records_data = parser(file, file.name)

            for rd in records_data:
                EmissionRecord.objects.create(
                    organisation=request.user.organisation,
                    source_type=source_type,
                    source_file=file.name,
                    ingested_by=request.user,
                    **rd
                )

            batch.total_rows = len(records_data)
            batch.success_rows = len([r for r in records_data if r['status'] != 'flagged'])
            batch.flagged_rows = len([r for r in records_data if r['status'] == 'flagged'])
            batch.status = 'done'
            batch.save()

            return Response({
                'batch_id': batch.id,
                'total': batch.total_rows,
                'success': batch.success_rows,
                'flagged': batch.flagged_rows,
                'message': f'Ingested {len(records_data)} records',
            }, status=201)

        except Exception as e:
            batch.status = 'failed'
            batch.error_message = traceback.format_exc()
            batch.save()
            return Response({'error': str(e)}, status=500)