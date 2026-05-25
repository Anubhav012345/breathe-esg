from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import permissions
from django.utils import timezone
from emissions.models import EmissionRecord
from emissions.serializers import EmissionRecordSerializer

class ReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        try:
            record = EmissionRecord.objects.get(pk=pk, organisation=request.user.organisation)
        except EmissionRecord.DoesNotExist:
            return Response({'error': 'Not found'}, status=404)

        if record.locked_for_audit:
            return Response({'error': 'Record is locked for audit'}, status=400)

        action = request.data.get('action')
        if action == 'approve':
            record.status = 'approved'
        elif action == 'reject':
            record.status = 'rejected'
        elif action == 'flag':
            record.status = 'flagged'
            record.flag_reason = request.data.get('reason', '')
        else:
            return Response({'error': 'action must be approve/reject/flag'}, status=400)

        if request.data.get('edit_note'):
            record.edit_note = request.data['edit_note']
            record.is_edited = True

        record.reviewed_by = request.user
        record.reviewed_at = timezone.now()
        record.save()
        return Response(EmissionRecordSerializer(record).data)


class LockForAuditView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        qs = EmissionRecord.objects.filter(
            organisation=request.user.organisation,
            status='approved',
            locked_for_audit=False,
        )
        count = qs.update(locked_for_audit=True)
        return Response({'locked': count})


class DashboardStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        qs = EmissionRecord.objects.filter(organisation=request.user.organisation)
        approved_qs = qs.filter(status='approved')
        total_co2e = sum(r.co2e_kg or 0 for r in approved_qs)
        return Response({
            'total': qs.count(),
            'pending': qs.filter(status='pending').count(),
            'flagged': qs.filter(status='flagged').count(),
            'approved': approved_qs.count(),
            'rejected': qs.filter(status='rejected').count(),
            'locked': qs.filter(locked_for_audit=True).count(),
            'total_co2e_kg': total_co2e,
            'by_scope': {
                'scope1': qs.filter(scope='scope1').count(),
                'scope2': qs.filter(scope='scope2').count(),
                'scope3': qs.filter(scope='scope3').count(),
            },
            'by_source': {
                'sap': qs.filter(source_type='sap').count(),
                'utility': qs.filter(source_type='utility').count(),
                'travel': qs.filter(source_type='travel').count(),
            }
        })