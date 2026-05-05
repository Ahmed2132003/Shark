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
    ProductVariantWriteSerializer, ProductVariantSerializer, ProductImageSerializer,
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
        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'variants__stock', 'variants__color', 'variants__size')


class ProductDetailView(generics.RetrieveAPIView):
    """تفاصيل منتج واحد بالـ slug"""
    serializer_class   = ProductDetailSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field       = 'slug'

    def get_queryset(self):
        return Product.objects.filter(is_active=True).prefetch_related(
            'images', 'variants__stock', 'variants__color', 'variants__size'
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
                Product.objects.filter(id__in=top_ids, is_active=True).select_related('category').prefetch_related('images', 'variants__stock', 'variants__color', 'variants__size'),
                key=lambda p: preserved.get(p.id, 9999)
            )

        return Product.objects.filter(is_active=True).select_related('category').prefetch_related('images', 'variants__stock', 'variants__color', 'variants__size').order_by('-created_at')[:5]


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
        return Product.objects.all().select_related('category').prefetch_related('images', 'variants__stock', 'variants__color', 'variants__size')

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

    @action(detail=True, methods=['get', 'post'], parser_classes=[MultiPartParser, FormParser])
    def images(self, request, pk=None):
        """List or upload one or more images for a product."""
        product = self.get_object()
        if request.method.lower() == 'get':
            return Response(ProductImageSerializer(product.images.all(), many=True, context={'request': request}).data)

        files = request.FILES.getlist('images') or request.FILES.getlist('image')
        if not files and request.FILES.get('image'):
            files = [request.FILES['image']]
        if not files:
            serializer = ProductImageSerializer(data=request.data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save(product=product)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        created = []
        base_order = product.images.count()
        is_primary_requested = request.data.get('is_primary', request.data.get('is_main', 'false')) in ['true', 'True', '1', True, 1]
        for index, file_obj in enumerate(files):
            image = ProductImage.objects.create(
                product=product,
                image=file_obj,
                alt_text=request.data.get('alt_text') or file_obj.name,
                is_primary=is_primary_requested and index == 0,
                order=request.data.get('order') or base_order + index,
            )
            created.append(image)
        return Response(ProductImageSerializer(created, many=True, context={'request': request}).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['delete', 'patch'], url_path=r'images/(?P<image_id>[^/.]+)')
    def image_detail(self, request, pk=None, image_id=None):
        """Update metadata for or delete a specific product image."""
        product = self.get_object()
        try:
            image = product.images.get(id=image_id)
        except ProductImage.DoesNotExist:
            return Response({'detail': 'Image not found.'}, status=status.HTTP_404_NOT_FOUND)
        if request.method.lower() == 'delete':
            image.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = ProductImageSerializer(image, data=request.data, partial=True, context={'request': request})
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    @action(detail=True, methods=['get', 'post'])
    def variants(self, request, pk=None):
        """List or add product variants."""
        product = self.get_object()
        if request.method.lower() == 'get':
            return Response(ProductVariantSerializer(product.variants.all(), many=True).data)
        serializer = ProductVariantWriteSerializer(data={**request.data, 'product': product.id})
        serializer.is_valid(raise_exception=True)
        variant = serializer.save()
        return Response(ProductVariantSerializer(variant).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['put', 'patch', 'delete'], url_path=r'variants/(?P<variant_id>[^/.]+)')
    def variant_detail(self, request, pk=None, variant_id=None):
        """Edit or delete a specific product variant."""
        product = self.get_object()
        try:
            variant = product.variants.get(id=variant_id)
        except ProductVariant.DoesNotExist:
            return Response({'detail': 'Variant not found.'}, status=status.HTTP_404_NOT_FOUND)
        if request.method.lower() == 'delete':
            variant.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)
        serializer = ProductVariantWriteSerializer(variant, data=request.data, partial=request.method.lower() == 'patch')
        serializer.is_valid(raise_exception=True)
        variant = serializer.save(product=product)
        return Response(ProductVariantSerializer(variant).data)

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