// FILE LOCATION: frontend/src/api/tileApi.js

import api from './api';

// Fetches all tiles with filters
export const getAllTiles = (params) => {
    return api.get('/tiles', { params });
};

// Fetches a single tile
export const getTileById = (id) => {
    return api.get(`/tiles/${id}`);
};

// Creates a new tile
export const createTile = (tileData) => {
    return api.post('/tiles', tileData);
};

// Updates a tile
export const updateTile = (id, tileData) => {
    return api.put(`/tiles/${id}`, tileData);
};

// Deletes a tile (soft delete)
export const deleteTile = (id) => {
    return api.delete(`/tiles/${id}`);
};

// Searches tiles for the booking form
export const searchTilesForBooking = (searchTerm) => {
  return api.get('/tiles/for-booking', { params: { search: searchTerm } });
};

// Get unique tile sizes
export const getUniqueSizes = () => {
    return api.get('/tiles/sizes');
};

// Bulk create tiles
export const bulkCreateTiles = (tiles) => {
    return api.post('/tiles/bulk', { tiles });
};

// Get tiles by factory
export const getTilesByFactory = (factoryId) => {
    return api.get(`/tiles/by-factory/${factoryId}`);
};

// NEW: Get detailed stock information for a tile
// Returns: factory stock by factory, transit stock, loaded stock
export const getTileStockDetails = (tileId) => {
    return api.get(`/tiles/${tileId}/stock-details`);
};