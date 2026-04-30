from rest_framework import serializers
from .models import Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = InvoiceItem
        fields = ['id', 'product_name', 'variant_name', 'unit_price', 'quantity', 'subtotal']


class InvoiceSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    items = InvoiceItemSerializer(many=True, read_only=True)

    class Meta:
        model = Invoice
        fields = [
            'id',
            'invoice_number',
            'status',
            'customer_name',
            'customer_phone',
            'customer_address',
            'customer_email',
            'subtotal',
            'discount',
            'tax',
            'total',
            'notes',
            'issued_at',
            'created_at',
            'updated_at',
            'order_id',
            'items',
        ]