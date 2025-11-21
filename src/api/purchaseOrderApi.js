import api from './api';

export const createPurchaseOrder = (poData) => {
  return api.post('/purchase-orders', poData);
};

// --- ADD THIS NEW FUNCTION ---
export const getAllPurchaseOrders = () => {
  return api.get('/purchase-orders');
};