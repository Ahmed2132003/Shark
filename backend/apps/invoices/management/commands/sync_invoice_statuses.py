from django.core.management.base import BaseCommand
from apps.invoices.signals import sync_invoice_status_with_order
from apps.invoices.models import Invoice


class Command(BaseCommand):
    help = 'Sync all invoice statuses with their related order statuses.'

    def handle(self, *args, **options):
        updated = 0
        for invoice in Invoice.objects.select_related('order').all():
            previous = invoice.status
            sync_invoice_status_with_order(invoice.order)
            invoice.refresh_from_db(fields=['status'])
            if invoice.status != previous:
                updated += 1

        self.stdout.write(self.style.SUCCESS(f'Synced invoice statuses. Updated: {updated}'))