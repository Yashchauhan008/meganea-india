// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import ProtectedRoute from './ProtectedRoute';
// import SidebarLayout from '../components/layout/SidebarLayout';

// // Page Imports
// import LoginPage from '../pages/LoginPage';
// import RegisterPage from '../pages/RegisterPage';
// import DashboardPage from '../pages/DashboardPage';
// import RestockRequestPage from '../pages/RestockRequestPage';
// import FactoryStockPage from '../pages/FactoryStockPage';
// import FactoryPage from '../pages/FactoryPage';
// import CreatePurchaseOrderPage from '../pages/CreatePurchaseOrderPage';
// import TileListPage from '../pages/TileListPage';
// import PurchaseOrderListPage from '../pages/PurchaseOrderListPage';
// import LoadingPlanListPage from '../pages/LoadingPlanListPage';
// import CreateLoadingPlanPage from '../pages/CreateLoadingPlanPage';
// import ContainerListPage from '../pages/ContainerListPage';

// const AppRoutes = () => {
//     const INDIA_ROLES = ['admin', 'india-staff'];

//     return (
//         <Router>
//             <Routes>
//                 {/* Public Routes */}
//                 <Route path="/login" element={<LoginPage />} />
//                 <Route path="/register" element={<RegisterPage />} />

//                 {/* Protected India-Side Routes */}
//                 <Route path="/*" element={
//                     <ProtectedRoute roles={INDIA_ROLES}>
//                         <SidebarLayout>
//                             <Routes>
//                                 <Route path="/dashboard" element={<DashboardPage />} />
//                                 <Route path="/factories" element={<FactoryPage />} />
//                                 <Route path="/restock-requests" element={<RestockRequestPage />} />
//                                 <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
//                                 <Route path="/purchase-orders/create/:restockId" element={<CreatePurchaseOrderPage />} />
//                                 <Route path="/factory-stock" element={<FactoryStockPage />} />
//                                 <Route path="/india-tiles" element={<TileListPage />} />
//                                 <Route path="/loading-plans" element={<LoadingPlanListPage />} />
//                                 <Route path="/loading-plans/new" element={<CreateLoadingPlanPage />} />
//                                 <Route path="/containers" element={<ContainerListPage />} /> 

//                                 <Route path="*" element={<DashboardPage />} />
//                             </Routes>
//                         </SidebarLayout>
//                     </ProtectedRoute>
//                 } />
//             </Routes>
//         </Router>
//     );
// };

// export default AppRoutes;

// frontend/src/routing/AppRoutes.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import SidebarLayout from '../components/layout/SidebarLayout';

// Page Imports
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import DashboardPage from '../pages/DashboardPage';
import RestockRequestPage from '../pages/RestockRequestPage';
import FactoryStockPage from '../pages/FactoryStockPage';
import FactoryPage from '../pages/FactoryPage';
import CreatePurchaseOrderPage from '../pages/CreatePurchaseOrderPage';
import TileListPage from '../pages/TileListPage';
import PurchaseOrderListPage from '../pages/PurchaseOrderListPage';
import LoadingPlanListPage from '../pages/LoadingPlanListPage';
import CreateLoadingPlanPage from '../pages/CreateLoadingPlanPage';
import ContainerListPage from '../pages/ContainerListPage';

// NEW: Dispatch Pages
import DispatchListPage from '../pages/DispatchListPage';
import CreateDispatchOrderPage from '../pages/CreateDispatchOrderPage';

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
                                <Route path="/india-tiles" element={<TileListPage />} />
                                <Route path="/restock-requests" element={<RestockRequestPage />} />
                                <Route path="/purchase-orders" element={<PurchaseOrderListPage />} />
                                <Route path="/purchase-orders/create/:restockId" element={<CreatePurchaseOrderPage />} />
                                <Route path="/factory-stock" element={<FactoryStockPage />} />
                                <Route path="/loading-plans" element={<LoadingPlanListPage />} />
                                <Route path="/loading-plans/new" element={<CreateLoadingPlanPage />} />
                                <Route path="/containers" element={<ContainerListPage />} />
                                
                                {/* NEW: Dispatch Routes */}
                                <Route path="/dispatches" element={<DispatchListPage />} />
                                <Route path="/dispatches/new" element={<CreateDispatchOrderPage />} />
                                
                                {/* Default Route */}
                                <Route path="*" element={<DashboardPage />} />
                            </Routes>
                        </SidebarLayout>
                    </ProtectedRoute>
                } />
            </Routes>
        </Router>
    );
};

export default AppRoutes;