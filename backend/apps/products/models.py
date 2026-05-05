from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='categories/', null=True, blank=True)
    parent = models.ForeignKey(
        'self', on_delete=models.SET_NULL,
        null=True, blank=True, related_name='subcategories'
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'Categories'
        ordering = ['name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    category = models.ForeignKey(
        Category, on_delete=models.SET_NULL,
        null=True, related_name='products'
    )
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True, blank=True)
    description = models.TextField(blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    has_variants = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_featured = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def main_image(self):
        main_img = self.images.filter(is_primary=True).first()
        if main_img:
            return main_img.image.url

        fallback_img = self.images.first()
        return fallback_img.image.url if fallback_img else None

    @property
    def in_stock(self):
        return self.variants.filter(is_active=True, stock__quantity__gt=0).exists()

    def __str__(self):
        return self.name


class ProductColor(models.Model):
    name = models.CharField(max_length=80, unique=True)
    hex_code = models.CharField(max_length=7, blank=True, null=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ProductSize(models.Model):
    name = models.CharField(max_length=80, unique=True)

    class Meta:
        ordering = ['name']

    def __str__(self):
        return self.name


class ProductVariant(models.Model):
    """Product sellable option. Simple products keep one default variant."""
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='variants'
    )
    name = models.CharField(max_length=100, blank=True, default='Default')
    color = models.ForeignKey(
        ProductColor, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='variants'
    )
    size = models.ForeignKey(
        ProductSize, on_delete=models.SET_NULL,
        null=True, blank=True, related_name='variants'
    )
    sku = models.CharField(max_length=100, unique=True, null=True, blank=True)
    price_override = models.DecimalField(
        max_digits=10, decimal_places=2,
        null=True, blank=True
    )
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['product', 'color', 'size'],
                name='unique_product_color_size_variant'
            )
        ]

    @property
    def price(self):
        return self.price_override if self.price_override is not None else self.product.base_price

    def save(self, *args, **kwargs):
        if not self.name or self.name == 'Default':
            parts = [part for part in [self.color.name if self.color_id else '', self.size.name if self.size_id else ''] if part]
            self.name = ' / '.join(parts) if parts else 'Default'
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} — {self.name}"


class Stock(models.Model):
    variant = models.OneToOneField(
        ProductVariant, on_delete=models.CASCADE, related_name='stock'
    )
    quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=5)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_low_stock(self):
        return self.quantity <= self.low_stock_threshold

    @property
    def is_available(self):
        return self.quantity > 0

    def __str__(self):
        return f"Stock: {self.variant} — {self.quantity} units"


class ProductImage(models.Model):
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='images'
    )
    image = models.ImageField(upload_to='products/')
    alt_text = models.CharField(max_length=200, blank=True)
    is_primary = models.BooleanField(default=False)
    order = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']

    @property
    def is_main(self):
        return self.is_primary

    @is_main.setter
    def is_main(self, value):
        self.is_primary = value

    def save(self, *args, **kwargs):
        if self.is_primary:
            ProductImage.objects.filter(
                product=self.product, is_primary=True
            ).exclude(pk=self.pk).update(is_primary=False)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"Image for {self.product.name}"