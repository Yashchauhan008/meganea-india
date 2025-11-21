// frontend/src/api/purchaseOrderApi.js

import api from './api';

export const createPurchaseOrder = (poData) => {
  return api.post('/purchase-orders', poData);
};

export const getAllPurchaseOrders = () => {
  return api.get('/purchase-orders');
};

export const getPurchaseOrderById = (id) => {
  return api.get(`/purchase-orders/${id}`);
};

// --- ADD THIS NEW FUNCTION ---
// @desc    Update the status of a Purchase Order
// @route   PATCH /api/purchase-orders/:id/status
export const updatePOStatus = (id, newStatus) => {
  return api.patch(`/purchase-orders/${id}/status`, { status: newStatus });
};
