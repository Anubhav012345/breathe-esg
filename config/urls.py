from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def api_root(request):
    return Response({
        'status': 'Breathe ESG API is running',
        'version': '1.0',
        'endpoints': {
            'auth': '/api/auth/',
            'emissions': '/api/emissions/',
            'ingestion': '/api/ingestion/',
            'audit': '/api/audit/',
            'admin': '/admin/',
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', api_root),
    path('api/auth/', include('accounts.urls')),
    path('api/ingestion/', include('ingestion.urls')),
    path('api/emissions/', include('emissions.urls')),
    path('api/audit/', include('audit.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)