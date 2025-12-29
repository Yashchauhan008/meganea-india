
// import React, { useState, useEffect, useCallback, useMemo } from 'react';
// import { getAllPurchaseOrders } from '../api/purchaseOrderApi';
// import { 
//     ClipboardList, Factory, Calendar, FileText, Box, Loader2, Search, 
//     RefreshCw, Filter, ChevronLeft, ChevronRight, Package, TrendingUp,
//     CheckCircle, XCircle, Clock, PlayCircle, Clipboard, AlertCircle,
//     Eye, Settings, MoreVertical, Boxes, ArrowRight
// } from 'lucide-react';
// import { format, parseISO } from 'date-fns';
// import useDebounce from '../hooks/useDebounce';
// import ManagePOModal from '../components/purchase-orders/ManagePOModal';

// const PAGE_LIMIT = 12;

// // Status configurations
// const STATUS_CONFIG = {
//     Draft: { 
//         label: 'Draft', 
//         color: 'text-blue-700 dark:text-blue-300', 
//         bg: 'bg-blue-100 dark:bg-blue-900/40',
//         icon: FileText,
//         description: 'Awaiting submission'
//     },
//     SentToFactory: { 
//         label: 'Sent to Factory', 
//         color: 'text-cyan-700 dark:text-cyan-300', 
//         bg: 'bg-cyan-100 dark:bg-cyan-900/40',
//         icon: ArrowRight,
//         description: 'Pending factory confirmation'
//     },
//     Manufacturing: { 
//         label: 'Manufacturing', 
//         color: 'text-yellow-700 dark:text-yellow-300', 
//         bg: 'bg-yellow-100 dark:bg-yellow-900/40',
//         icon: PlayCircle,
//         description: 'In production'
//     },
//     QC_InProgress: { 
//         label: 'QC In Progress', 
//         color: 'text-orange-700 dark:text-orange-300', 
//         bg: 'bg-orange-100 dark:bg-orange-900/40',
//         icon: Clipboard,
//         description: 'Quality check ongoing'
//     },
//     QC_Completed: { 
//         label: 'QC Completed', 
//         color: 'text-indigo-700 dark:text-indigo-300', 
//         bg: 'bg-indigo-100 dark:bg-indigo-900/40',
//         icon: CheckCircle,
//         description: 'Ready for packing'
//     },
//     Packing: { 
//         label: 'Packing', 
//         color: 'text-purple-700 dark:text-purple-300', 
//         bg: 'bg-purple-100 dark:bg-purple-900/40',
//         icon: Package,
//         description: 'Being packed'
//     },
//     Completed: { 
//         label: 'Completed', 
//         color: 'text-green-700 dark:text-green-300', 
//         bg: 'bg-green-100 dark:bg-green-900/40',
//         icon: CheckCircle,
//         description: 'Finished'
//     },
//     Cancelled: { 
//         label: 'Cancelled', 
//         color: 'text-red-700 dark:text-red-300', 
//         bg: 'bg-red-100 dark:bg-red-900/40',
//         icon: XCircle,
//         description: 'Cancelled'
//     },
// };

// const PurchaseOrderListPage = () => {
//     const [purchaseOrders, setPurchaseOrders] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [selectedPoId, setSelectedPoId] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [statusFilter, setStatusFilter] = useState('all');
//     const [currentPage, setCurrentPage] = useState(1);
//     const debouncedSearch = useDebounce(searchTerm, 300);

//     const fetchPurchaseOrders = useCallback(async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const response = await getAllPurchaseOrders();
//             const data = response?.data || response || [];
//             setPurchaseOrders(Array.isArray(data) ? data : []);
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to fetch purchase orders.');
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchPurchaseOrders();
//     }, [fetchPurchaseOrders]);

//     // Calculate summary stats
//     const stats = useMemo(() => {
//         const statusCounts = {};
//         let totalBoxes = 0;
//         let totalPallets = 0;
//         let totalKhatlis = 0;

