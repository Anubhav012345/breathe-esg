from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UploadView, IngestionBatchViewSet

router = DefaultRouter()
router.register('batches', IngestionBatchViewSet, basename='batch')

urlpatterns = [
    path('upload/', UploadView.as_view()),
    path('', include(router.urls)),
]