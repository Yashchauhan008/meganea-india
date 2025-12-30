// FILE: frontend/src/api/dashboardApi.js

import api from './api';

/**
 * Get dashboard data based on user role
 * @returns {Promise} Dashboard data
 */
export const getDashboardData = async () => {
    try {
        const response = await api.get('/dashboard');
        return response.data;
    } catch (error) {
        console.error('[dashboardApi] Error fetching dashboard:', error);
        throw error.response?.data?.message || 'Failed to fetch dashboard data';
    }
};

export default { getDashboardData };