//         purchaseOrders.forEach(po => {
//             statusCounts[po.status] = (statusCounts[po.status] || 0) + 1;
//             po.items?.forEach(item => {
//                 totalPallets += item.palletsOrdered || 0;
//                 totalKhatlis += item.khatlisOrdered || 0;
//                 totalBoxes += item.totalBoxesOrdered || 0;
//             });
//         });

//         return {
//             total: purchaseOrders.length,
//             statusCounts,
//             totalBoxes,
//             totalPallets,
//             totalKhatlis,
//             active: purchaseOrders.filter(po => !['Completed', 'Cancelled'].includes(po.status)).length
//         };
//     }, [purchaseOrders]);

//     // Filter and paginate
//     const filteredOrders = useMemo(() => {
//         let filtered = purchaseOrders;

//         // Search filter
//         if (debouncedSearch) {
//             const search = debouncedSearch.toLowerCase();
//             filtered = filtered.filter(po => 
//                 po.poId?.toLowerCase().includes(search) ||
//                 po.factory?.name?.toLowerCase().includes(search) ||
//                 po.items?.some(item => item.tile?.name?.toLowerCase().includes(search))
//             );
//         }

//         // Status filter
//         if (statusFilter !== 'all') {
//             filtered = filtered.filter(po => po.status === statusFilter);
//         }

//         return filtered;
//     }, [purchaseOrders, debouncedSearch, statusFilter]);

//     // Pagination
//     const totalPages = Math.ceil(filteredOrders.length / PAGE_LIMIT);
//     const paginatedOrders = filteredOrders.slice(
//         (currentPage - 1) * PAGE_LIMIT,
//         currentPage * PAGE_LIMIT
//     );

//     const handleManageClick = (poId) => {
//         setSelectedPoId(poId);
//         setIsModalOpen(true);
//     };

//     const handleCloseModal = () => {
//         setIsModalOpen(false);
//         setSelectedPoId(null);
//         fetchPurchaseOrders();
//     };

//     const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.Draft;

//     // Status tabs for quick filtering
//     const statusTabs = [
//         { key: 'all', label: 'All', count: stats.total },
//         { key: 'Draft', label: 'Draft', count: stats.statusCounts.Draft || 0 },
//         { key: 'SentToFactory', label: 'Sent', count: stats.statusCounts.SentToFactory || 0 },
//         { key: 'Manufacturing', label: 'Manufacturing', count: stats.statusCounts.Manufacturing || 0 },
//         { key: 'QC_InProgress', label: 'QC', count: (stats.statusCounts.QC_InProgress || 0) + (stats.statusCounts.QC_Completed || 0) },
//         { key: 'Completed', label: 'Completed', count: stats.statusCounts.Completed || 0 },
//         { key: 'Cancelled', label: 'Cancelled', count: stats.statusCounts.Cancelled || 0 },
//     ];

//     return (
//         <div className="p-4 sm:p-6 md:p-8 space-y-6">
//             {/* Modal */}
//             {isModalOpen && (
//                 <ManagePOModal 
//                     poId={selectedPoId} 
//                     onClose={handleCloseModal} 
//                 />
//             )}

//             {/* Header */}
//             <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
//                 <div>
//                     <h1 className="text-3xl font-bold text-text dark:text-dark-text">Purchase Orders</h1>
//                     <p className="text-text-secondary dark:text-dark-text-secondary">
//                         Manage factory orders and track production progress
//                     </p>
//                 </div>
//                 <button 
//                     onClick={fetchPurchaseOrders}
//                     disabled={loading}
//                     className="flex items-center gap-2 px-4 py-2.5 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors text-text dark:text-dark-text"
//                 >
//                     <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
//                     Refresh
//                 </button>
//             </div>

