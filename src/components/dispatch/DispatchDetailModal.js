// // FILE: frontend/src/components/dispatches/DispatchDetailModal.js

// import React, { useState, useMemo } from 'react';
// import {
//     X, Loader2, Package, Truck, Warehouse, Box, Layers, Calendar, FileText, MapPin,
//     User, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Boxes, History,
//     Trash2, Send, XCircle, RotateCcw
// } from 'lucide-react';
// import { updateDispatchStatus, deleteDispatch } from '../../api/dispatchApi';

// const DispatchDetailModal = ({ dispatch, onClose, onUpdate, onDelete }) => {
//     // ALL state with safe defaults
//     const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
//     const [isDeleting, setIsDeleting] = useState(false);
//     const [error, setError] = useState('');
//     const [expandedContainers, setExpandedContainers] = useState({});
//     const [showStatusHistory, setShowStatusHistory] = useState(false);
//     const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
//     const [deleteReason, setDeleteReason] = useState('');
//     const [statusNotes, setStatusNotes] = useState('');
//     const [showStatusModal, setShowStatusModal] = useState(false);
//     const [pendingStatus, setPendingStatus] = useState(null); // Changed from selectedStatus

//     // Status configuration
//     const statusConfig = {
//         'Pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', icon: Clock },
//         'Ready': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: CheckCircle2 },
//         'In Transit': { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300', icon: Truck },
//         'Delivered': { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle2 },
//         'Completed': { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
//         'Cancelled': { color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
//     };

//     // Valid statuses list
//     const VALID_STATUSES = ['Pending', 'Ready', 'In Transit', 'Delivered', 'Completed', 'Cancelled'];

//     // Get allowed next statuses based on current status
//     const getNextStatuses = (currentStatus) => {
//         if (!currentStatus || !VALID_STATUSES.includes(currentStatus)) {
//             return [];
//         }
//         const transitions = { 
//             'Pending': ['Ready', 'Cancelled'], 
//             'Ready': ['In Transit', 'Pending'],
//             'In Transit': ['Delivered'], 
//             'Delivered': ['Completed'], 
//             'Completed': [], 
//             'Cancelled': ['Pending']
//         };
//         return transitions[currentStatus] || [];
//     };

//     // Aggregate tile data - with safe checks
//     const tileAggregation = useMemo(() => {
//         if (!dispatch?.containers || !Array.isArray(dispatch.containers)) return [];
//         const tiles = {};
//         dispatch.containers.forEach((container) => {
//             if (!container?.items || !Array.isArray(container.items)) return;
//             container.items.forEach((item) => {
//                 if (!item) return;
//                 const tileKey = String(item.tileId || item.tileName || `unknown-${Math.random()}`);
//                 if (!tiles[tileKey]) {
//                     tiles[tileKey] = { 
//                         tileName: item.tileName || 'Unknown Tile', 
//                         tileId: item.tileId, 
//                         palletCount: 0, 
//                         khatliCount: 0, 
//                         palletBoxes: 0, 
//                         khatliBoxes: 0, 
//                         totalBoxes: 0 
//                     };
//                 }
//                 const quantity = Number(item.quantity) || 1;
//                 const boxes = (Number(item.boxCount) || 0) * quantity;
//                 if (item.itemType === 'Pallet') { 
//                     tiles[tileKey].palletCount += quantity; 
//                     tiles[tileKey].palletBoxes += boxes; 
//                 } else if (item.itemType === 'Khatli') { 
//                     tiles[tileKey].khatliCount += quantity; 
//                     tiles[tileKey].khatliBoxes += boxes; 
//                 }
//                 tiles[tileKey].totalBoxes += boxes;
//             });
//         });
//         return Object.values(tiles);
//     }, [dispatch?.containers]);

//     // Factory summary - with safe checks
//     const factorySummary = useMemo(() => {
//         if (!dispatch?.containers || !Array.isArray(dispatch.containers)) return [];
//         const factories = {};
//         dispatch.containers.forEach((container, idx) => {
//             if (!container) return;
//             const factoryKey = String(container.factory || container.factoryName || `factory-${idx}`);
//             const factoryName = container.factoryName || 'Unknown Factory';
//             if (!factories[factoryKey]) {
//                 factories[factoryKey] = { 
//                     factoryKey,
//                     factoryName, 
//                     containerCount: 0, 
//                     palletCount: 0, 
//                     khatliCount: 0, 
//                     totalBoxes: 0 
//                 };
//             }
//             factories[factoryKey].containerCount += 1;
//             if (container.items && Array.isArray(container.items)) {
//                 container.items.forEach((item) => {
//                     if (!item) return;
//                     const quantity = Number(item.quantity) || 1;
//                     const boxes = (Number(item.boxCount) || 0) * quantity;
//                     if (item.itemType === 'Pallet') {
//                         factories[factoryKey].palletCount += quantity;
//                     } else if (item.itemType === 'Khatli') {
//                         factories[factoryKey].khatliCount += quantity;
//                     }
//                     factories[factoryKey].totalBoxes += boxes;
//                 });
//             }
//         });
//         return Object.values(factories);
//     }, [dispatch?.containers]);

//     // Calculate totals - with safe checks
//     const totals = useMemo(() => {
//         const defaultTotals = { totalPallets: 0, totalKhatlis: 0, totalBoxes: 0, totalContainers: 0 };
//         if (!dispatch) return defaultTotals;
        
//         let totalPallets = 0;
//         let totalKhatlis = 0;
//         let totalBoxes = 0;
        
//         if (dispatch.stockSummary) {
//             totalPallets = Number(dispatch.stockSummary.totalPallets) || 0;
//             totalKhatlis = Number(dispatch.stockSummary.totalKhatlis) || 0;
//             totalBoxes = Number(dispatch.stockSummary.totalBoxes) || 0;
//         } else if (dispatch.containers && Array.isArray(dispatch.containers)) {
//             dispatch.containers.forEach(c => {
//                 if (c?.items && Array.isArray(c.items)) {
//                     c.items.forEach(item => {
//                         if (item?.itemType === 'Pallet') totalPallets++;
//                         else if (item?.itemType === 'Khatli') totalKhatlis++;
//                     });
//                 }
//                 totalBoxes += Number(c?.totalBoxes) || 0;
//             });
//         }
        
//         return {
//             totalPallets,
//             totalKhatlis,
//             totalBoxes,
//             totalContainers: dispatch.containers?.length || 0,
//         };
//     }, [dispatch]);

//     // Return null if no dispatch - EARLY RETURN
//     if (!dispatch) {
//         return null;
//     }

//     // Get current status safely
//     const currentStatus = dispatch.status && VALID_STATUSES.includes(dispatch.status) 
//         ? dispatch.status 
//         : 'Pending';

//     const toggleContainer = (containerId) => {
//         setExpandedContainers((prev) => ({ ...prev, [String(containerId)]: !prev[String(containerId)] }));
//     };

