from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Order


class TrackOrderView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request, order_id):
        try:
            order = Order.objects.prefetch_related('items').get(id=order_id)
        except Order.DoesNotExist:
            return Response({'detail': 'Order not found.'}, status=status.HTTP_404_NOT_FOUND)

        return Response(
            {
                'id': order.id,
                'status': order.get_status_display(),
                'shipping_name': order.shipping_name,
                'shipping_region': order.shipping_region,
                'total': order.total,
                'items': [
                    {
                        'product_name': item.product_name,
                        'variant_name': item.variant_name,
                        'quantity': item.quantity,
                        'price_at_order': item.price_at_order,
                    }
                    for item in order.items.all()
                ],
                'tracking_link': f'/track/{order.id}',                
            }
        )