//             {/* Summary Cards */}
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
//                 <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
//                             <ClipboardList size={20} className="text-blue-600 dark:text-blue-400" />
//                         </div>
//                         <div>
//                             <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.total}</p>
//                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Total POs</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
//                             <PlayCircle size={20} className="text-yellow-600 dark:text-yellow-400" />
//                         </div>
//                         <div>
//                             <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.active}</p>
//                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Active</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
//                             <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
//                         </div>
//                         <div>
//                             <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.statusCounts.Completed || 0}</p>
//                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Completed</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
//                             <Package size={20} className="text-indigo-600 dark:text-indigo-400" />
//                         </div>
//                         <div>
//                             <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.totalPallets.toLocaleString()}</p>
//                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pallets</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
//                             <Boxes size={20} className="text-purple-600 dark:text-purple-400" />
//                         </div>
//                         <div>
//                             <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.totalKhatlis.toLocaleString()}</p>
//                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Khatlis</p>
//                         </div>
//                     </div>
//                 </div>
//                 <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
//                     <div className="flex items-center gap-3">
//                         <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
//                             <Box size={20} className="text-orange-600 dark:text-orange-400" />
//                         </div>
//                         <div>
//                             <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.totalBoxes.toLocaleString()}</p>
//                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Total Boxes</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Status Tabs */}
//             <div className="flex flex-wrap gap-2 pb-2 border-b border-border dark:border-dark-border overflow-x-auto">
//                 {statusTabs.map(tab => (
//                     <button
//                         key={tab.key}
//                         onClick={() => { setStatusFilter(tab.key); setCurrentPage(1); }}
//                         className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
//                             statusFilter === tab.key
//                                 ? 'bg-primary text-white'
//                                 : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'
//                         }`}
//                     >
//                         {tab.label}
//                         <span className={`px-1.5 py-0.5 rounded-full text-xs ${
//                             statusFilter === tab.key 
//                                 ? 'bg-white/20' 
//                                 : 'bg-gray-200 dark:bg-gray-700'
//                         }`}>
//                             {tab.count}
//                         </span>
//                     </button>
//                 ))}
//             </div>

//             {/* Search */}
//             <div className="flex flex-col sm:flex-row gap-4">
//                 <div className="relative flex-1">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
//                     <input
//                         type="text"
//                         placeholder="Search by PO ID, factory, or tile..."
//                         value={searchTerm}
//                         onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
//                         className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text focus:ring-2 focus:ring-primary"
//                     />
//                 </div>
//             </div>

//             {/* Error */}
//             {error && (
//                 <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
//                     <AlertCircle size={20} />
//                     <span>{error}</span>
//                     <button onClick={fetchPurchaseOrders} className="ml-auto underline">Retry</button>
//                 </div>
//             )}

//             {/* Loading */}
//             {loading && (
//                 <div className="flex justify-center py-20">
//                     <Loader2 size={48} className="animate-spin text-primary" />
//                 </div>
//             )}

//             {/* Content */}
//             {!loading && !error && (
//                 <>
//                     {paginatedOrders.length === 0 ? (
//                         <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl bg-foreground dark:bg-dark-foreground">
//                             <ClipboardList size={48} className="mx-auto text-text-secondary/30 mb-4" />
//                             <h3 className="text-xl font-semibold text-text dark:text-dark-text">No Purchase Orders Found</h3>
//                             <p className="text-text-secondary dark:text-dark-text-secondary mt-2">
//                                 {searchTerm || statusFilter !== 'all' 
//                                     ? 'Try adjusting your filters.' 
//                                     : 'Create a PO from the "Restock Requests" page.'}
//                             </p>
//                         </div>
//                     ) : (
//                         <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
//                             {paginatedOrders.map((po) => {
//                                 const statusConfig = getStatusConfig(po.status);
//                                 const StatusIcon = statusConfig.icon;
//                                 const totalBoxes = po.items?.reduce((sum, item) => sum + (item.totalBoxesOrdered || 0), 0) || 0;
//                                 const totalPallets = po.items?.reduce((sum, item) => sum + (item.palletsOrdered || 0), 0) || 0;
//                                 const totalKhatlis = po.items?.reduce((sum, item) => sum + (item.khatlisOrdered || 0), 0) || 0;
//                                 const qcProgress = po.items?.reduce((sum, item) => sum + (item.quantityPassedQC || 0), 0) || 0;
//                                 const qcPercent = totalBoxes > 0 ? Math.round((qcProgress / totalBoxes) * 100) : 0;

