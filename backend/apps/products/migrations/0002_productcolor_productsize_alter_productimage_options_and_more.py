from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ProductColor",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=80, unique=True)),
                ("hex_code", models.CharField(blank=True, max_length=7, null=True)),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.CreateModel(
            name="ProductSize",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                ("name", models.CharField(max_length=80, unique=True)),
            ],
            options={
                "ordering": ["name"],
            },
        ),
        migrations.AlterModelOptions(
            name="productimage",
            options={"ordering": ["order", "id"]},
        ),
        migrations.RenameField(
            model_name="productimage",
            old_name="is_main",
            new_name="is_primary",
        ),
        migrations.AddField(
            model_name="product",
            name="has_variants",
            field=models.BooleanField(default=False),
        ),
        migrations.AlterField(
            model_name="productvariant",
            name="name",
            field=models.CharField(blank=True, default="Default", max_length=100),
        ),
        migrations.AlterField(
            model_name="productvariant",
            name="sku",
            field=models.CharField(blank=True, max_length=100, null=True, unique=True),
        ),
        migrations.AddField(
            model_name="productvariant",
            name="color",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="variants",
                to="products.productcolor",
            ),
        ),
        migrations.AddField(
            model_name="productvariant",
            name="size",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="variants",
                to="products.productsize",
            ),
        ),
        migrations.AddConstraint(
            model_name="productvariant",
            constraint=models.UniqueConstraint(
                fields=("product", "color", "size"),
                name="unique_product_color_size_variant",
            ),
        ),
    ]