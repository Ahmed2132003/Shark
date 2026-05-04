from rest_framework import serializers
from .models import Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = InvoiceItem
        fields = ['id', 'product_name', 'variant_name', 'unit_price', 'quantity', 'subtotal']


class InvoiceSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    items = serializers.SerializerMethodField()

    def get_items(self, obj):
        invoice_items = obj.items.all()
        if invoice_items.exists():
            return InvoiceItemSerializer(invoice_items, many=True).data

        return [
            {
                'id': f"order-item-{item.id}",
                'product_name': item.product_name,
                'variant_name': item.variant_name,
                'unit_price': item.price_at_order,
                'quantity': item.quantity,
                'subtotal': item.subtotal,
            }
            for item in obj.order.items.all()
        ]
        
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
            'shipping',
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