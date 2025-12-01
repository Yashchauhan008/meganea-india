import api from './api';

/**
 * Fetches the grouped factory stock data from the backend.
 */
export const getFactoryStock = () => {
  return api.get('/pallets/factory-stock');
};

/**
 * Manually creates a single pallet.
 */
export const createManualPallet = (palletData) => {
  return api.post('/pallets/manual-adjustment', palletData);
};

/**
 * Deletes a single pallet by its ID.
 */
export const deletePallet = (palletId) => {
  return api.delete(`/pallets/pallet/${palletId}`);
};

/**
 * Fetches the detailed list of pallets for a specific tile at a factory.
 */
export const getPalletDetailsForTile = (factoryId, tileId) => {
  return api.get(`/pallets/details/${factoryId}/${tileId}`);
};

// --- THIS IS THE MISSING FUNCTION ---
/**
 * Updates the box count for a single pallet.
 * @param {string} palletId - The ID of the pallet to update.
 * @param {number} newBoxCount - The new box count.
 * @returns {Promise<object>} The server response.
 */
export const updatePalletBoxCount = (palletId, newBoxCount) => {
  return api.put(`/pallets/pallet/${palletId}`, { newBoxCount });
};
