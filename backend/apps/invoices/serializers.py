from rest_framework import serializers
from .models import Invoice, InvoiceItem


class InvoiceItemSerializer(serializers.ModelSerializer):
    subtotal = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = InvoiceItem
        fields = ['id', 'product_name', 'variant_name', 'unit_price', 'quantity', 'subtotal']


class InvoiceSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source='order.id', read_only=True)
    subtotal = serializers.SerializerMethodField()
    shipping = serializers.SerializerMethodField()
    tax = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    items = serializers.SerializerMethodField()

    def _order_value_or_invoice_fallback(self, obj, order_field, invoice_field):
        if obj.order and hasattr(obj.order, order_field):
            value = getattr(obj.order, order_field)
            if value is not None:
                return value
        return getattr(obj, invoice_field)

    def get_subtotal(self, obj):
        return self._order_value_or_invoice_fallback(obj, 'subtotal', 'subtotal')

    def get_shipping(self, obj):
        return self._order_value_or_invoice_fallback(obj, 'shipping_fee', 'shipping')

    def get_tax(self, obj):
        return self._order_value_or_invoice_fallback(obj, 'tax', 'tax')

    def get_total(self, obj):
        return self._order_value_or_invoice_fallback(obj, 'total', 'total')

    def get_items(self, obj):
        if not obj.order:
            return []
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