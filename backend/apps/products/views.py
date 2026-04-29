from rest_framework import generics, viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import serializers
from .models import Category, Product, ProductVariant, ProductImage
from .serializers import (
    CategorySerializer,
    ProductListSerializer, ProductDetailSerializer, ProductWriteSerializer,
    ProductVariantWriteSerializer, ProductImageSerializer,
)
from .filters import ProductFilter


# ─── Public Views ──────────────────────────────────────────────────────────────

class CategoryListView(generics.ListAPIView):
    """كل التصنيفات الـ root (بدون parent)"""
    serializer_class   = CategorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Category.objects.filter(is_active=True, parent=None)


class ProductListView(generics.ListAPIView):
    """قائمة المنتجات مع Filter & Search"""
    serializer_class   = ProductListSerializer
    permission_classes = [permissions.AllowAny]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class    = ProductFilter
    search_fields      = ['name', 'description', 'category__name']
    ordering_fields    = ['base_price', 'created_at']
    ordering           = ['-created_at']

    def get_queryset(self):
        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images')


class ProductDetailView(generics.RetrieveAPIView):
    """تفاصيل منتج واحد بالـ slug"""
    serializer_class   = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field       = 'slug'

    def get_queryset(self):
        return Product.objects.filter(is_active=True).prefetch_related(
            'images', 'variants', 'variants__stock'
        )


class FeaturedProductsView(generics.ListAPIView):
    """Top ordered products, fallback to newest real products"""
    serializer_class   = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        from django.db.models import Sum
        from apps.orders.models import OrderItem

        top_ids = list(
            OrderItem.objects.filter(order__status__in=['delivered'])
            .values('variant__product_id')
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold')
            .values_list('variant__product_id', flat=True)[:5]
        )

        if top_ids:
            preserved = {pid: idx for idx, pid in enumerate(top_ids)}
            return sorted(
                Product.objects.filter(id__in=top_ids, is_active=True).select_related('category').prefetch_related('images'),
                key=lambda p: preserved.get(p.id, 9999)
            )

        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images').order_by('-created_at')[:5]


# ─── Admin Views (Dashboard) ───────────────────────────────────────────────────

class IsAdminOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role in ['admin', 'staff']


class AdminProductViewSet(viewsets.ModelViewSet):
    """CRUD كامل للمنتجات من الـ Dashboard"""
    permission_classes = [IsAdminOrStaff]
    filter_backends    = [DjangoFilterBackend, filters.SearchFilter]
    search_fields      = ['name', 'category__name']

    def get_queryset(self):
        # الـ Admin بيشوف كل المنتجات حتى الـ inactive
        return Product.objects.all().select_related('category').prefetch_related('images', 'variants')

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ProductWriteSerializer
        return ProductDetailSerializer

    @action(detail=True, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request, pk=None):
        """رفع صورة لمنتج معين"""
        product = self.get_object()
        serializer = ProductImageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(product=product)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_variant(self, request, pk=None):
        """إضافة variant لمنتج معين"""
        product = self.get_object()
        serializer = ProductVariantWriteSerializer(data={**request.data, 'product': product.id})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class AdminCategoryViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAdminOrStaff]
    queryset = Category.objects.all().order_by('-created_at')
    serializer_class = CategorySerializer

    def perform_create(self, serializer):
        name = serializer.validated_data.get('name', '').strip()
        if not name:
            raise serializers.ValidationError({'name': 'Name is required.'})
        serializer.save(name=name)