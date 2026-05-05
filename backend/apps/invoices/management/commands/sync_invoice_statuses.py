from django.core.management.base import BaseCommand
from apps.invoices.models import Invoice
from apps.orders.models import Order


ORDER_TO_INVOICE_STATUS = {
    'pending': 'draft',
    'processing': 'processing',
    'shipped': 'sent',
    'delivered': 'paid',
    'cancelled': 'cancelled',
}


class Command(BaseCommand):
    help = 'Sync all invoice statuses with their related order statuses.'

    def handle(self, *args, **options):
        updated = 0

        for invoice in Invoice.objects.all():
            order = Order.objects.filter(id=invoice.order_id).only('status').first()
            if not order:
                continue

            mapped_status = ORDER_TO_INVOICE_STATUS.get(order.status, 'draft')
            if invoice.status != mapped_status:
                invoice.status = mapped_status
                invoice.save(update_fields=['status', 'updated_at'])
                updated += 1

        self.stdout.write(self.style.SUCCESS(f'Synced invoice statuses. Updated: {updated}'))