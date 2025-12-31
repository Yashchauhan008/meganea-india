// FILE: frontend/src/api/reportApi.js

import api from './api';

// Tiles Report
export const getTilesReport = () => api.get('/reports/tiles');

// Factories Report
export const getFactoriesReport = () => api.get('/reports/factories');

// Factory Stock Report
export const getFactoryStockReport = (factoryId) => 
    api.get('/reports/factory-stock', { params: { factoryId } });

// Containers Report
export const getContainersReport = (params) => 
    api.get('/reports/containers', { params });

// Purchase Orders Report
export const getPurchaseOrdersReport = (params) => 
    api.get('/reports/purchase-orders', { params });

// Purchase Order Detail Report
export const getPurchaseOrderDetailReport = (id) => 
    api.get(`/reports/purchase-orders/${id}`);

// Restock Requests Report
export const getRestockRequestsReport = (params) => 
    api.get('/reports/restock-requests', { params });

// Loading Plans Report
export const getLoadingPlansReport = (params) => 
    api.get('/reports/loading-plans', { params });

// Dispatches Report
export const getDispatchesReport = (params) => 
    api.get('/reports/dispatches', { params });

// Dispatch Detail Report
export const getDispatchDetailReport = (id) => 
    api.get(`/reports/dispatches/${id}`);

// Inventory Report
export const getInventoryReport = () => api.get('/reports/inventory');

export default {
    getTilesReport,
    getFactoriesReport,
    getFactoryStockReport,
    getContainersReport,
    getPurchaseOrdersReport,
    getPurchaseOrderDetailReport,
    getRestockRequestsReport,
    getLoadingPlansReport,
    getDispatchesReport,
    getDispatchDetailReport,
    getInventoryReport,
};