//                                 return (
//                                     <div 
//                                         key={po._id} 
//                                         className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-sm overflow-hidden hover:shadow-lg transition-all group"
//                                     >
//                                         {/* Header */}
//                                         <div className="p-4 border-b border-border dark:border-dark-border">
//                                             <div className="flex justify-between items-start mb-3">
//                                                 <div>
//                                                     <p className="font-mono text-primary dark:text-blue-400 font-bold text-lg">{po.poId}</p>
//                                                     <div className="flex items-center gap-2 mt-1 text-text dark:text-dark-text">
//                                                         <Factory size={16} className="text-text-secondary" />
//                                                         <span className="font-medium">{po.factory?.name || 'N/A'}</span>
//                                                     </div>
//                                                 </div>
//                                                 <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
//                                                     <StatusIcon size={12} />
//                                                     {statusConfig.label}
//                                                 </span>
//                                             </div>
//                                             <div className="flex items-center gap-4 text-xs text-text-secondary dark:text-dark-text-secondary">
//                                                 <span className="flex items-center gap-1">
//                                                     <Calendar size={12} />
//                                                     {format(parseISO(po.createdAt), 'dd MMM yyyy')}
//                                                 </span>
//                                                 {po.sourceRestockRequest && (
//                                                     <span className="flex items-center gap-1">
//                                                         <FileText size={12} />
//                                                         {po.sourceRestockRequest.requestId || 'Restock'}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </div>

//                                         {/* Stats Grid */}
//                                         <div className="grid grid-cols-3 divide-x divide-border dark:divide-dark-border border-b border-border dark:border-dark-border">
//                                             <div className="p-3 text-center">
//                                                 <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{totalPallets}</p>
//                                                 <p className="text-xs text-text-secondary">Pallets</p>
//                                             </div>
//                                             <div className="p-3 text-center">
//                                                 <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{totalKhatlis}</p>
//                                                 <p className="text-xs text-text-secondary">Khatlis</p>
//                                             </div>
//                                             <div className="p-3 text-center">
//                                                 <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{totalBoxes.toLocaleString()}</p>
//                                                 <p className="text-xs text-text-secondary">Boxes</p>
//                                             </div>
//                                         </div>

//                                         {/* Items Preview */}
//                                         <div className="p-4">
//                                             <h4 className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-2">
//                                                 Items ({po.items?.length || 0})
//                                             </h4>
//                                             <div className="space-y-1.5 max-h-24 overflow-y-auto">
//                                                 {po.items?.slice(0, 3).map((item, index) => (
//                                                     <div 
//                                                         key={index} 
//                                                         className="flex justify-between items-center text-sm p-2 bg-background dark:bg-dark-background rounded"
//                                                     >
//                                                         <span className="text-text dark:text-dark-text truncate flex-1">
//                                                             {item.tile?.name || 'Unknown'}
//                                                         </span>
//                                                         <span className="text-text-secondary dark:text-dark-text-secondary text-xs ml-2">
//                                                             {item.totalBoxesOrdered} boxes
//                                                         </span>
//                                                     </div>
//                                                 ))}
//                                                 {po.items?.length > 3 && (
//                                                     <p className="text-xs text-text-secondary text-center">
//                                                         +{po.items.length - 3} more items
//                                                     </p>
//                                                 )}
//                                             </div>

//                                             {/* QC Progress */}
//                                             {['Manufacturing', 'QC_InProgress', 'QC_Completed'].includes(po.status) && (
//                                                 <div className="mt-3 pt-3 border-t border-border dark:border-dark-border">
//                                                     <div className="flex justify-between text-xs mb-1">
//                                                         <span className="text-text-secondary">QC Progress</span>
//                                                         <span className="font-medium text-text dark:text-dark-text">{qcPercent}%</span>
//                                                     </div>
//                                                     <div className="w-full bg-background dark:bg-dark-background rounded-full h-2">
//                                                         <div 
//                                                             className={`h-2 rounded-full transition-all ${qcPercent === 100 ? 'bg-green-500' : 'bg-primary'}`}
//                                                             style={{ width: `${qcPercent}%` }}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             )}
//                                         </div>

