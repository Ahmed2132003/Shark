from rest_framework import generics, permissions
from .models import Invoice
from .serializers import InvoiceSerializer


class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'staff']


class AdminInvoiceListView(generics.ListAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):
        return Invoice.objects.select_related('order').prefetch_related('items', 'order__items').all()
    

class AdminInvoiceDetailView(generics.RetrieveAPIView):
    serializer_class = InvoiceSerializer
    permission_classes = [IsAdminOrStaff]

    def get_queryset(self):
        return Invoice.objects.select_related('order').prefetch_related('items', 'order__items').all()
    