//     // Open status modal - DOES NOT CALL API
//     const openStatusModal = (status) => {
//         console.log('[Modal] Opening status modal for:', status);
//         setPendingStatus(status);
//         setStatusNotes('');
//         setShowStatusModal(true);
//     };

//     // Close status modal - DOES NOT CALL API
//     const closeStatusModal = () => {
//         console.log('[Modal] Closing status modal');
//         setShowStatusModal(false);
//         setPendingStatus(null);
//         setStatusNotes('');
//     };

//     // Handle status update - ONLY called when user clicks Confirm
//     const handleStatusUpdate = async () => {
//         console.log('[Modal] handleStatusUpdate called with pendingStatus:', pendingStatus);
        
//         if (!pendingStatus) {
//             setError('No status selected');
//             return;
//         }

//         if (!VALID_STATUSES.includes(pendingStatus)) {
//             setError(`Invalid status: ${pendingStatus}`);
//             return;
//         }
        
//         setIsUpdatingStatus(true); 
//         setError('');
        
//         try {
//             console.log('[Modal] Calling API with:', { id: dispatch._id, status: pendingStatus });
//             const updatedDispatch = await updateDispatchStatus(dispatch._id, pendingStatus, statusNotes || '');
//             console.log('[Modal] API success:', updatedDispatch);
            
//             if (onUpdate) {
//                 onUpdate(updatedDispatch);
//             }
//             closeStatusModal();
//         } catch (err) { 
//             console.error('[Modal] API error:', err);
//             const errorMessage = typeof err === 'string' ? err : (err?.message || 'Failed to update status');
//             setError(errorMessage); 
//         } finally { 
//             setIsUpdatingStatus(false); 
//         }
//     };

//     // Handle delete
//     const handleDelete = async () => {
//         setIsDeleting(true); 
//         setError('');
//         try { 
//             await deleteDispatch(dispatch._id, deleteReason || ''); 
//             if (onDelete) {
//                 onDelete(dispatch._id);
//             }
//             onClose(); 
//         } catch (err) { 
//             const errorMessage = typeof err === 'string' ? err : (err?.message || 'Failed to delete dispatch');
//             setError(errorMessage); 
//         } finally { 
//             setIsDeleting(false); 
//         }
//     };

//     // Format helpers
//     const formatDate = (date) => {
//         if (!date) return 'N/A';
//         try {
//             return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
//         } catch {
//             return 'N/A';
//         }
//     };
    
//     const formatDateTime = (date) => {
//         if (!date) return 'N/A';
//         try {
//             return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
//         } catch {
//             return 'N/A';
//         }
//     };

//     const StatusIcon = statusConfig[currentStatus]?.icon || Clock;
//     const nextStatuses = getNextStatuses(currentStatus);
//     const { totalPallets, totalKhatlis, totalBoxes, totalContainers } = totals;

//     return (
//         <>
//             {/* Main Modal */}
//             <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
//                 <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    
//                     {/* Header */}
//                     <div className="flex justify-between items-start p-5 border-b border-border dark:border-dark-border">
//                         <div className="flex-1">
//                             <div className="flex items-center gap-3 mb-1">
//                                 <h1 className="text-2xl font-bold text-text dark:text-dark-text">Dispatch Details</h1>
//                                 <span className={`px-3 py-1 text-sm font-bold rounded-full flex items-center gap-1.5 ${statusConfig[currentStatus]?.color || 'bg-gray-100 text-gray-800'}`}>
//                                     <StatusIcon size={14} />
//                                     {currentStatus}
//                                 </span>
//                             </div>
//                             <p className="font-mono text-primary dark:text-blue-400 text-lg">{dispatch.dispatchNumber || 'N/A'}</p>
//                         </div>
//                         <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background transition-colors">
//                             <X size={24} className="text-text-secondary" />
//                         </button>
//                     </div>

//                     {/* Error Display */}
//                     {error && (
//                         <div className="mx-5 mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
//                             <AlertCircle size={18} />
//                             <span className="flex-1">{error}</span>
//                             <button onClick={() => setError('')} className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded">
//                                 <X size={14} />
//                             </button>
//                         </div>
//                     )}

//                     {/* Scrollable Content */}
//                     <div className="flex-grow overflow-y-auto p-5 space-y-6">
                        
//                         {/* Summary Cards */}
//                         <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                             <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
//                                 <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
//                                     <Package size={18} />
//                                     <span className="text-sm font-medium">Containers</span>
//                                 </div>
//                                 <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalContainers}</p>
//                             </div>
//                             <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
//                                 <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
//                                     <Layers size={18} />
//                                     <span className="text-sm font-medium">Pallets</span>
//                                 </div>
//                                 <p className="text-3xl font-bold text-green-700 dark:text-green-300">{totalPallets}</p>
//                             </div>
//                             <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
//                                 <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
//                                     <Boxes size={18} />
//                                     <span className="text-sm font-medium">Khatlis</span>
//                                 </div>
//                                 <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{totalKhatlis}</p>
//                             </div>
//                             <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
//                                 <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
//                                     <Box size={18} />
//                                     <span className="text-sm font-medium">Total Boxes</span>
//                                 </div>
//                                 <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{totalBoxes.toLocaleString()}</p>
//                             </div>
//                         </div>

