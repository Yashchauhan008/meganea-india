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

export const recordQCForItem = (poId, itemId, qcData) => {
  return api.post(`/purchase-orders/${poId}/items/${itemId}/qc`, qcData);
};

// --- ADD THIS NEW FUNCTION ---
// @desc    Trigger the automatic generation of pallets for a PO
// @route   POST /api/purchase-orders/:id/generate-pallets
export const generatePalletsForPO = (poId) => {
  // This endpoint doesn't need a request body, just the ID in the URL
  return api.post(`/purchase-orders/${poId}/generate-pallets`);
};
