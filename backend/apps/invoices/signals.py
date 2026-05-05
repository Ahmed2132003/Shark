from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.orders.models import Order, OrderItem
from .models import Invoice, InvoiceItem


ORDER_TO_INVOICE_STATUS = {
    'pending': 'draft',
    'confirmed': 'processing',
    'shipped': 'sent',
    'delivered': 'paid',
    'cancelled': 'cancelled',
}


def sync_invoice_status_with_order(order):
    try:
        invoice = order.invoice
    except Invoice.DoesNotExist:
        return

    mapped_status = ORDER_TO_INVOICE_STATUS.get(order.status, 'draft')
    if invoice.status != mapped_status:
        invoice.status = mapped_status
        invoice.save(update_fields=['status', 'updated_at'])


@receiver(post_save, sender=Order)
def create_invoice_on_order(sender, instance, created, **kwargs):
    """
    لما Order جديدة تتعمل → اعمل Invoice draft تلقائياً
    مع snapshot من بيانات العميل والعناصر
    """
    if not created:
        return

    # تأكد مفيش invoice موجودة (لو اتعملت يدوياً)
    if hasattr(instance, 'invoice'):
        return

    invoice = Invoice.objects.create(
        order=instance,
        customer_name=instance.shipping_name,
        customer_phone=instance.shipping_phone,
        customer_address=instance.shipping_address,
        customer_email=instance.customer.email if instance.customer else '',
        subtotal=instance.total - instance.shipping_fee,
        shipping=instance.shipping_fee,
        total=instance.total,
        status=ORDER_TO_INVOICE_STATUS.get(instance.status, 'draft'),
    )
    
    # نسخ عناصر الأوردر للفاتورة
    for item in instance.items.all():
        InvoiceItem.objects.create(
            invoice=invoice,
            product_name=item.product_name,
            variant_name=item.variant_name,
            unit_price=item.price_at_order,
            quantity=item.quantity,
        )


@receiver(post_save, sender=OrderItem)
def update_invoice_on_item_add(sender, instance, created, **kwargs):
    """لما item يتضاف للأوردر → حدّث الـ Invoice"""
    if not created:
        return

    try:
        invoice = instance.order.invoice
        InvoiceItem.objects.get_or_create(
            invoice=invoice,
            product_name=instance.product_name,
            variant_name=instance.variant_name,
            unit_price=instance.price_at_order,
            quantity=instance.quantity,
        )
        invoice.calculate_totals()
    except Invoice.DoesNotExist:
        pass

@receiver(post_save, sender=Order)
def sync_invoice_on_order_status_change(sender, instance, created, **kwargs):
    if created:
        return
    sync_invoice_status_with_order(instance)