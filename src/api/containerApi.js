import api from './api';

/**
 * Fetches all containers with populated details.
 * @returns {Promise<object>} The server response containing the array of containers.
 */
export const getAllContainers = () => {
  return api.get('/containers');
};

/**
 * Updates the status of a specific container.
 * @param {string} containerId - The ID of the container to update.
 * @param {string} status - The new status to set.
 * @returns {Promise<object>} The server response with the updated container data.
 */
export const updateContainerStatus = (containerId, status) => {
  return api.put(`/containers/${containerId}/status`, { status });
};
