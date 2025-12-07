import api from './api';

export const createLoadingPlan = (planData) => {
  return api.post('/loading-plans', planData);
};

export const getLoadingPlans = () => {
  return api.get('/loading-plans');
};

export const getLoadingPlanById = (id) => {
  return api.get(`/loading-plans/${id}`);
};

export const updateLoadingPlan = (id, planData) => {
    return api.put(`/loading-plans/${id}`, planData);
};

// --- ADD THIS NEW FUNCTION ---
/**
 * Deletes a loading plan by its ID.
 * @param {string} id - The ID of the loading plan to delete.
 * @returns {Promise<object>} The server response.
 */
export const deleteLoadingPlan = (id) => {
    return api.delete(`/loading-plans/${id}`);
};
