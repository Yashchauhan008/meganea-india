// frontend/src/api/dispatchApi.js

import api from './api.js';

/**
 * Get all containers available for dispatch
 */
export const getAvailableContainers = async () => {
  try {
    const response = await api.get('/dispatches/containers/available');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch available containers';
  }
};

/**
 * Create new dispatch order
 */
export const createDispatch = async (dispatchData) => {
  try {
    const response = await api.post('/dispatches', dispatchData);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to create dispatch order';
  }
};

/**
 * Get all dispatch orders with optional filters
 */
export const getAllDispatches = async (filters = {}) => {
  try {
    const params = new URLSearchParams();

    if (filters.status) params.append('status', filters.status);
    if (filters.factoryId) params.append('factoryId', filters.factoryId);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `/dispatches?${queryString}` : '/dispatches';

    const response = await api.get(url);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch dispatch orders';
  }
};

/**
 * Get single dispatch order by ID
 */
export const getDispatchById = async (id) => {
  try {
    const response = await api.get(`/dispatches/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch dispatch order';
  }
};

/**
 * Update dispatch order (add/remove containers, edit details)
 */
export const updateDispatch = async (id, data) => {
  try {
    const response = await api.put(`/dispatches/${id}`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update dispatch order';
  }
};

/**
 * Update dispatch status
 */
export const updateDispatchStatus = async (id, status, notes = '') => {
  try {
    const response = await api.patch(`/dispatches/${id}/status`, {
      status,
      notes,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to update dispatch status';
  }
};

/**
 * Delete dispatch order (soft delete)
 */
export const deleteDispatch = async (id, deletionReason) => {
  try {
    const response = await api.delete(`/dispatches/${id}`, {
      data: { deletionReason },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to delete dispatch order';
  }
};

/**
 * Get dispatch statistics
 */
export const getDispatchStats = async () => {
  try {
    const response = await api.get('/dispatches/stats');
    return response.data;
  } catch (error) {
    throw error.response?.data?.message || 'Failed to fetch dispatch statistics';
  }
};