import api from './api'; // The central axios instance

// @desc    Get all factories
// @route   GET /api/factories
export const getAllFactories = async () => {
  try {
    const response = await api.get('/factories');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch factories';
  }
};

// @desc    Get a single factory by its ID
// @route   GET /api/factories/:id
export const getFactoryById = async (id) => {
  try {
    const response = await api.get(`/factories/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch factory';
  }
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
