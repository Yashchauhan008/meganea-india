import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import SidebarLayout from '../components/layout/SidebarLayout';

// Page Imports
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import RestockRequestPage from '../pages/RestockRequestPage';
import PurchaseOrderPage from '../pages/PurchaseOrderPage';
import FactoryStockPage from '../pages/FactoryStockPage';
import LoadingPlanPage from '../pages/LoadingPlanPage';
import FactoryPage from '../pages/FactoryPage'; // <-- IMPORT THE NEW PAGE
import CreatePurchaseOrderPage from '../pages/CreatePurchaseOrderPage'; // <-- IMPORT THE NEW PAGE
import TileListPage from '../pages/TileListPage';
import PurchaseOrderListPage from '../pages/PurchaseOrderListPage';


const AppRoutes = () => {
    const INDIA_ROLES = ['admin', 'india-staff'];

    return (
        <Router>
            <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Protected India-Side Routes */}
                <Route path="/*" element={
                    <ProtectedRoute roles={INDIA_ROLES}>
                        <SidebarLayout>
                            <Routes>
                                <Route path="/dashboard" element={<DashboardPage />} />
                                <Route path="/factories" element={<FactoryPage />} />
                                <Route path="/restock-requests" element={<RestockRequestPage />} />
                                <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
                                <Route path="/factory-stock" element={<FactoryStockPage />} />
                                <Route path="/loading-plans" element={<LoadingPlanPage />} />
                                <Route path="/purchase-orders/create/:restockId" element={<CreatePurchaseOrderPage />} />
                                <Route path="/india-tiles" element={<TileListPage />} />
                                <Route path="*" element={<DashboardPage />} />
                            </Routes>
                        </SidebarLayout>
                    </ProtectedRoute>
                }/>
            </Routes>
        </Router>
    );
};

export default AppRoutes;