//                         {/* Dispatch Info */}
//                         <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
//                             <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
//                                 <FileText size={20} className="text-primary" />
//                                 Dispatch Information
//                             </h3>
//                             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                                 <div className="flex items-start gap-3">
//                                     <div className="p-2 bg-primary/10 rounded-lg"><FileText size={18} className="text-primary" /></div>
//                                     <div>
//                                         <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Invoice Number</p>
//                                         <p className="font-semibold text-text dark:text-dark-text">{dispatch.invoiceNumber || 'N/A'}</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-start gap-3">
//                                     <div className="p-2 bg-primary/10 rounded-lg"><Calendar size={18} className="text-primary" /></div>
//                                     <div>
//                                         <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Dispatch Date</p>
//                                         <p className="font-semibold text-text dark:text-dark-text">{formatDate(dispatch.dispatchDate)}</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-start gap-3">
//                                     <div className="p-2 bg-primary/10 rounded-lg"><MapPin size={18} className="text-primary" /></div>
//                                     <div>
//                                         <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Destination</p>
//                                         <p className="font-semibold text-text dark:text-dark-text">{dispatch.destination || 'N/A'}</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-start gap-3">
//                                     <div className="p-2 bg-primary/10 rounded-lg"><User size={18} className="text-primary" /></div>
//                                     <div>
//                                         <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Created By</p>
//                                         <p className="font-semibold text-text dark:text-dark-text">{dispatch.createdBy?.username || 'N/A'}</p>
//                                     </div>
//                                 </div>
//                                 <div className="flex items-start gap-3">
//                                     <div className="p-2 bg-primary/10 rounded-lg"><Clock size={18} className="text-primary" /></div>
//                                     <div>
//                                         <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Created At</p>
//                                         <p className="font-semibold text-text dark:text-dark-text">{formatDateTime(dispatch.createdAt)}</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Tile Summary Table */}
//                         {tileAggregation.length > 0 && (
//                             <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
//                                 <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
//                                     <Layers size={20} className="text-primary" />
//                                     Tile Summary ({tileAggregation.length} Types)
//                                 </h3>
//                                 <div className="overflow-x-auto">
//                                     <table className="w-full text-sm">
//                                         <thead>
//                                             <tr className="border-b border-border dark:border-dark-border">
//                                                 <th className="text-left py-2 px-3 text-text-secondary dark:text-dark-text-secondary font-medium">Tile Name</th>
//                                                 <th className="text-center py-2 px-3 text-green-600 dark:text-green-400 font-medium">Pallets</th>
//                                                 <th className="text-center py-2 px-3 text-green-600 dark:text-green-400 font-medium">Pallet Boxes</th>
//                                                 <th className="text-center py-2 px-3 text-purple-600 dark:text-purple-400 font-medium">Khatlis</th>
//                                                 <th className="text-center py-2 px-3 text-purple-600 dark:text-purple-400 font-medium">Khatli Boxes</th>
//                                                 <th className="text-center py-2 px-3 text-orange-600 dark:text-orange-400 font-medium">Total Boxes</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {tileAggregation.map((tile, idx) => (
//                                                 <tr key={`tile-${idx}-${tile.tileName}`} className="border-b border-border/50 dark:border-dark-border/50">
//                                                     <td className="py-2 px-3 text-text dark:text-dark-text font-medium">{tile.tileName}</td>
//                                                     <td className="py-2 px-3 text-center text-green-600 dark:text-green-400 font-bold">{tile.palletCount}</td>
//                                                     <td className="py-2 px-3 text-center text-green-700 dark:text-green-300">{tile.palletBoxes}</td>
//                                                     <td className="py-2 px-3 text-center text-purple-600 dark:text-purple-400 font-bold">{tile.khatliCount}</td>
//                                                     <td className="py-2 px-3 text-center text-purple-700 dark:text-purple-300">{tile.khatliBoxes}</td>
//                                                     <td className="py-2 px-3 text-center">
//                                                         <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded font-bold">{tile.totalBoxes}</span>
//                                                     </td>
//                                                 </tr>
//                                             ))}
//                                             <tr className="bg-gray-50 dark:bg-gray-800/50 font-bold">
//                                                 <td className="py-2 px-3 text-text dark:text-dark-text">Total</td>
//                                                 <td className="py-2 px-3 text-center text-green-600 dark:text-green-400">{totalPallets}</td>
//                                                 <td className="py-2 px-3 text-center text-green-700 dark:text-green-300">{tileAggregation.reduce((s, t) => s + t.palletBoxes, 0)}</td>
//                                                 <td className="py-2 px-3 text-center text-purple-600 dark:text-purple-400">{totalKhatlis}</td>
//                                                 <td className="py-2 px-3 text-center text-purple-700 dark:text-purple-300">{tileAggregation.reduce((s, t) => s + t.khatliBoxes, 0)}</td>
//                                                 <td className="py-2 px-3 text-center">
//                                                     <span className="bg-orange-200 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded">{totalBoxes}</span>
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         )}

//                         {/* Factory Summary */}
//                         {factorySummary.length > 0 && (
//                             <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
//                                 <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
//                                     <Warehouse size={20} className="text-primary" />
//                                     Factory-wise Summary
//                                 </h3>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                     {factorySummary.map((factory, idx) => (
//                                         <div key={`factory-${idx}-${factory.factoryKey}`} className="bg-foreground dark:bg-dark-foreground rounded-lg p-4 border border-border dark:border-dark-border">
//                                             <div className="flex items-center gap-2 mb-3">
//                                                 <Warehouse size={18} className="text-primary" />
//                                                 <h4 className="font-semibold text-text dark:text-dark-text">{factory.factoryName}</h4>
//                                             </div>
//                                             <div className="grid grid-cols-4 gap-2 text-sm">
//                                                 <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
//                                                     <p className="text-blue-600 dark:text-blue-400 font-bold">{factory.containerCount}</p>
//                                                     <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Containers</p>
//                                                 </div>
//                                                 <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
//                                                     <p className="text-green-600 dark:text-green-400 font-bold">{factory.palletCount}</p>
//                                                     <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pallets</p>
//                                                 </div>
//                                                 <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
//                                                     <p className="text-purple-600 dark:text-purple-400 font-bold">{factory.khatliCount}</p>
//                                                     <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Khatlis</p>
//                                                 </div>
//                                                 <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
//                                                     <p className="text-orange-600 dark:text-orange-400 font-bold">{factory.totalBoxes.toLocaleString()}</p>
//                                                     <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Boxes</p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                         )}

//                         {/* Containers List */}
//                         <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
//                             <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
//                                 <Package size={20} className="text-primary" />
//                                 Containers ({totalContainers})
//                             </h3>
//                             <div className="space-y-3">
//                                 {(dispatch.containers || []).map((container, index) => {
//                                     const containerKey = String(container?.containerId || `container-${index}`);
//                                     const isExpanded = expandedContainers[containerKey];
//                                     const containerPallets = (container?.items || []).filter((i) => i?.itemType === 'Pallet').length;
//                                     const containerKhatlis = (container?.items || []).filter((i) => i?.itemType === 'Khatli').length;
//                                     const containerBoxes = container?.totalBoxes || (container?.items || []).reduce((sum, i) => sum + ((Number(i?.boxCount) || 0) * (Number(i?.quantity) || 1)), 0);
                                    
//                                     const itemsByTile = {};
//                                     (container?.items || []).forEach((item, itemIdx) => { 
//                                         if (!item) return;
//                                         const key = `${item.tileName || 'Unknown'}-${item.itemType || 'Unknown'}-${item.boxCount || 0}-${itemIdx}`; 
//                                         if (!itemsByTile[key]) {
//                                             itemsByTile[key] = { tileName: item.tileName || 'Unknown', itemType: item.itemType || 'Unknown', boxCount: Number(item.boxCount) || 0, count: 0 }; 
//                                         }
//                                         itemsByTile[key].count += Number(item.quantity) || 1; 
//                                     });
                                    
