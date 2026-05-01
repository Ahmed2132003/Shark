from django.urls import path

from .order_controller import (
    CreateOrderView,
    MyOrdersView,
    OrderDetailView,
    CancelOrderView,
    AdminOrderListView,
    AdminOrderDetailView,
    AdminUpdateOrderStatusView,
    AdminOrderManageView,
    ShippingRegionListCreateView,
    ShippingRegionDetailView,
)
from .tracking_controller import TrackOrderView

urlpatterns = [
    path('', CreateOrderView.as_view(), name='order-create'),
    path('my/', MyOrdersView.as_view(), name='order-my-list'),
    path('my/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('my/<int:pk>/cancel/', CancelOrderView.as_view(), name='order-cancel'),
    path('track/<int:order_id>/', TrackOrderView.as_view(), name='order-track'),
    path('track-order/<int:order_id>/', TrackOrderView.as_view(), name='order-track-friendly'),
    path('admin/', AdminOrderListView.as_view(), name='admin-order-list'),
    path('admin/<int:pk>/', AdminOrderManageView.as_view(), name='admin-order-detail'),
    path('admin/<int:pk>/status/', AdminUpdateOrderStatusView.as_view(), name='admin-order-status'),
    path('shipping-regions/', ShippingRegionListCreateView.as_view(), name='shipping-region-list-create'),
    path('shipping-regions/<int:pk>/', ShippingRegionDetailView.as_view(), name='shipping-region-detail'),
]