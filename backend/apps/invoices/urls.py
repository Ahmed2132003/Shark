from django.urls import path
from .views import AdminInvoiceListView, AdminInvoiceDetailView

urlpatterns = [
    path('admin/', AdminInvoiceListView.as_view(), name='admin-invoice-list'),
    path('admin/<int:pk>/', AdminInvoiceDetailView.as_view(), name='admin-invoice-detail'),
]