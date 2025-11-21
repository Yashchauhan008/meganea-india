import api from './api'; // The central axios instance

// @desc    Get all factories
// @route   GET /api/factories
export const getAllFactories = () => {
  return api.get('/factories');
};

// @desc    Get a single factory by its ID
// @route   GET /api/factories/:id
export const getFactoryById = (id) => {
  return api.get(`/factories/${id}`);
};

// @desc    Create a new factory
// @route   POST /api/factories
export const createFactory = (factoryData) => {
  return api.post('/factories', factoryData);
};

// @desc    Update an existing factory
// @route   PUT /api/factories/:id
export const updateFactory = (id, factoryData) => {
  return api.put(`/factories/${id}`, factoryData);
};

// @desc    Soft delete a factory
// @route   DELETE /api/factories/:id
export const deleteFactory = (id) => {
  return api.delete(`/factories/${id}`);
};
