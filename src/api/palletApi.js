import api from './api';

// This function likely already exists
export const getFactoryStock = (factoryId) => {
  return api.get(`/pallets/factory-stock/${factoryId}`);
};

// --- THIS IS THE NEW FUNCTION THE MODAL NEEDS ---
// It gets all available pallets regardless of factory.
export const getAllAvailablePallets = () => {
  return api.get('/pallets/available-stock');
};
// --- END OF NEW FUNCTION ---

export const getAvailablePalletsByFactory = (factoryId) => {
  return api.get(`/pallets/available/${factoryId}`);
};

export const getPalletDetailsForTile = (tileId) => {
  return api.get(`/pallets/details-for-tile/${tileId}`);
};

export const createManualPallet = (palletData) => {
  return api.post('/pallets/manual', palletData);
};

export const updatePalletBoxCount = (palletId, boxCount) => {
  return api.patch(`/pallets/${palletId}/box-count`, { boxCount });
};

export const deletePallet = (palletId) => {
  return api.delete(`/pallets/${palletId}`);
};
