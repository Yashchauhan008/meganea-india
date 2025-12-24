import api from './api.js';

// Get all containers available for dispatch
export const getAvailableContainers = async () => {
  try {
    const response = await api.get('/dispatches/containers/available');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch available containers';
  }
};

// Create new dispatch order
export const createDispatch = async (dispatchData) => {
  try {
    const response = await api.post('/dispatches', dispatchData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create dispatch order';
  }
};

// Get all dispatch orders
export const getAllDispatches = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.factoryId) params.append('factoryId', filters.factoryId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const queryString = params.toString();
    const url = queryString ? `/dispatches?${queryString}` : '/dispatches';
    
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch dispatch orders';
  }
};

// Get single dispatch order
export const getDispatchById = async (id) => {
  try {
    const response = await api.get(`/dispatches/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch dispatch order';
  }
};

// Update dispatch order (add/remove containers)
export const updateDispatch = async (id, updateData) => {
  try {
    const response = await api.put(`/dispatches/${id}`, updateData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update dispatch order';
  }
};

// Update dispatch status
export const updateDispatchStatus = async (id, newStatus, notes = '') => {
  try {
    const response = await api.patch(`/dispatches/${id}/status`, {
      newStatus,
      notes,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update dispatch status';
  }
};

// Delete dispatch order
export const deleteDispatch = async (id, reason = '') => {
  try {
    const response = await api.delete(`/dispatches/${id}`, {
      data: { reason },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete dispatch order';
  }
};

// Add containers to dispatch
export const addContainersToDispatch = async (dispatchId, containerIds) => {
  try {
    const response = await api.put(`/dispatches/${dispatchId}`, {
      containerIdsToAdd: containerIds,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to add containers to dispatch';
  }
};

// Remove containers from dispatch
export const removeContainersFromDispatch = async (dispatchId, containerIds) => {
  try {
    const response = await api.put(`/dispatches/${dispatchId}`, {
      containerIdsToRemove: containerIds,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to remove containers from dispatch';
  }
};
