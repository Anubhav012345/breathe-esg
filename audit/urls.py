from django.urls import path
from .views import ReviewView, LockForAuditView, DashboardStatsView

urlpatterns = [
    path('review/<int:pk>/', ReviewView.as_view()),
    path('lock/', LockForAuditView.as_view()),
    path('stats/', DashboardStatsView.as_view()),
]