import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

export function getPreferredCartVariant(product) {
  if (!Array.isArray(product?.variants)) return null;
  return (
    product.variants.find((variant) => variant?.stock?.is_available) ||
    product.variants[0] ||
    null
  );
}

export function useAddToCartMutation({ onSuccess, onError } = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ variantId, quantity = 1 }) =>
      api.post('/cart/add/', { variant_id: variantId, quantity }),
    onSuccess: (...args) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      onSuccess?.(...args);
    },
    onError: (...args) => {
      onError?.(...args);
    },
  });
}