//                                     return (
//                                         <div key={containerKey} className="border border-border dark:border-dark-border rounded-lg overflow-hidden">
//                                             <div 
//                                                 className="flex items-center justify-between p-4 bg-foreground dark:bg-dark-foreground cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" 
//                                                 onClick={() => toggleContainer(containerKey)}
//                                             >
//                                                 <div className="flex items-center gap-4">
//                                                     <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
//                                                         <Package size={20} className="text-blue-600 dark:text-blue-400" />
//                                                     </div>
//                                                     <div>
//                                                         <h4 className="font-bold text-text dark:text-dark-text">{container?.containerNumber || 'N/A'}</h4>
//                                                         <div className="flex items-center gap-3 text-sm text-text-secondary dark:text-dark-text-secondary">
//                                                             <span className="flex items-center gap-1"><Truck size={14} />{container?.truckNumber || 'N/A'}</span>
//                                                             <span className="flex items-center gap-1"><Warehouse size={14} />{container?.factoryName || 'Unknown'}</span>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                                 <div className="flex items-center gap-4">
//                                                     <div className="flex gap-3 text-sm">
//                                                         <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">{containerPallets}P</span>
//                                                         <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">{containerKhatlis}K</span>
//                                                         <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded font-medium">{containerBoxes} boxes</span>
//                                                     </div>
//                                                     {isExpanded ? <ChevronUp size={20} className="text-text-secondary" /> : <ChevronDown size={20} className="text-text-secondary" />}
//                                                 </div>
//                                             </div>
//                                             {isExpanded && (
//                                                 <div className="p-4 border-t border-border dark:border-dark-border bg-gray-50 dark:bg-gray-900/30">
//                                                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
//                                                         {Object.entries(itemsByTile).map(([itemKey, item]) => (
//                                                             <div 
//                                                                 key={itemKey}
//                                                                 className={`p-3 rounded-lg border ${item.itemType === 'Pallet' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'}`}
//                                                             >
//                                                                 <div className="flex justify-between items-start mb-2">
//                                                                     <p className="font-semibold text-text dark:text-dark-text text-sm">{item.tileName}</p>
//                                                                     <span className={`px-2 py-0.5 text-xs font-bold rounded ${item.itemType === 'Pallet' ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' : 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200'}`}>
//                                                                         {item.itemType}
//                                                                     </span>
//                                                                 </div>
//                                                                 <div className="flex justify-between text-sm">
//                                                                     <span className="text-text-secondary dark:text-dark-text-secondary">{item.boxCount} boxes × {item.count}</span>
//                                                                     <span className="font-bold text-text dark:text-dark-text">= {item.boxCount * item.count} boxes</span>
//                                                                 </div>
//                                                             </div>
//                                                         ))}
//                                                     </div>
//                                                 </div>
//                                             )}
//                                         </div>
//                                     );
//                                 })}
//                             </div>
//                         </div>

//                         {/* Status History */}
//                         {dispatch.statusHistory && dispatch.statusHistory.length > 0 && (
//                             <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
//                                 <button onClick={() => setShowStatusHistory(!showStatusHistory)} className="w-full flex items-center justify-between text-lg font-semibold text-text dark:text-dark-text">
//                                     <span className="flex items-center gap-2"><History size={20} className="text-primary" />Status History ({dispatch.statusHistory.length})</span>
//                                     {showStatusHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
//                                 </button>
//                                 {showStatusHistory && (
//                                     <div className="mt-4 space-y-3">
//                                         {[...dispatch.statusHistory].reverse().map((history, index) => (
//                                             <div key={`history-${index}-${history.status}`} className="flex items-start gap-3 p-3 bg-foreground dark:bg-dark-foreground rounded-lg">
//                                                 <div className={`p-2 rounded-full ${statusConfig[history.status]?.color || 'bg-gray-100 dark:bg-gray-800'}`}>
//                                                     {React.createElement(statusConfig[history.status]?.icon || Clock, { size: 16 })}
//                                                 </div>
//                                                 <div className="flex-1">
//                                                     <div className="flex items-center justify-between">
//                                                         <p className="font-semibold text-text dark:text-dark-text">{history.status}</p>
//                                                         <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{formatDateTime(history.changedAt)}</p>
//                                                     </div>
//                                                     {history.changedBy && <p className="text-sm text-text-secondary dark:text-dark-text-secondary">by {history.changedBy?.username || 'Unknown'}</p>}
//                                                     {history.notes && <p className="text-sm text-text dark:text-dark-text mt-1 italic">"{history.notes}"</p>}
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>
//                         )}
//                     </div>

//                     {/* Footer with action buttons */}
//                     <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex flex-wrap justify-between items-center gap-3">
//                         <div className="flex gap-2">
//                             {currentStatus === 'Pending' && (
//                                 <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
//                                     <Trash2 size={16} />Delete
//                                 </button>
//                             )}
//                         </div>
//                         <div className="flex gap-2 flex-wrap">
//                             <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border transition-colors">Close</button>
//                             {nextStatuses.map((status) => (
//                                 <button 
//                                     key={`btn-${status}`}
//                                     onClick={() => openStatusModal(status)}
//                                     className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
//                                         status === 'Cancelled' ? 'bg-red-600 hover:bg-red-700 text-white' : 
//                                         status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
//                                         'bg-primary hover:bg-primary-hover text-white'
//                                     }`}
//                                 >
//                                     {status === 'In Transit' && <Send size={16} />}
//                                     {(status === 'Delivered' || status === 'Ready' || status === 'Completed') && <CheckCircle2 size={16} />}
//                                     {status === 'Cancelled' && <XCircle size={16} />}
//                                     {status === 'Pending' && <RotateCcw size={16} />}
//                                     Mark as {status}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Status Update Confirmation Modal */}
//             {showStatusModal && pendingStatus && (
//                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
//                     <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-md p-6">
//                         <h3 className="text-xl font-bold text-text dark:text-dark-text mb-4">
//                             Update Status to "{pendingStatus}"
//                         </h3>
//                         <div className="mb-4">
//                             <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">Notes (Optional)</label>
//                             <textarea 
//                                 value={statusNotes} 
//                                 onChange={(e) => setStatusNotes(e.target.value)} 
//                                 className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent" 
//                                 rows={3} 
//                                 placeholder="Add any notes..." 
//                             />
//                         </div>
//                         <div className="flex justify-end gap-3">
//                             <button onClick={closeStatusModal} className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border">Cancel</button>
//                             <button 
//                                 onClick={handleStatusUpdate} 
//                                 disabled={isUpdatingStatus} 
//                                 className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2"
//                             >
//                                 {isUpdatingStatus && <Loader2 size={16} className="animate-spin" />}
//                                 Confirm
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Delete Confirmation Modal */}
//             {showDeleteConfirm && (
//                 <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
//                     <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-md p-6">
//                         <div className="flex items-center gap-3 mb-4">
//                             <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full"><AlertCircle size={24} className="text-red-600 dark:text-red-400" /></div>
//                             <h3 className="text-xl font-bold text-text dark:text-dark-text">Delete Dispatch?</h3>
//                         </div>
//                         <p className="text-text-secondary dark:text-dark-text-secondary mb-4">This will delete dispatch <strong>{dispatch.dispatchNumber}</strong> and revert all container statuses.</p>
//                         <div className="mb-4">
//                             <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">Reason for deletion</label>
//                             <textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:ring-2 focus:ring-red-500 focus:border-transparent" rows={2} placeholder="Enter reason..." />
//                         </div>
//                         <div className="flex justify-end gap-3">
//                             <button onClick={() => { setShowDeleteConfirm(false); setDeleteReason(''); }} className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border">Cancel</button>
//                             <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
//                                 {isDeleting && <Loader2 size={16} className="animate-spin" />}Delete Dispatch
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default DispatchDetailModal;

