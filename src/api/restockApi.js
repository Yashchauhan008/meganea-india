import api from './api';

// @desc    Get all restock requests
// @route   GET /api/restocks
export const getAllRestockRequests = () => {
  return api.get('/restocks');
};

// @desc    Get a single restock request by its ID
// @route   GET /api/restocks/:id
export const getRestockRequestById = (id) => {
  return api.get(`/restocks/${id}`);
};

// Note: We will add more functions here later, like updating status.
export const getRestockForWorkbench = (id) => {
  return api.get(`/restocks/${id}/workbench`);
};