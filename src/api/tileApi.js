import api from './api';

// Fetches all tiles with filters. This now returns populated factory data.
export const getAllTiles = (params) => {
    return api.get('/tiles', { params });
};

// Fetches a single tile. This also returns populated factory data.
export const getTileById = (id) => {
    return api.get(`/tiles/${id}`);
};

// Creates a new tile. The `tileData` object will now include the `manufacturingFactories` array.
export const createTile = (tileData) => {
    return api.post('/tiles', tileData);
};

// Updates a tile. The `tileData` object will also include the `manufacturingFactories` array.
export const updateTile = (id, tileData) => {
    return api.put(`/tiles/${id}`, tileData);
};

// Deletes a tile (soft delete). No changes needed here.
export const deleteTile = (id) => {
    return api.delete(`/tiles/${id}`);
};

// Searches tiles for the booking form. No changes needed here.
export const searchTilesForBooking = (searchTerm) => {
  return api.get('/tiles/for-booking', { params: { search: searchTerm } });
};

export const getUniqueSizes = () => {
    return api.get('/tiles/sizes');
};

export const bulkCreateTiles = (tiles) => {
    // The payload is an object with a 'tiles' key containing the array
    return api.post('/tiles/bulk', { tiles });
  };

  export const getTilesByFactory = (factoryId) => {
    return api.get(`/tiles/by-factory/${factoryId}`);
  };