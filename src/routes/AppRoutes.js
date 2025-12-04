// import React from 'react';
// import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import ProtectedRoute from './ProtectedRoute';
// import SidebarLayout from '../components/layout/SidebarLayout';

// // Page Imports
// import LoginPage from '../pages/LoginPage';
// import RegisterPage from '../pages/RegisterPage';
// import DashboardPage from '../pages/DashboardPage';
// import RestockRequestPage from '../pages/RestockRequestPage';
// import PurchaseOrderPage from '../pages/PurchaseOrderPage';
// import FactoryStockPage from '../pages/FactoryStockPage';
// import LoadingPlanPage from '../pages/LoadingPlanPage';
// import FactoryPage from '../pages/FactoryPage'; // <-- IMPORT THE NEW PAGE
// import CreatePurchaseOrderPage from '../pages/CreatePurchaseOrderPage'; // <-- IMPORT THE NEW PAGE
// import TileListPage from '../pages/TileListPage';
// import PurchaseOrderListPage from '../pages/PurchaseOrderListPage';
// import LoadingPlanListPage from '../pages/LoadingPlanListPage';
// import CreateLoadingPlanPage from '../pages/CreateLoadingPlanPage';


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
//                                 <Route path="/factory-stock" element={<FactoryStockPage />} />
//                                 <Route path="/loading-plans" element={<LoadingPlanPage />} />
//                                 <Route path="/purchase-orders/create/:restockId" element={<CreatePurchaseOrderPage />} />
//                                 <Route path="/india-tiles" element={<TileListPage />} />
//                                 {/* --- 2. ADD THE NEW ROUTES --- */}
//                                 {/* The main list page */}
//                                 <Route path="/loading-plans" element={<LoadingPlanListPage />} />
//                                 <Route path="/loading-plans/new" element={<CreateLoadingPlanPage />} />
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
                                <Route path="/purchase-orders/create/:restockId" element={<CreatePurchaseOrderPage />} />
                                <Route path="/factory-stock" element={<FactoryStockPage />} />
                                <Route path="/india-tiles" element={<TileListPage />} />
                                <Route path="/loading-plans" element={<LoadingPlanListPage />} />
                                <Route path="/loading-plans/new" element={<CreateLoadingPlanPage />} />
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
