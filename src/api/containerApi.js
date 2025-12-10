import api from './api';

export const getAllContainers = () => {
  return api.get('/containers');
};

// --- THIS IS THE NEWLY ADDED FUNCTION ---
export const getContainerById = (id) => {
  return api.get(`/containers/${id}`);
};
// --- END OF NEW FUNCTION ---

export const createContainer = (containerData) => {
  return api.post('/containers', containerData);
};

export const updateContainer = (id, containerData) => {
  return api.put(`/containers/${id}`, containerData);
};

export const updateContainerStatus = (id, status) => {
  return api.patch(`/containers/${id}/status`, { status });
};