//                                         {/* Footer */}
//                                         <div className="p-3 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-between items-center">
//                                             <span className="text-xs text-text-secondary dark:text-dark-text-secondary">
//                                                 {statusConfig.description}
//                                             </span>
//                                             <button 
//                                                 onClick={() => handleManageClick(po._id)}
//                                                 className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold text-primary dark:text-blue-400 hover:bg-primary/10 rounded-lg transition-colors"
//                                             >
//                                                 <Settings size={14} />
//                                                 Manage
//                                             </button>
//                                         </div>
//                                     </div>
//                                 );
//                             })}
//                         </div>
//                     )}

//                     {/* Pagination */}
//                     {totalPages > 1 && (
//                         <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border dark:border-dark-border">
//                             <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
//                                 Showing {((currentPage - 1) * PAGE_LIMIT) + 1} - {Math.min(currentPage * PAGE_LIMIT, filteredOrders.length)} of {filteredOrders.length}
//                             </p>
//                             <div className="flex items-center gap-2">
//                                 <button
//                                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                                     disabled={currentPage <= 1}
//                                     className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background transition-colors text-text dark:text-dark-text"
//                                 >
//                                     <ChevronLeft size={20} />
//                                 </button>
//                                 <span className="px-4 py-2 text-sm text-text dark:text-dark-text">
//                                     Page {currentPage} of {totalPages}
//                                 </span>
//                                 <button
//                                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                                     disabled={currentPage >= totalPages}
//                                     className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background transition-colors text-text dark:text-dark-text"
//                                 >
//                                     <ChevronRight size={20} />
//                                 </button>
//                             </div>
//                         </div>
//                     )}
//                 </>
//             )}
//         </div>
//     );
// };

// export default PurchaseOrderListPage;

