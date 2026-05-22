"""
backend/apps/products/admin.py — UPDATED to include discount and stock_status
"""
from django.contrib import admin
from .models import Category, Product, ProductVariant, Stock, ProductImage


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductVariantInline(admin.TabularInline):
    model = ProductVariant
    extra = 1


class StockInline(admin.StackedInline):
    model = Stock
    can_delete = False


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'parent', 'is_active', 'created_at']
    list_filter = ['is_active', 'parent']
    search_fields = ['name']
    prepopulated_fields = {'slug': ('name',)}


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'category', 'base_price', 'stock_status',
        'discount_active', 'discounted_price', 'is_active', 'is_featured',
    ]
    list_filter = ['is_active', 'is_featured', 'category', 'stock_status', 'discount_active']
    search_fields = ['name', 'description']
    prepopulated_fields = {'slug': ('name',)}
    inlines = [ProductImageInline, ProductVariantInline]

    fieldsets = (
        ('Basic Info', {
            'fields': ('name', 'slug', 'category', 'description', 'base_price', 'has_variants', 'is_active', 'is_featured')
        }),
        ('Stock Status', {
            'fields': ('stock_status',),
            'description': 'Manual override for stock status. "Sold Out" blocks purchases regardless of actual stock quantity.',
        }),
        ('Discount', {
            'fields': ('discount_active', 'discount_type', 'discount_value', 'discount_start', 'discount_end'),
            'classes': ('collapse',),
        }),
    )

    def discounted_price(self, obj):
        if obj.discount_is_active:
            return f"{obj.discounted_price} ({obj.discount_percentage}% off)"
        return "-"
    discounted_price.short_description = 'Discounted Price'


@admin.register(ProductVariant)
class ProductVariantAdmin(admin.ModelAdmin):
    list_display = ['product', 'name', 'sku', 'price', 'is_active']
    list_filter = ['is_active']
    search_fields = ['sku', 'name']
    inlines = [StockInline]


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ['variant', 'quantity', 'is_low_stock', 'is_available', 'updated_at']
    list_filter = ['quantity']
