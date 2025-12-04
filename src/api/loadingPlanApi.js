// In frontend/src/api/loadingPlanApi.js

import api from './api';

/**
 * Creates a new loading plan.
 * @param {object} planData - The entire loading plan object.
 * @returns {Promise<object>} The server response.
 */
export const createLoadingPlan = (planData) => {
  return api.post('/loading-plans', planData);
};

/**
 * Fetches all loading plans.
 * @returns {Promise<object>} The server response.
 */
export const getLoadingPlans = () => {
  return api.get('/loading-plans');
};

/**
 * Fetches a single loading plan by its ID.
 * @param {string} id - The ID of the loading plan.
 * @returns {Promise<object>} The server response containing the detailed plan.
 */
export const getLoadingPlanById = (id) => {
  return api.get(`/loading-plans/${id}`);
}