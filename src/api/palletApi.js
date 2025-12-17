import api from './api';

/**
 * Get all factory stock (summary view of all factories combined)
 */
export const getAllFactoryStock = () => {
  return api.get('/pallets/all-factory-stock');
};

/**
 * Get stock for a specific factory with detailed breakdown
 */
export const getFactoryStock = (factoryId) => {
  if (!factoryId) {
    return Promise.reject(new Error('Factory ID is undefined'));
  }
  return api.get(`/pallets/factory-stock/${factoryId}`);
};

/**
 * Get aggregated stock summary for a specific factory
 */
export const getFactoryStockSummary = (factoryId) => {
  if (!factoryId) {
    return Promise.reject(new Error('Factory ID is undefined'));
  }
  return api.get(`/pallets/factory-stock-summary/${factoryId}`);
};

/**
 * Get all available pallets from all factories
 */
export const getAllAvailablePallets = () => {
  return api.get('/pallets/available-stock');
};

/**
 * Get available pallets for a specific factory
 */
export const getAvailablePalletsByFactory = (factoryId) => {
  return api.get(`/pallets/available/${factoryId}`);
};

/**
 * Get detailed pallet information for a specific tile at a factory
 */
export const getPalletDetailsForTile = (factoryId, tileId) => {
  return api.get(`/pallets/details/${factoryId}/${tileId}`);
};

/**
 * Create a manual pallet adjustment
 */
export const createManualPallet = (palletData) => {
  return api.post('/pallets/manual-adjustment', palletData);
};

/**
 * Update pallet box count
 */
export const updatePalletBoxCount = (palletId, newBoxCount) => {
  return api.put(`/pallets/${palletId}`, { newBoxCount });
};

/**
 * Delete a pallet
 */
export const deletePallet = (palletId) => {
  return api.delete(`/pallets/${palletId}`);
};
