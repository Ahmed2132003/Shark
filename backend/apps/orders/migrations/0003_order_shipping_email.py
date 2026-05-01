from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("orders", "0002_shippingregion_order_shipping_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="order",
            name="shipping_email",
            field=models.EmailField(blank=True, default="", max_length=254),
        ),
    ]