from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0003_seed_variant_product'),
    ]

    operations = [
        # stock_status override field
        migrations.AddField(
            model_name='product',
            name='stock_status',
            field=models.CharField(
                max_length=20,
                choices=[
                    ('in_stock', 'In Stock'),
                    ('low_stock', 'Low Stock'),
                    ('sold_out', 'Sold Out'),
                ],
                default='in_stock',
            ),
        ),
        # discount fields
        migrations.AddField(
            model_name='product',
            name='discount_type',
            field=models.CharField(
                max_length=20,
                choices=[('percentage', 'Percentage'), ('fixed', 'Fixed Amount')],
                null=True, blank=True,
            ),
        ),
        migrations.AddField(
            model_name='product',
            name='discount_value',
            field=models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True),
        ),
        migrations.AddField(
            model_name='product',
            name='discount_start',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='product',
            name='discount_end',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='product',
            name='discount_active',
            field=models.BooleanField(default=False),
        ),
    ]
