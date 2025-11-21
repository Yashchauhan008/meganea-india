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

export const updatePOStatus = (id, newStatus) => {
  return api.patch(`/purchase-orders/${id}/status`, { status: newStatus });
};

// --- ADD THIS NEW FUNCTION ---
// @desc    Record a QC result for a PO item
// @route   POST /api/purchase-orders/:poId/items/:itemId/qc
export const recordQCForItem = (poId, itemId, qcData) => {
  return api.post(`/purchase-orders/${poId}/items/${itemId}/qc`, qcData);
};
