from decimal import Decimal
from django.db import migrations


def seed_variant_product(apps, schema_editor):
    Category = apps.get_model('products', 'Category')
    Product = apps.get_model('products', 'Product')
    ProductColor = apps.get_model('products', 'ProductColor')
    ProductSize = apps.get_model('products', 'ProductSize')
    ProductVariant = apps.get_model('products', 'ProductVariant')
    Stock = apps.get_model('products', 'Stock')

    category, _ = Category.objects.get_or_create(
        name='Variant Samples',
        defaults={'slug': 'variant-samples', 'description': 'Seed products with color and size variants.', 'is_active': True},
    )
    product, _ = Product.objects.get_or_create(
        slug='variant-sample-hoodie',
        defaults={
            'category': category,
            'name': 'Variant Sample Hoodie',
            'description': 'Seed product for testing multiple colors, sizes, images, and variant-specific price/stock/SKU.',
            'base_price': Decimal('50.00'),
            'has_variants': True,
            'is_active': True,
            'is_featured': False,
        },
    )
    product.has_variants = True
    product.save(update_fields=['has_variants'])

    colors = [
        ProductColor.objects.get_or_create(name='Red', defaults={'hex_code': '#FF0000'})[0],
        ProductColor.objects.get_or_create(name='Black', defaults={'hex_code': '#000000'})[0],
    ]
    sizes = [
        ProductSize.objects.get_or_create(name='M')[0],
        ProductSize.objects.get_or_create(name='L')[0],
    ]

    for color in colors:
        for size in sizes:
            variant, _ = ProductVariant.objects.get_or_create(
                product=product,
                color=color,
                size=size,
                defaults={
                    'name': f'{color.name} / {size.name}',
                    'sku': f'HOODIE-{color.name[:3].upper()}-{size.name}',
                    'price_override': None if size.name == 'M' else Decimal('55.00'),
                    'is_active': True,
                },
            )
            Stock.objects.update_or_create(variant=variant, defaults={'quantity': 10 if size.name == 'M' else 6})


def unseed_variant_product(apps, schema_editor):
    Product = apps.get_model('products', 'Product')
    Product.objects.filter(slug='variant-sample-hoodie').delete()


class Migration(migrations.Migration):

    dependencies = [
        ('products', '0002_productcolor_productsize_alter_productimage_options_and_more'),
    ]

    operations = [
        migrations.RunPython(seed_variant_product, unseed_variant_product),
    ]