// FILE LOCATION: src/pages/PurchaseOrderListPage.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllPurchaseOrders } from '../api/purchaseOrderApi';
import { 
    ClipboardList, Factory, Calendar, FileText, Box, Loader2, Search, 
    RefreshCw, Package, CheckCircle, XCircle, PlayCircle, Clipboard, AlertCircle,
    Settings, Boxes, ArrowRight, ChevronDown, ChevronUp, Layers, Link2
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import useDebounce from '../hooks/useDebounce';
import ManagePOModal from '../components/purchase-orders/ManagePOModal';

// Status configurations
const STATUS_CONFIG = {
    Draft: { label: 'Draft', color: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-100 dark:bg-blue-900/40', icon: FileText },
    SentToFactory: { label: 'Sent', color: 'text-cyan-700 dark:text-cyan-300', bg: 'bg-cyan-100 dark:bg-cyan-900/40', icon: ArrowRight },
    Manufacturing: { label: 'Manufacturing', color: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-100 dark:bg-yellow-900/40', icon: PlayCircle },
    QC_InProgress: { label: 'QC In Progress', color: 'text-orange-700 dark:text-orange-300', bg: 'bg-orange-100 dark:bg-orange-900/40', icon: Clipboard },
    QC_Completed: { label: 'QC Done', color: 'text-indigo-700 dark:text-indigo-300', bg: 'bg-indigo-100 dark:bg-indigo-900/40', icon: CheckCircle },
    Packing: { label: 'Packing', color: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-100 dark:bg-purple-900/40', icon: Package },
    Completed: { label: 'Completed', color: 'text-green-700 dark:text-green-300', bg: 'bg-green-100 dark:bg-green-900/40', icon: CheckCircle },
    Cancelled: { label: 'Cancelled', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/40', icon: XCircle },
};

const PurchaseOrderListPage = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPoId, setSelectedPoId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('grouped');
    const [expandedGroups, setExpandedGroups] = useState({});
    const debouncedSearch = useDebounce(searchTerm, 300);

    const fetchPurchaseOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAllPurchaseOrders();
            const data = response?.data || response || [];
            setPurchaseOrders(Array.isArray(data) ? data : []);
            
            const groups = {};
            data.forEach(po => {
                const groupKey = po.sourceRestockRequest?._id || po.sourceRestockRequest || 'manual';
                groups[groupKey] = true;
            });
            setExpandedGroups(groups);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch purchase orders.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchPurchaseOrders(); }, [fetchPurchaseOrders]);

    const stats = useMemo(() => {
        const statusCounts = {};
        let totalBoxes = 0, totalPallets = 0, totalKhatlis = 0;
        purchaseOrders.forEach(po => {
            statusCounts[po.status] = (statusCounts[po.status] || 0) + 1;
            po.items?.forEach(item => {
                totalPallets += item.palletsOrdered || 0;
                totalKhatlis += item.khatlisOrdered || 0;
                totalBoxes += item.totalBoxesOrdered || 0;
            });
        });
        return { total: purchaseOrders.length, statusCounts, totalBoxes, totalPallets, totalKhatlis,
            active: purchaseOrders.filter(po => !['Completed', 'Cancelled'].includes(po.status)).length };
    }, [purchaseOrders]);

    const filteredOrders = useMemo(() => {
        let filtered = purchaseOrders;
        if (debouncedSearch) {
            const search = debouncedSearch.toLowerCase();
            filtered = filtered.filter(po => 
                po.poId?.toLowerCase().includes(search) ||
                po.factory?.name?.toLowerCase().includes(search) ||
                po.sourceRestockRequest?.requestId?.toLowerCase().includes(search)
            );
        }
        if (statusFilter !== 'all') {
            if (statusFilter === 'QC') {
                filtered = filtered.filter(po => ['QC_InProgress', 'QC_Completed'].includes(po.status));
            } else {
                filtered = filtered.filter(po => po.status === statusFilter);
            }
        }
        return filtered;
    }, [purchaseOrders, debouncedSearch, statusFilter]);

    const groupedOrders = useMemo(() => {
        const groups = {};
        filteredOrders.forEach(po => {
            const restockId = po.sourceRestockRequest?._id || po.sourceRestockRequest;
            const groupKey = restockId || 'manual';
            if (!groups[groupKey]) {
                groups[groupKey] = {
                    key: groupKey, restockRequestId: po.sourceRestockRequest?.requestId || null,
                    isManual: !restockId, orders: [], totalBoxes: 0, totalPallets: 0, totalKhatlis: 0
                };
            }
            groups[groupKey].orders.push(po);
            po.items?.forEach(item => {
                groups[groupKey].totalBoxes += item.totalBoxesOrdered || 0;
                groups[groupKey].totalPallets += item.palletsOrdered || 0;
                groups[groupKey].totalKhatlis += item.khatlisOrdered || 0;
            });
        });
        return Object.values(groups).sort((a, b) => {
            if (a.isManual && !b.isManual) return 1;
            if (!a.isManual && b.isManual) return -1;
            return new Date(b.orders[0]?.createdAt) - new Date(a.orders[0]?.createdAt);
        });
    }, [filteredOrders]);

    const handleManageClick = (poId) => { setSelectedPoId(poId); setIsModalOpen(true); };
    const handleCloseModal = () => { setIsModalOpen(false); setSelectedPoId(null); fetchPurchaseOrders(); };
    const toggleGroup = (groupKey) => { setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] })); };
    const getStatusConfig = (status) => STATUS_CONFIG[status] || STATUS_CONFIG.Draft;

    const statusTabs = [
        { key: 'all', label: 'All', count: stats.total },
        { key: 'Draft', label: 'Draft', count: stats.statusCounts.Draft || 0 },
        { key: 'Manufacturing', label: 'Mfg', count: stats.statusCounts.Manufacturing || 0 },
        { key: 'QC', label: 'QC', count: (stats.statusCounts.QC_InProgress || 0) + (stats.statusCounts.QC_Completed || 0) },
        { key: 'Completed', label: 'Done', count: stats.statusCounts.Completed || 0 },
    ];

    const renderPOCard = (po) => {
        const statusConfig = getStatusConfig(po.status);
        const StatusIcon = statusConfig.icon;
        const totalBoxes = po.items?.reduce((sum, item) => sum + (item.totalBoxesOrdered || 0), 0) || 0;
        const totalPallets = po.items?.reduce((sum, item) => sum + (item.palletsOrdered || 0), 0) || 0;
        const totalKhatlis = po.items?.reduce((sum, item) => sum + (item.khatlisOrdered || 0), 0) || 0;
        const qcPassed = po.items?.reduce((sum, item) => sum + (item.quantityPassedQC || 0), 0) || 0;
        const qcPercent = totalBoxes > 0 ? Math.round((qcPassed / totalBoxes) * 100) : 0;

        return (
            <div key={po._id} className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-sm overflow-hidden hover:shadow-lg transition-all">
                <div className="p-4 border-b border-border dark:border-dark-border">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="font-mono text-primary dark:text-blue-400 font-bold text-lg">{po.poId}</p>
                            <div className="flex items-center gap-2 mt-1 text-text dark:text-dark-text">
                                <Factory size={14} className="text-text-secondary" />
                                <span className="font-medium text-sm">{po.factory?.name || 'N/A'}</span>
                            </div>
                        </div>
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                            <StatusIcon size={12} /> {statusConfig.label}
                        </span>
                    </div>
                    <p className="text-xs text-text-secondary mt-2 flex items-center gap-1">
                        <Calendar size={12} /> {format(parseISO(po.createdAt), 'dd MMM yyyy')}
                    </p>
                </div>
                <div className="grid grid-cols-3 divide-x divide-border dark:divide-dark-border text-center py-3 bg-background dark:bg-dark-background">
                    <div><p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">{totalPallets}</p><p className="text-xs text-text-secondary">Pallets</p></div>
                    <div><p className="text-lg font-bold text-purple-600 dark:text-purple-400">{totalKhatlis}</p><p className="text-xs text-text-secondary">Khatlis</p></div>
                    <div><p className="text-lg font-bold text-orange-600 dark:text-orange-400">{totalBoxes}</p><p className="text-xs text-text-secondary">Boxes</p></div>
                </div>
                {['Manufacturing', 'QC_InProgress', 'QC_Completed', 'Packing'].includes(po.status) && (
                    <div className="px-4 py-2 border-t border-border dark:border-dark-border">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="text-text-secondary">QC Progress</span>
                            <span className={`font-medium ${qcPercent === 100 ? 'text-green-600' : 'text-text dark:text-dark-text'}`}>{qcPercent}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                            <div className={`h-1.5 rounded-full ${qcPercent === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${qcPercent}%` }} />
                        </div>
                    </div>
                )}
                <div className="p-3 border-t border-border dark:border-dark-border flex justify-end">
                    <button onClick={() => handleManageClick(po._id)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                        <Settings size={14} /> Manage
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {isModalOpen && <ManagePOModal poId={selectedPoId} onClose={handleCloseModal} />}

            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text dark:text-dark-text">Purchase Orders</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">Manage factory orders and track production</p>
                </div>
                <div className="flex gap-3">
                    <div className="flex border border-border dark:border-dark-border rounded-lg overflow-hidden">
                        <button onClick={() => setViewMode('grouped')} className={`px-3 py-2 text-sm font-medium flex items-center gap-1.5 ${viewMode === 'grouped' ? 'bg-primary text-white' : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text'}`}>
                            <Layers size={16} /> Grouped
                        </button>
                        <button onClick={() => setViewMode('flat')} className={`px-3 py-2 text-sm font-medium flex items-center gap-1.5 ${viewMode === 'flat' ? 'bg-primary text-white' : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text'}`}>
                            <ClipboardList size={16} /> All
                        </button>
                    </div>
                    <button onClick={fetchPurchaseOrders} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border text-text dark:text-dark-text">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><ClipboardList size={20} className="text-blue-600 dark:text-blue-400" /></div><div><p className="text-2xl font-bold text-text dark:text-dark-text">{stats.total}</p><p className="text-xs text-text-secondary">Total POs</p></div></div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3"><div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg"><PlayCircle size={20} className="text-yellow-600 dark:text-yellow-400" /></div><div><p className="text-2xl font-bold text-text dark:text-dark-text">{stats.active}</p><p className="text-xs text-text-secondary">Active</p></div></div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3"><div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><CheckCircle size={20} className="text-green-600 dark:text-green-400" /></div><div><p className="text-2xl font-bold text-text dark:text-dark-text">{stats.statusCounts.Completed || 0}</p><p className="text-xs text-text-secondary">Completed</p></div></div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3"><div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"><Package size={20} className="text-indigo-600 dark:text-indigo-400" /></div><div><p className="text-2xl font-bold text-text dark:text-dark-text">{stats.totalPallets.toLocaleString()}</p><p className="text-xs text-text-secondary">Pallets</p></div></div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3"><div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Boxes size={20} className="text-purple-600 dark:text-purple-400" /></div><div><p className="text-2xl font-bold text-text dark:text-dark-text">{stats.totalKhatlis.toLocaleString()}</p><p className="text-xs text-text-secondary">Khatlis</p></div></div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3"><div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg"><Box size={20} className="text-orange-600 dark:text-orange-400" /></div><div><p className="text-2xl font-bold text-text dark:text-dark-text">{stats.totalBoxes.toLocaleString()}</p><p className="text-xs text-text-secondary">Total Boxes</p></div></div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex flex-wrap gap-2">
                    {statusTabs.map(tab => (
                        <button key={tab.key} onClick={() => setStatusFilter(tab.key)} className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === tab.key ? 'bg-primary text-white' : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border'}`}>
                            {tab.label} <span className={`px-1.5 py-0.5 rounded text-xs ${statusFilter === tab.key ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-700'}`}>{tab.count}</span>
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 md:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                    <input type="text" placeholder="Search PO, factory..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text" />
                </div>
            </div>

            {error && <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3"><AlertCircle size={20} /><span>{error}</span></div>}
            {loading && <div className="flex justify-center py-20"><Loader2 size={48} className="animate-spin text-primary" /></div>}

            {!loading && !error && (
                <>
                    {filteredOrders.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl bg-foreground dark:bg-dark-foreground">
                            <ClipboardList size={48} className="mx-auto text-text-secondary/30 mb-4" />
                            <h3 className="text-xl font-semibold text-text dark:text-dark-text">No Purchase Orders Found</h3>
                        </div>
                    ) : viewMode === 'grouped' ? (
                        <div className="space-y-6">
                            {groupedOrders.map(group => (
                                <div key={group.key} className="border border-border dark:border-dark-border rounded-xl overflow-hidden">
                                    <div className={`p-4 cursor-pointer flex items-center justify-between ${group.isManual ? 'bg-gray-100 dark:bg-gray-800' : 'bg-gradient-to-r from-primary/10 to-indigo-500/10'}`} onClick={() => toggleGroup(group.key)}>
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${group.isManual ? 'bg-gray-200 dark:bg-gray-700' : 'bg-primary/20'}`}>
                                                {group.isManual ? <FileText size={20} className="text-gray-600 dark:text-gray-400" /> : <Link2 size={20} className="text-primary" />}
                                            </div>
                                            <div>
                                                <p className="font-bold text-text dark:text-dark-text">{group.isManual ? 'Manual Purchase Orders' : `Restock: ${group.restockRequestId || 'Unknown'}`}</p>
                                                <p className="text-sm text-text-secondary">{group.orders.length} PO{group.orders.length !== 1 ? 's' : ''} • {group.totalPallets} pallets • {group.totalKhatlis} khatlis • {group.totalBoxes.toLocaleString()} boxes</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="hidden md:flex gap-2">
                                                {Object.entries(group.orders.reduce((acc, po) => { acc[po.status] = (acc[po.status] || 0) + 1; return acc; }, {})).map(([status, count]) => {
                                                    const config = getStatusConfig(status);
                                                    return <span key={status} className={`px-2 py-1 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>{count} {config.label}</span>;
                                                })}
                                            </div>
                                            {expandedGroups[group.key] ? <ChevronUp size={20} className="text-text-secondary" /> : <ChevronDown size={20} className="text-text-secondary" />}
                                        </div>
                                    </div>
                                    {expandedGroups[group.key] && (
                                        <div className="p-4 bg-foreground dark:bg-dark-foreground">
                                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{group.orders.map(po => renderPOCard(po))}</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{filteredOrders.map(po => renderPOCard(po))}</div>
                    )}
                </>
            )}
        </div>
    );
};

export default PurchaseOrderListPage;