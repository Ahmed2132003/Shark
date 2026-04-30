import api from './api';

export const getShippingRegions = () => api.get('/orders/shipping-regions/').then((r) => r.data);
export const createShippingRegion = (payload) => api.post('/orders/shipping-regions/', payload).then((r) => r.data);
export const updateShippingRegion = (id, payload) => api.put(`/orders/shipping-regions/${id}/`, payload).then((r) => r.data);
export const deleteShippingRegion = (id) => api.delete(`/orders/shipping-regions/${id}/`).then((r) => r.data);