// FILE: frontend/src/components/dispatches/DispatchDetailModal.js

import React, { useState, useMemo } from 'react';
import {
    X, Loader2, Package, Truck, Warehouse, Box, Layers, Calendar, FileText, MapPin,
    User, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Boxes, History,
    Trash2, Send, XCircle, RotateCcw, FileSpreadsheet, Download
} from 'lucide-react';
import { updateDispatchStatus, deleteDispatch } from '../../api/dispatchApi';
import { generatePDFReport, generateExcelReport, formatDate as formatReportDate } from '../../utils/reportGenerator';
import ReportExportButtons from '../common/ReportExportButtons';

const DispatchDetailModal = ({ dispatch, onClose, onUpdate, onDelete }) => {
    // ALL state with safe defaults
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [expandedContainers, setExpandedContainers] = useState({});
    const [showStatusHistory, setShowStatusHistory] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [pendingStatus, setPendingStatus] = useState(null); // Changed from selectedStatus

    // Status configuration
    const statusConfig = {
        'Pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', icon: Clock },
        'Ready': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: CheckCircle2 },
        'In Transit': { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300', icon: Truck },
        'Delivered': { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle2 },
        'Completed': { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
        'Cancelled': { color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
    };

    // Valid statuses list
    const VALID_STATUSES = ['Pending', 'Ready', 'In Transit', 'Delivered', 'Completed', 'Cancelled'];

    // Get allowed next statuses based on current status
    const getNextStatuses = (currentStatus) => {
        if (!currentStatus || !VALID_STATUSES.includes(currentStatus)) {
            return [];
        }
        const transitions = { 
            'Pending': ['Ready', 'Cancelled'], 
            'Ready': ['In Transit', 'Pending'],
            'In Transit': ['Delivered'], 
            'Delivered': ['Completed'], 
            'Completed': [], 
            'Cancelled': ['Pending']
        };
        return transitions[currentStatus] || [];
    };

    // Aggregate tile data - with safe checks
    const tileAggregation = useMemo(() => {
        if (!dispatch?.containers || !Array.isArray(dispatch.containers)) return [];
        const tiles = {};
        dispatch.containers.forEach((container) => {
            if (!container?.items || !Array.isArray(container.items)) return;
            container.items.forEach((item) => {
                if (!item) return;
                const tileKey = String(item.tileId || item.tileName || `unknown-${Math.random()}`);
                if (!tiles[tileKey]) {
                    tiles[tileKey] = { 
                        tileName: item.tileName || 'Unknown Tile', 
                        tileId: item.tileId, 
                        palletCount: 0, 
                        khatliCount: 0, 
                        palletBoxes: 0, 
                        khatliBoxes: 0, 
                        totalBoxes: 0 
                    };
                }
                const quantity = Number(item.quantity) || 1;
                const boxes = (Number(item.boxCount) || 0) * quantity;
                if (item.itemType === 'Pallet') { 
                    tiles[tileKey].palletCount += quantity; 
                    tiles[tileKey].palletBoxes += boxes; 
                } else if (item.itemType === 'Khatli') { 
                    tiles[tileKey].khatliCount += quantity; 
                    tiles[tileKey].khatliBoxes += boxes; 
                }
                tiles[tileKey].totalBoxes += boxes;
            });
        });
        return Object.values(tiles);
    }, [dispatch?.containers]);

    // Factory summary - with safe checks
    const factorySummary = useMemo(() => {
        if (!dispatch?.containers || !Array.isArray(dispatch.containers)) return [];
        const factories = {};
        dispatch.containers.forEach((container, idx) => {
            if (!container) return;
            const factoryKey = String(container.factory || container.factoryName || `factory-${idx}`);
            const factoryName = container.factoryName || 'Unknown Factory';
            if (!factories[factoryKey]) {
                factories[factoryKey] = { 
                    factoryKey,
                    factoryName, 
                    containerCount: 0, 
                    palletCount: 0, 
                    khatliCount: 0, 
                    totalBoxes: 0 
                };
            }
            factories[factoryKey].containerCount += 1;
            if (container.items && Array.isArray(container.items)) {
                container.items.forEach((item) => {
                    if (!item) return;
                    const quantity = Number(item.quantity) || 1;
                    const boxes = (Number(item.boxCount) || 0) * quantity;
                    if (item.itemType === 'Pallet') {
                        factories[factoryKey].palletCount += quantity;
                    } else if (item.itemType === 'Khatli') {
                        factories[factoryKey].khatliCount += quantity;
                    }
                    factories[factoryKey].totalBoxes += boxes;
                });
            }
        });
        return Object.values(factories);
    }, [dispatch?.containers]);

    // Calculate totals - with safe checks
    const totals = useMemo(() => {
        const defaultTotals = { totalPallets: 0, totalKhatlis: 0, totalBoxes: 0, totalContainers: 0 };
        if (!dispatch) return defaultTotals;
        
        let totalPallets = 0;
        let totalKhatlis = 0;
        let totalBoxes = 0;
        
        if (dispatch.stockSummary) {
            totalPallets = Number(dispatch.stockSummary.totalPallets) || 0;
            totalKhatlis = Number(dispatch.stockSummary.totalKhatlis) || 0;
            totalBoxes = Number(dispatch.stockSummary.totalBoxes) || 0;
        } else if (dispatch.containers && Array.isArray(dispatch.containers)) {
            dispatch.containers.forEach(c => {
                if (c?.items && Array.isArray(c.items)) {
                    c.items.forEach(item => {
                        if (item?.itemType === 'Pallet') totalPallets++;
                        else if (item?.itemType === 'Khatli') totalKhatlis++;
                    });
                }
                totalBoxes += Number(c?.totalBoxes) || 0;
            });
        }
        
        return {
            totalPallets,
            totalKhatlis,
            totalBoxes,
            totalContainers: dispatch.containers?.length || 0,
        };
    }, [dispatch]);

    // Return null if no dispatch - EARLY RETURN
    if (!dispatch) {
        return null;
    }

    // Get current status safely
    const currentStatus = dispatch.status && VALID_STATUSES.includes(dispatch.status) 
        ? dispatch.status 
        : 'Pending';

    const toggleContainer = (containerId) => {
        setExpandedContainers((prev) => ({ ...prev, [String(containerId)]: !prev[String(containerId)] }));
    };

    // Open status modal - DOES NOT CALL API
    const openStatusModal = (status) => {
        console.log('[Modal] Opening status modal for:', status);
        setPendingStatus(status);
        setStatusNotes('');
        setShowStatusModal(true);
    };

    // Close status modal - DOES NOT CALL API
    const closeStatusModal = () => {
        console.log('[Modal] Closing status modal');
        setShowStatusModal(false);
        setPendingStatus(null);
        setStatusNotes('');
    };

    // Handle status update - ONLY called when user clicks Confirm
    const handleStatusUpdate = async () => {
        console.log('[Modal] handleStatusUpdate called with pendingStatus:', pendingStatus);
        
        if (!pendingStatus) {
            setError('No status selected');
            return;
        }

        if (!VALID_STATUSES.includes(pendingStatus)) {
            setError(`Invalid status: ${pendingStatus}`);
            return;
        }
        
        setIsUpdatingStatus(true); 
        setError('');
        
        try {
            console.log('[Modal] Calling API with:', { id: dispatch._id, status: pendingStatus });
            const updatedDispatch = await updateDispatchStatus(dispatch._id, pendingStatus, statusNotes || '');
            console.log('[Modal] API success:', updatedDispatch);
            
            if (onUpdate) {
                onUpdate(updatedDispatch);
            }
            closeStatusModal();
        } catch (err) { 
            console.error('[Modal] API error:', err);
            const errorMessage = typeof err === 'string' ? err : (err?.message || 'Failed to update status');
            setError(errorMessage); 
        } finally { 
            setIsUpdatingStatus(false); 
        }
    };

    // Handle delete
    const handleDelete = async () => {
        setIsDeleting(true); 
        setError('');
        try { 
            await deleteDispatch(dispatch._id, deleteReason || ''); 
            if (onDelete) {
                onDelete(dispatch._id);
            }
            onClose(); 
        } catch (err) { 
            const errorMessage = typeof err === 'string' ? err : (err?.message || 'Failed to delete dispatch');
            setError(errorMessage); 
        } finally { 
            setIsDeleting(false); 
        }
    };

    // ===== EXPORT HANDLERS =====
    const handleExportPDF = async () => {
        const headerInfo = [
            { label: 'Dispatch Number', value: dispatch.dispatchNumber || 'N/A' },
            { label: 'Destination', value: dispatch.destination || 'N/A' },
            { label: 'Status', value: currentStatus },
            { label: 'Dispatch Date', value: formatDate(dispatch.dispatchDate) },
            { label: 'Vehicle Number', value: dispatch.vehicleNumber || 'N/A' },
            { label: 'Driver Name', value: dispatch.driverName || 'N/A' },
            { label: 'Driver Phone', value: dispatch.driverPhone || 'N/A' },
            { label: 'Created By', value: dispatch.createdBy?.username || 'N/A' },
            { label: 'Created Date', value: formatDate(dispatch.createdAt) },
        ];

        const summaryData = [
            { label: 'Total Containers', value: totalContainers, color: 'purple' },
            { label: 'Total Pallets', value: totalPallets, color: 'blue' },
            { label: 'Total Khatlis', value: totalKhatlis, color: 'orange' },
            { label: 'Total Boxes', value: totalBoxes, color: 'green' },
        ];

        const tableColumns = [
            { key: 'sNo', header: 'S.No', width: 15 },
            { key: 'tileName', header: 'Tile Name', width: 50 },
            { key: 'palletCount', header: 'Pallets', width: 25, align: 'center' },
            { key: 'khatliCount', header: 'Khatlis', width: 25, align: 'center' },
            { key: 'palletBoxes', header: 'Pallet Boxes', width: 30, align: 'right' },
            { key: 'khatliBoxes', header: 'Khatli Boxes', width: 30, align: 'right' },
            { key: 'totalBoxes', header: 'Total Boxes', width: 30, align: 'right' },
        ];

        const tableData = tileAggregation.map((tile, idx) => ({
            sNo: idx + 1,
            ...tile
        }));

        await generatePDFReport({
            title: `Dispatch Order - ${dispatch.dispatchNumber || 'N/A'}`,
            subtitle: `Destination: ${dispatch.destination || 'N/A'} | Status: ${currentStatus}`,
            headerInfo,
            summaryData,
            tableColumns,
            tableData,
            fileName: `dispatch_${dispatch.dispatchNumber || 'report'}`,
            orientation: 'landscape',
        });
    };

    const handleExportExcel = async () => {
        const headerInfo = [
            { label: 'Dispatch Number', value: dispatch.dispatchNumber || 'N/A' },
            { label: 'Destination', value: dispatch.destination || 'N/A' },
            { label: 'Status', value: currentStatus },
            { label: 'Dispatch Date', value: formatDate(dispatch.dispatchDate) },
            { label: 'Vehicle Number', value: dispatch.vehicleNumber || 'N/A' },
            { label: 'Driver Name', value: dispatch.driverName || 'N/A' },
            { label: 'Driver Phone', value: dispatch.driverPhone || 'N/A' },
        ];

        const summaryData = [
            { label: 'Total Containers', value: totalContainers },
            { label: 'Total Pallets', value: totalPallets },
            { label: 'Total Khatlis', value: totalKhatlis },
            { label: 'Total Boxes', value: totalBoxes },
        ];

        const tableColumns = [
            { key: 'sNo', header: 'S.No' },
            { key: 'tileName', header: 'Tile Name' },
            { key: 'palletCount', header: 'Pallets' },
            { key: 'khatliCount', header: 'Khatlis' },
            { key: 'palletBoxes', header: 'Pallet Boxes' },
            { key: 'khatliBoxes', header: 'Khatli Boxes' },
            { key: 'totalBoxes', header: 'Total Boxes' },
        ];

        const tableData = tileAggregation.map((tile, idx) => ({
            sNo: idx + 1,
            ...tile
        }));

        await generateExcelReport({
            title: `Dispatch Order - ${dispatch.dispatchNumber || 'N/A'}`,
            headerInfo,
            summaryData,
            tableColumns,
            tableData,
            fileName: `dispatch_${dispatch.dispatchNumber || 'report'}`,
            sheetName: 'Dispatch Details',
        });
    };

    // Format helpers
    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return 'N/A';
        }
    };
    
    const formatDateTime = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch {
            return 'N/A';
        }
    };

    const StatusIcon = statusConfig[currentStatus]?.icon || Clock;
    const nextStatuses = getNextStatuses(currentStatus);
    const { totalPallets, totalKhatlis, totalBoxes, totalContainers } = totals;

    return (
        <>
            {/* Main Modal */}
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start p-5 border-b border-border dark:border-dark-border">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-text dark:text-dark-text">Dispatch Details</h1>
                                <span className={`px-3 py-1 text-sm font-bold rounded-full flex items-center gap-1.5 ${statusConfig[currentStatus]?.color || 'bg-gray-100 text-gray-800'}`}>
                                    <StatusIcon size={14} />
                                    {currentStatus}
                                </span>
                            </div>
                            <p className="font-mono text-primary dark:text-blue-400 text-lg">{dispatch.dispatchNumber || 'N/A'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <ReportExportButtons 
                                onExportPDF={handleExportPDF}
                                onExportExcel={handleExportExcel}
                                variant="icons"
                            />
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background transition-colors">
                                <X size={24} className="text-text-secondary" />
                            </button>
                        </div>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <div className="mx-5 mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2">
                            <AlertCircle size={18} />
                            <span className="flex-1">{error}</span>
                            <button onClick={() => setError('')} className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {/* Scrollable Content */}
                    <div className="flex-grow overflow-y-auto p-5 space-y-6">
                        
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1">
                                    <Package size={18} />
                                    <span className="text-sm font-medium">Containers</span>
                                </div>
                                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalContainers}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1">
                                    <Layers size={18} />
                                    <span className="text-sm font-medium">Pallets</span>
                                </div>
                                <p className="text-3xl font-bold text-green-700 dark:text-green-300">{totalPallets}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1">
                                    <Boxes size={18} />
                                    <span className="text-sm font-medium">Khatlis</span>
                                </div>
                                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{totalKhatlis}</p>
                            </div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1">
                                    <Box size={18} />
                                    <span className="text-sm font-medium">Total Boxes</span>
                                </div>
                                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{totalBoxes.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Dispatch Info */}
                        <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
                            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-primary" />
                                Dispatch Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg"><FileText size={18} className="text-primary" /></div>
                                    <div>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Invoice Number</p>
                                        <p className="font-semibold text-text dark:text-dark-text">{dispatch.invoiceNumber || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg"><Calendar size={18} className="text-primary" /></div>
                                    <div>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Dispatch Date</p>
                                        <p className="font-semibold text-text dark:text-dark-text">{formatDate(dispatch.dispatchDate)}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg"><MapPin size={18} className="text-primary" /></div>
                                    <div>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Destination</p>
                                        <p className="font-semibold text-text dark:text-dark-text">{dispatch.destination || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg"><User size={18} className="text-primary" /></div>
                                    <div>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Created By</p>
                                        <p className="font-semibold text-text dark:text-dark-text">{dispatch.createdBy?.username || 'N/A'}</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg"><Clock size={18} className="text-primary" /></div>
                                    <div>
                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Created At</p>
                                        <p className="font-semibold text-text dark:text-dark-text">{formatDateTime(dispatch.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tile Summary Table */}
                        {tileAggregation.length > 0 && (
                            <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                                    <Layers size={20} className="text-primary" />
                                    Tile Summary ({tileAggregation.length} Types)
                                </h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-border dark:border-dark-border">
                                                <th className="text-left py-2 px-3 text-text-secondary dark:text-dark-text-secondary font-medium">Tile Name</th>
                                                <th className="text-center py-2 px-3 text-green-600 dark:text-green-400 font-medium">Pallets</th>
                                                <th className="text-center py-2 px-3 text-green-600 dark:text-green-400 font-medium">Pallet Boxes</th>
                                                <th className="text-center py-2 px-3 text-purple-600 dark:text-purple-400 font-medium">Khatlis</th>
                                                <th className="text-center py-2 px-3 text-purple-600 dark:text-purple-400 font-medium">Khatli Boxes</th>
                                                <th className="text-center py-2 px-3 text-orange-600 dark:text-orange-400 font-medium">Total Boxes</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tileAggregation.map((tile, idx) => (
                                                <tr key={`tile-${idx}-${tile.tileName}`} className="border-b border-border/50 dark:border-dark-border/50">
                                                    <td className="py-2 px-3 text-text dark:text-dark-text font-medium">{tile.tileName}</td>
                                                    <td className="py-2 px-3 text-center text-green-600 dark:text-green-400 font-bold">{tile.palletCount}</td>
                                                    <td className="py-2 px-3 text-center text-green-700 dark:text-green-300">{tile.palletBoxes}</td>
                                                    <td className="py-2 px-3 text-center text-purple-600 dark:text-purple-400 font-bold">{tile.khatliCount}</td>
                                                    <td className="py-2 px-3 text-center text-purple-700 dark:text-purple-300">{tile.khatliBoxes}</td>
                                                    <td className="py-2 px-3 text-center">
                                                        <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded font-bold">{tile.totalBoxes}</span>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="bg-gray-50 dark:bg-gray-800/50 font-bold">
                                                <td className="py-2 px-3 text-text dark:text-dark-text">Total</td>
                                                <td className="py-2 px-3 text-center text-green-600 dark:text-green-400">{totalPallets}</td>
                                                <td className="py-2 px-3 text-center text-green-700 dark:text-green-300">{tileAggregation.reduce((s, t) => s + t.palletBoxes, 0)}</td>
                                                <td className="py-2 px-3 text-center text-purple-600 dark:text-purple-400">{totalKhatlis}</td>
                                                <td className="py-2 px-3 text-center text-purple-700 dark:text-purple-300">{tileAggregation.reduce((s, t) => s + t.khatliBoxes, 0)}</td>
                                                <td className="py-2 px-3 text-center">
                                                    <span className="bg-orange-200 dark:bg-orange-800/50 text-orange-800 dark:text-orange-200 px-2 py-0.5 rounded">{totalBoxes}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Factory Summary */}
                        {factorySummary.length > 0 && (
                            <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                                    <Warehouse size={20} className="text-primary" />
                                    Factory-wise Summary
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {factorySummary.map((factory, idx) => (
                                        <div key={`factory-${idx}-${factory.factoryKey}`} className="bg-foreground dark:bg-dark-foreground rounded-lg p-4 border border-border dark:border-dark-border">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Warehouse size={18} className="text-primary" />
                                                <h4 className="font-semibold text-text dark:text-dark-text">{factory.factoryName}</h4>
                                            </div>
                                            <div className="grid grid-cols-4 gap-2 text-sm">
                                                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
                                                    <p className="text-blue-600 dark:text-blue-400 font-bold">{factory.containerCount}</p>
                                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Containers</p>
                                                </div>
                                                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                                    <p className="text-green-600 dark:text-green-400 font-bold">{factory.palletCount}</p>
                                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pallets</p>
                                                </div>
                                                <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
                                                    <p className="text-purple-600 dark:text-purple-400 font-bold">{factory.khatliCount}</p>
                                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Khatlis</p>
                                                </div>
                                                <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                                                    <p className="text-orange-600 dark:text-orange-400 font-bold">{factory.totalBoxes.toLocaleString()}</p>
                                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Boxes</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Containers List */}
                        <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
                            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                                <Package size={20} className="text-primary" />
                                Containers ({totalContainers})
                            </h3>
                            <div className="space-y-3">
                                {(dispatch.containers || []).map((container, index) => {
                                    const containerKey = String(container?.containerId || `container-${index}`);
                                    const isExpanded = expandedContainers[containerKey];
                                    const containerPallets = (container?.items || []).filter((i) => i?.itemType === 'Pallet').length;
                                    const containerKhatlis = (container?.items || []).filter((i) => i?.itemType === 'Khatli').length;
                                    const containerBoxes = container?.totalBoxes || (container?.items || []).reduce((sum, i) => sum + ((Number(i?.boxCount) || 0) * (Number(i?.quantity) || 1)), 0);
                                    
                                    const itemsByTile = {};
                                    (container?.items || []).forEach((item, itemIdx) => { 
                                        if (!item) return;
                                        const key = `${item.tileName || 'Unknown'}-${item.itemType || 'Unknown'}-${item.boxCount || 0}-${itemIdx}`; 
                                        if (!itemsByTile[key]) {
                                            itemsByTile[key] = { tileName: item.tileName || 'Unknown', itemType: item.itemType || 'Unknown', boxCount: Number(item.boxCount) || 0, count: 0 }; 
                                        }
                                        itemsByTile[key].count += Number(item.quantity) || 1; 
                                    });
                                    
                                    return (
                                        <div key={containerKey} className="border border-border dark:border-dark-border rounded-lg overflow-hidden">
                                            <div 
                                                className="flex items-center justify-between p-4 bg-foreground dark:bg-dark-foreground cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" 
                                                onClick={() => toggleContainer(containerKey)}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                        <Package size={20} className="text-blue-600 dark:text-blue-400" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-text dark:text-dark-text">{container?.containerNumber || 'N/A'}</h4>
                                                        <div className="flex items-center gap-3 text-sm text-text-secondary dark:text-dark-text-secondary">
                                                            <span className="flex items-center gap-1"><Truck size={14} />{container?.truckNumber || 'N/A'}</span>
                                                            <span className="flex items-center gap-1"><Warehouse size={14} />{container?.factoryName || 'Unknown'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex gap-3 text-sm">
                                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">{containerPallets}P</span>
                                                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">{containerKhatlis}K</span>
                                                        <span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded font-medium">{containerBoxes} boxes</span>
                                                    </div>
                                                    {isExpanded ? <ChevronUp size={20} className="text-text-secondary" /> : <ChevronDown size={20} className="text-text-secondary" />}
                                                </div>
                                            </div>
                                            {isExpanded && (
                                                <div className="p-4 border-t border-border dark:border-dark-border bg-gray-50 dark:bg-gray-900/30">
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {Object.entries(itemsByTile).map(([itemKey, item]) => (
                                                            <div 
                                                                key={itemKey}
                                                                className={`p-3 rounded-lg border ${item.itemType === 'Pallet' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'}`}
                                                            >
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <p className="font-semibold text-text dark:text-dark-text text-sm">{item.tileName}</p>
                                                                    <span className={`px-2 py-0.5 text-xs font-bold rounded ${item.itemType === 'Pallet' ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' : 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200'}`}>
                                                                        {item.itemType}
                                                                    </span>
                                                                </div>
                                                                <div className="flex justify-between text-sm">
                                                                    <span className="text-text-secondary dark:text-dark-text-secondary">{item.boxCount} boxes × {item.count}</span>
                                                                    <span className="font-bold text-text dark:text-dark-text">= {item.boxCount * item.count} boxes</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Status History */}
                        {dispatch.statusHistory && dispatch.statusHistory.length > 0 && (
                            <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
                                <button onClick={() => setShowStatusHistory(!showStatusHistory)} className="w-full flex items-center justify-between text-lg font-semibold text-text dark:text-dark-text">
                                    <span className="flex items-center gap-2"><History size={20} className="text-primary" />Status History ({dispatch.statusHistory.length})</span>
                                    {showStatusHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {showStatusHistory && (
                                    <div className="mt-4 space-y-3">
                                        {[...dispatch.statusHistory].reverse().map((history, index) => (
                                            <div key={`history-${index}-${history.status}`} className="flex items-start gap-3 p-3 bg-foreground dark:bg-dark-foreground rounded-lg">
                                                <div className={`p-2 rounded-full ${statusConfig[history.status]?.color || 'bg-gray-100 dark:bg-gray-800'}`}>
                                                    {React.createElement(statusConfig[history.status]?.icon || Clock, { size: 16 })}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between">
                                                        <p className="font-semibold text-text dark:text-dark-text">{history.status}</p>
                                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{formatDateTime(history.changedAt)}</p>
                                                    </div>
                                                    {history.changedBy && <p className="text-sm text-text-secondary dark:text-dark-text-secondary">by {history.changedBy?.username || 'Unknown'}</p>}
                                                    {history.notes && <p className="text-sm text-text dark:text-dark-text mt-1 italic">"{history.notes}"</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer with action buttons */}
                    <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex flex-wrap justify-between items-center gap-3">
                        <div className="flex gap-2">
                            {currentStatus === 'Pending' && (
                                <button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                                    <Trash2 size={16} />Delete
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border transition-colors">Close</button>
                            {nextStatuses.map((status) => (
                                <button 
                                    key={`btn-${status}`}
                                    onClick={() => openStatusModal(status)}
                                    className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${
                                        status === 'Cancelled' ? 'bg-red-600 hover:bg-red-700 text-white' : 
                                        status === 'Pending' ? 'bg-yellow-500 hover:bg-yellow-600 text-white' :
                                        'bg-primary hover:bg-primary-hover text-white'
                                    }`}
                                >
                                    {status === 'In Transit' && <Send size={16} />}
                                    {(status === 'Delivered' || status === 'Ready' || status === 'Completed') && <CheckCircle2 size={16} />}
                                    {status === 'Cancelled' && <XCircle size={16} />}
                                    {status === 'Pending' && <RotateCcw size={16} />}
                                    Mark as {status}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Status Update Confirmation Modal */}
            {showStatusModal && pendingStatus && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-md p-6">
                        <h3 className="text-xl font-bold text-text dark:text-dark-text mb-4">
                            Update Status to "{pendingStatus}"
                        </h3>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">Notes (Optional)</label>
                            <textarea 
                                value={statusNotes} 
                                onChange={(e) => setStatusNotes(e.target.value)} 
                                className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent" 
                                rows={3} 
                                placeholder="Add any notes..." 
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={closeStatusModal} className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border">Cancel</button>
                            <button 
                                onClick={handleStatusUpdate} 
                                disabled={isUpdatingStatus} 
                                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2"
                            >
                                {isUpdatingStatus && <Loader2 size={16} className="animate-spin" />}
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4">
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full"><AlertCircle size={24} className="text-red-600 dark:text-red-400" /></div>
                            <h3 className="text-xl font-bold text-text dark:text-dark-text">Delete Dispatch?</h3>
                        </div>
                        <p className="text-text-secondary dark:text-dark-text-secondary mb-4">This will delete dispatch <strong>{dispatch.dispatchNumber}</strong> and revert all container statuses.</p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">Reason for deletion</label>
                            <textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:ring-2 focus:ring-red-500 focus:border-transparent" rows={2} placeholder="Enter reason..." />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => { setShowDeleteConfirm(false); setDeleteReason(''); }} className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border">Cancel</button>
                            <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                                {isDeleting && <Loader2 size={16} className="animate-spin" />}Delete Dispatch
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default DispatchDetailModal;