
// import React, { useState, useEffect, useMemo } from 'react';
// import { getPurchaseOrderById, updatePOStatus, generatePalletsForPO } from '../../api/purchaseOrderApi';
// import { 
//     Loader2, X, Factory, Calendar, PlayCircle, CheckSquare, 
//     PackageCheck, ClipboardCheck, Settings, ChevronDown, ChevronUp, 
//     Box, Package, Boxes, AlertCircle
// } from 'lucide-react';
// import { format } from 'date-fns';
// import RecordQCModal from './RecordQCModal';
// import { generatePDFReport, generateExcelReport } from '../../utils/reportGenerator';
// import ReportExportButtons from '../common/ReportExportButtons';

// const ManagePOModal = ({ poId, onClose }) => {
//     const [po, setPo] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [isUpdating, setIsUpdating] = useState(false);
//     const [isQcModalOpen, setIsQcModalOpen] = useState(false);
//     const [selectedItemForQc, setSelectedItemForQc] = useState(null);
//     const [showManualStatus, setShowManualStatus] = useState(false);

//     const allItemsQCPassed = useMemo(() => {
//         if (!po || !po.items) return false;
//         return po.items.every(item => item.quantityPassedQC >= item.totalBoxesOrdered);
//     }, [po]);

//     const totals = useMemo(() => {
//         if (!po?.items) return { pallets: 0, khatlis: 0, boxes: 0, qcPassed: 0 };
//         return po.items.reduce((acc, item) => ({
//             pallets: acc.pallets + (item.palletsOrdered || 0),
//             khatlis: acc.khatlis + (item.khatlisOrdered || 0),
//             boxes: acc.boxes + (item.totalBoxesOrdered || 0),
//             qcPassed: acc.qcPassed + (item.quantityPassedQC || 0),
//         }), { pallets: 0, khatlis: 0, boxes: 0, qcPassed: 0 });
//     }, [po]);

//     const fetchPO = async () => {
//         if (!poId) return;
//         setLoading(true);
//         setError('');
//         try {
//             const { data } = await getPurchaseOrderById(poId);
//             setPo(data);
//         } catch (err) {
//             setError('Failed to load Purchase Order details.');
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => { fetchPO(); }, [poId]);

//     const handleUpdateStatus = async (newStatus) => {
//         if (!window.confirm(`Change status to "${newStatus}"?`)) return;
//         setIsUpdating(true);
//         try {
//             const { data } = await updatePOStatus(poId, newStatus);
//             setPo(data); 
//         } catch (err) {
//             alert(err.response?.data?.message || 'Failed to update status.');
//         } finally {
//             setIsUpdating(false);
//         }
//     };

//     const handleGeneratePallets = async (itemId = null) => {
//         if (!window.confirm(itemId ? 'Generate pallets for this item?' : 'Generate ALL pallets?')) return;
//         setIsUpdating(true);
//         try {
//             const { data } = await generatePalletsForPO(poId, itemId ? { itemId } : {});
//             setPo(data);
//         } catch (err) {
//             alert(err.response?.data?.message || 'Failed to generate pallets.');
//         } finally {
//             setIsUpdating(false);
//         }
//     };

//     const handleOpenQcModal = (item) => { setSelectedItemForQc(item); setIsQcModalOpen(true); };
//     const handleSaveQc = (updatedPO) => { setPo(updatedPO); };

//     // EXPORT PDF
//     const handleExportPDF = async () => {
//         if (!po) return;
//         await generatePDFReport({
//             title: `Purchase Order - ${po.poId}`,
//             subtitle: `Factory: ${po.factory?.name || 'N/A'} | Status: ${po.status}`,
//             headerInfo: [
//                 { label: 'PO Number', value: po.poId },
//                 { label: 'Factory', value: po.factory?.name || 'N/A' },
//                 { label: 'Status', value: po.status },
//                 { label: 'Created', value: format(new Date(po.createdAt), 'dd MMM, yyyy') },
//                 { label: 'Source', value: po.sourceRestockRequest?.requestId || 'Manual' },
//                 { label: 'Created By', value: po.createdBy?.username || 'N/A' },
//             ],
//             summaryData: [
//                 { label: 'Pallets', value: totals.pallets, color: 'blue' },
//                 { label: 'Khatlis', value: totals.khatlis, color: 'purple' },
//                 { label: 'Total Boxes', value: totals.boxes, color: 'green' },
//                 { label: 'QC Passed', value: totals.qcPassed, color: 'orange' },
//             ],
//             tableColumns: [
//                 { key: 'sNo', header: 'S.No', width: 15 },
//                 { key: 'tileName', header: 'Tile Name', width: 50 },
//                 { key: 'tileNumber', header: 'Tile No.', width: 30 },
//                 { key: 'palletsOrdered', header: 'Pallets', width: 25 },
//                 { key: 'khatlisOrdered', header: 'Khatlis', width: 25 },
//                 { key: 'totalBoxesOrdered', header: 'Boxes', width: 30 },
//                 { key: 'quantityPassedQC', header: 'QC Passed', width: 30 },
//                 { key: 'qcProgress', header: 'Progress', width: 25 },
//             ],
//             tableData: po.items.map((item, idx) => ({
//                 sNo: idx + 1,
//                 tileName: item.tile?.name || 'Unknown',
//                 tileNumber: item.tile?.tileNumber || '-',
//                 palletsOrdered: item.palletsOrdered || 0,
//                 khatlisOrdered: item.khatlisOrdered || 0,
//                 totalBoxesOrdered: item.totalBoxesOrdered || 0,
//                 quantityPassedQC: item.quantityPassedQC || 0,
//                 qcProgress: `${item.totalBoxesOrdered > 0 ? ((item.quantityPassedQC / item.totalBoxesOrdered) * 100).toFixed(0) : 0}%`,
//             })),
//             fileName: `PO_${po.poId}`,
//             orientation: 'landscape',
//         });
//     };

//     // EXPORT EXCEL
//     const handleExportExcel = async () => {
//         if (!po) return;
//         await generateExcelReport({
//             title: `Purchase Order - ${po.poId}`,
//             headerInfo: [
//                 { label: 'PO Number', value: po.poId },
//                 { label: 'Factory', value: po.factory?.name || 'N/A' },
//                 { label: 'Status', value: po.status },
//             ],
//             summaryData: [
//                 { label: 'Pallets', value: totals.pallets },
//                 { label: 'Khatlis', value: totals.khatlis },
//                 { label: 'Total Boxes', value: totals.boxes },
//                 { label: 'QC Passed', value: totals.qcPassed },
//             ],
//             tableColumns: [
//                 { key: 'sNo', header: 'S.No' },
//                 { key: 'tileName', header: 'Tile Name' },
//                 { key: 'tileNumber', header: 'Tile No.' },
//                 { key: 'palletsOrdered', header: 'Pallets' },
//                 { key: 'khatlisOrdered', header: 'Khatlis' },
//                 { key: 'totalBoxesOrdered', header: 'Boxes' },
//                 { key: 'quantityPassedQC', header: 'QC Passed' },
//             ],
//             tableData: po.items.map((item, idx) => ({
//                 sNo: idx + 1,
//                 tileName: item.tile?.name || 'Unknown',
//                 tileNumber: item.tile?.tileNumber || '-',
//                 palletsOrdered: item.palletsOrdered || 0,
//                 khatlisOrdered: item.khatlisOrdered || 0,
//                 totalBoxesOrdered: item.totalBoxesOrdered || 0,
//                 quantityPassedQC: item.quantityPassedQC || 0,
//             })),
//             fileName: `PO_${po.poId}`,
//             sheetName: 'PO Details',
//         });
//     };

//     const getStatusColor = (status) => ({
//         'Draft': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
//         'SentToFactory': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
//         'Manufacturing': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
//         'QC_InProgress': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
//         'QC_Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
//         'Packing': 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
//         'Completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
//         'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
//     }[status] || 'bg-gray-100 text-gray-800');

//     const getNextAction = () => po && ({
//         'Draft': { label: 'Send to Factory', status: 'SentToFactory', color: 'bg-cyan-500 hover:bg-cyan-600' },
//         'SentToFactory': { label: 'Start Manufacturing', status: 'Manufacturing', color: 'bg-indigo-500 hover:bg-indigo-600' },
//         'Manufacturing': { label: 'Start QC', status: 'QC_InProgress', color: 'bg-amber-500 hover:bg-amber-600' },
//         'QC_InProgress': { label: 'Complete QC', status: 'QC_Completed', color: 'bg-blue-500 hover:bg-blue-600' },
//         'QC_Completed': { label: 'Start Packing', status: 'Packing', color: 'bg-pink-500 hover:bg-pink-600' },
//         'Packing': { label: 'Mark Completed', status: 'Completed', color: 'bg-emerald-500 hover:bg-emerald-600' },
//     }[po.status]);

//     if (!poId) return null;

//     return (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
//             {isQcModalOpen && selectedItemForQc && (
//                 <RecordQCModal poId={po._id} item={selectedItemForQc} onClose={() => setIsQcModalOpen(false)} onSave={handleSaveQc} />
//             )}

//             <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
//                 {/* Header */}
//                 <div className="flex justify-between items-start p-5 border-b border-border dark:border-dark-border">
//                     <div>
//                         <div className="flex items-center gap-3 mb-1">
//                             <h1 className="text-2xl font-bold text-text dark:text-dark-text">Purchase Order</h1>
//                             {po && <span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(po.status)}`}>{po.status?.replace(/_/g, ' ')}</span>}
//                         </div>
//                         <p className="font-mono text-primary text-lg">{po?.poId || 'Loading...'}</p>
//                     </div>
//                     <div className="flex items-center gap-2">
//                         {po && <ReportExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} variant="icons" />}
//                         <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background"><X size={24} className="text-text-secondary" /></button>
//                     </div>
//                 </div>

//                 {/* Content */}
//                 <div className="flex-grow overflow-y-auto p-6">
//                     {loading && <div className="flex justify-center items-center h-64"><Loader2 size={32} className="animate-spin text-primary" /></div>}
//                     {error && <div className="flex items-center gap-2 p-4 bg-red-100 text-red-700 rounded-lg"><AlertCircle size={20} />{error}</div>}
                    
//                     {po && (
//                         <div className="space-y-6">
//                             {/* Info Cards */}
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                                 <div className="p-4 bg-background dark:bg-dark-background rounded-xl">
//                                     <div className="text-sm text-text-secondary flex items-center gap-2"><Factory size={14}/> Factory</div>
//                                     <div className="text-lg font-bold text-text dark:text-dark-text mt-1">{po.factory?.name || 'N/A'}</div>
//                                 </div>
//                                 <div className="p-4 bg-background dark:bg-dark-background rounded-xl">
//                                     <div className="text-sm text-text-secondary flex items-center gap-2"><Calendar size={14}/> Created</div>
//                                     <div className="text-lg font-bold text-text dark:text-dark-text mt-1">{format(new Date(po.createdAt), 'dd MMM, yyyy')}</div>
//                                 </div>
//                                 <div className="p-4 bg-background dark:bg-dark-background rounded-xl">
//                                     <div className="text-sm text-text-secondary">Source</div>
//                                     <div className="text-lg font-bold text-text dark:text-dark-text mt-1">{po.sourceRestockRequest?.requestId || 'Manual'}</div>
//                                 </div>
//                                 <div className="p-4 bg-background dark:bg-dark-background rounded-xl">
//                                     <div className="text-sm text-text-secondary">Created By</div>
//                                     <div className="text-lg font-bold text-text dark:text-dark-text mt-1">{po.createdBy?.username || 'N/A'}</div>
//                                 </div>
//                             </div>

//                             {/* Summary Stats */}
//                             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
//                                 <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
//                                     <div className="flex items-center gap-2 text-blue-600 text-sm"><Box size={16} /> Pallets</div>
//                                     <p className="text-2xl font-bold text-blue-700 mt-1">{totals.pallets}</p>
//                                 </div>
//                                 <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
//                                     <div className="flex items-center gap-2 text-purple-600 text-sm"><Package size={16} /> Khatlis</div>
//                                     <p className="text-2xl font-bold text-purple-700 mt-1">{totals.khatlis}</p>
//                                 </div>
//                                 <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
//                                     <div className="flex items-center gap-2 text-green-600 text-sm"><Boxes size={16} /> Total Boxes</div>
//                                     <p className="text-2xl font-bold text-green-700 mt-1">{totals.boxes.toLocaleString()}</p>
//                                 </div>
//                                 <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
//                                     <div className="flex items-center gap-2 text-amber-600 text-sm"><ClipboardCheck size={16} /> QC Passed</div>
//                                     <p className="text-2xl font-bold text-amber-700 mt-1">{totals.qcPassed.toLocaleString()}</p>
//                                     <p className="text-xs text-amber-600">{totals.boxes > 0 ? ((totals.qcPassed / totals.boxes) * 100).toFixed(1) : 0}%</p>
//                                 </div>
//                             </div>

//                             {/* Actions */}
//                             <div className="flex flex-wrap gap-3 p-4 bg-gradient-to-r from-primary/5 to-indigo-500/5 rounded-xl border border-primary/20">
//                                 {getNextAction() && (
//                                     <button onClick={() => handleUpdateStatus(getNextAction().status)} disabled={isUpdating}
//                                         className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-semibold disabled:opacity-50 ${getNextAction().color}`}>
//                                         {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
//                                         {getNextAction().label}
//                                     </button>
//                                 )}
//                                 {['QC_Completed', 'Packing'].includes(po.status) && allItemsQCPassed && (
//                                     <button onClick={() => handleGeneratePallets()} disabled={isUpdating}
//                                         className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold disabled:opacity-50">
//                                         <PackageCheck size={18} /> Generate All Pallets
//                                     </button>
//                                 )}
//                                 {!['Completed', 'Cancelled'].includes(po.status) && (
//                                     <button onClick={() => handleUpdateStatus('Cancelled')} disabled={isUpdating}
//                                         className="flex items-center gap-2 px-4 py-2.5 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200">
//                                         Cancel PO
//                                     </button>
//                                 )}
//                                 <button onClick={() => setShowManualStatus(!showManualStatus)}
//                                     className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-text-secondary rounded-lg ml-auto">
//                                     <Settings size={16} /> Manual Status {showManualStatus ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                                 </button>
//                             </div>

//                             {showManualStatus && (
//                                 <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border">
//                                     <p className="text-sm text-text-secondary mb-3">Change status:</p>
//                                     <div className="flex flex-wrap gap-2">
//                                         {['Draft', 'SentToFactory', 'Manufacturing', 'QC_InProgress', 'QC_Completed', 'Packing', 'Completed', 'Cancelled'].map(status => (
//                                             <button key={status} onClick={() => handleUpdateStatus(status)} disabled={isUpdating || status === po.status}
//                                                 className={`px-3 py-1.5 text-sm rounded-lg font-medium disabled:opacity-40 ${getStatusColor(status)}`}>
//                                                 {status.replace(/_/g, ' ')}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Items */}
//                             <div>
//                                 <h3 className="text-lg font-semibold mb-3 text-text dark:text-dark-text">Order Items</h3>
//                                 <div className="space-y-3">
//                                     {po.items.map((item) => {
//                                         const qcProgress = item.totalBoxesOrdered > 0 ? (item.quantityPassedQC / item.totalBoxesOrdered) * 100 : 0;
//                                         const canGen = ['QC_InProgress', 'QC_Completed', 'Packing'].includes(po.status) && item.quantityPassedQC > (item.boxesConverted || 0);
//                                         return (
//                                             <div key={item._id} className="p-4 border border-border dark:border-dark-border rounded-xl">
//                                                 <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
//                                                     <div className="flex-1">
//                                                         <p className="font-bold text-lg text-text dark:text-dark-text">{item.tile?.name || 'Unknown'}</p>
//                                                         <p className="text-sm text-text-secondary">{item.tile?.tileNumber} • {item.tile?.size}</p>
//                                                         <div className="flex flex-wrap gap-4 mt-2 text-sm">
//                                                             <span className="text-blue-600">{item.palletsOrdered} pallets</span>
//                                                             <span className="text-purple-600">{item.khatlisOrdered} khatlis</span>
//                                                             <span className="text-green-600">{item.totalBoxesOrdered} boxes</span>
//                                                         </div>
//                                                     </div>
//                                                     <div className="flex items-center gap-2">
//                                                         <button onClick={() => handleOpenQcModal(item)} disabled={!['Manufacturing', 'QC_InProgress'].includes(po.status)}
//                                                             className="flex items-center gap-2 text-sm font-semibold bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/20 disabled:opacity-50">
//                                                             <CheckSquare size={16} /> Record QC
//                                                         </button>
//                                                         {canGen && (
//                                                             <button onClick={() => handleGeneratePallets(item._id)} disabled={isUpdating}
//                                                                 className="flex items-center gap-2 text-sm font-semibold bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50">
//                                                                 <PackageCheck size={16} /> Generate
//                                                             </button>
//                                                         )}
//                                                     </div>
//                                                 </div>
//                                                 <div className="mt-3">
//                                                     <div className="flex justify-between text-sm mb-1">
//                                                         <span className="text-text-secondary">QC Progress</span>
//                                                         <span className="font-medium text-text dark:text-dark-text">{item.quantityPassedQC || 0} / {item.totalBoxesOrdered} ({qcProgress.toFixed(0)}%)</span>
//                                                     </div>
//                                                     <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
//                                                         <div className={`h-full rounded-full ${qcProgress >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(qcProgress, 100)}%` }} />
//                                                     </div>
//                                                 </div>
//                                                 {(item.palletsGenerated > 0 || item.khatlisGenerated > 0) && (
//                                                     <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
//                                                         <PackageCheck size={14} /> Generated: {item.palletsGenerated || 0} pallets, {item.khatlisGenerated || 0} khatlis
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>

//                             {po.packingRules && (
//                                 <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
//                                     <h4 className="font-semibold text-text dark:text-dark-text mb-2">Packing Rules</h4>
//                                     <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
//                                         <span>Boxes/Pallet: <strong className="text-text">{po.packingRules.boxesPerPallet || 'N/A'}</strong></span>
//                                         <span>Boxes/Khatli: <strong className="text-text">{po.packingRules.boxesPerKhatli || 'N/A'}</strong></span>
//                                     </div>
//                                 </div>
//                             )}

//                             {po.generatedPallets?.length > 0 && (
//                                 <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
//                                     <div className="flex items-center gap-2 text-emerald-700">
//                                         <PackageCheck size={20} />
//                                         <span className="font-semibold">{po.generatedPallets.length} pallets/khatlis generated</span>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ManagePOModal;

// FILE: frontend/src/components/purchase-orders/ManagePOModal.js
// Updated with PDF/Excel export functionality

import React, { useState, useEffect, useMemo } from 'react';
import { getPurchaseOrderById, updatePOStatus, generatePalletsForPO } from '../../api/purchaseOrderApi';
import { 
    Loader2, X, Factory, Calendar, PlayCircle, CheckSquare, 
    PackageCheck, ClipboardCheck, Settings, ChevronDown, ChevronUp, 
    Box, Package, Boxes, AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import RecordQCModal from './RecordQCModal';
import { generatePDFReport, generateExcelReport } from '../../utils/reportGenerator';
import ReportExportButtons from '../common/ReportExportButtons';

const ManagePOModal = ({ poId, onClose }) => {
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isQcModalOpen, setIsQcModalOpen] = useState(false);
    const [selectedItemForQc, setSelectedItemForQc] = useState(null);
    const [showManualStatus, setShowManualStatus] = useState(false);

    const allItemsQCPassed = useMemo(() => {
        if (!po || !po.items) return false;
        return po.items.every(item => item.quantityPassedQC >= item.totalBoxesOrdered);
    }, [po]);

    const totals = useMemo(() => {
        if (!po?.items) return { pallets: 0, khatlis: 0, boxes: 0, qcPassed: 0 };
        return po.items.reduce((acc, item) => ({
            pallets: acc.pallets + (item.palletsOrdered || 0),
            khatlis: acc.khatlis + (item.khatlisOrdered || 0),
            boxes: acc.boxes + (item.totalBoxesOrdered || 0),
            qcPassed: acc.qcPassed + (item.quantityPassedQC || 0),
        }), { pallets: 0, khatlis: 0, boxes: 0, qcPassed: 0 });
    }, [po]);

    const fetchPO = async () => {
        if (!poId) return;
        setLoading(true);
        setError('');
        try {
            const { data } = await getPurchaseOrderById(poId);
            setPo(data);
        } catch (err) {
            setError('Failed to load Purchase Order details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPO(); }, [poId]);

    const handleUpdateStatus = async (newStatus) => {
        if (!window.confirm(`Change status to "${newStatus}"?`)) return;
        setIsUpdating(true);
        try {
            const { data } = await updatePOStatus(poId, newStatus);
            setPo(data); 
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleGeneratePallets = async (itemId = null) => {
        if (!window.confirm(itemId ? 'Generate pallets for this item?' : 'Generate ALL pallets?')) return;
        setIsUpdating(true);
        try {
            const { data } = await generatePalletsForPO(poId, itemId ? { itemId } : {});
            setPo(data);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to generate pallets.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpenQcModal = (item) => { setSelectedItemForQc(item); setIsQcModalOpen(true); };
    const handleSaveQc = (updatedPO) => { setPo(updatedPO); };

    // EXPORT PDF
    const handleExportPDF = async () => {
        if (!po) return;
        
        // Get packing rules
        const boxesPerPallet = po.packingRules?.boxesPerPallet || 0;
        const boxesPerKhatli = po.packingRules?.boxesPerKhatli || 0;
        const palletsPerContainer = po.packingRules?.palletsPerContainer || 0;
        
        await generatePDFReport({
            title: `Purchase Order - ${po.poId}`,
            subtitle: `Factory: ${po.factory?.name || 'N/A'} | Status: ${po.status}`,
            headerInfo: [
                { label: 'PO Number', value: po.poId },
                { label: 'Factory', value: po.factory?.name || 'N/A' },
                { label: 'Status', value: po.status },
                { label: 'Created', value: format(new Date(po.createdAt), 'dd MMM, yyyy') },
                { label: 'Source', value: po.sourceRestockRequest?.requestId || 'Manual' },
                { label: 'Created By', value: po.createdBy?.username || 'N/A' },
                { label: 'Boxes/Pallet', value: boxesPerPallet },
                { label: 'Boxes/Khatli', value: boxesPerKhatli },
                { label: 'Pallets/Container', value: palletsPerContainer },
            ],
            summaryData: [
                { label: 'Pallets', value: totals.pallets, color: 'blue' },
                { label: 'Khatlis', value: totals.khatlis, color: 'purple' },
                { label: 'Total Boxes', value: totals.boxes, color: 'green' },
                { label: 'QC Passed', value: totals.qcPassed, color: totals.qcPassed >= totals.boxes ? 'green' : 'orange' },
            ],
            tableColumns: [
                { key: 'sNo', header: 'S.No', width: 15 },
                { key: 'tileName', header: 'Tile Name', width: 50 },
                { key: 'tileNumber', header: 'Tile No.', width: 30 },
                { key: 'size', header: 'Size', width: 30 },
                { key: 'palletsOrdered', header: 'Pallets', width: 25 },
                { key: 'khatlisOrdered', header: 'Khatlis', width: 25 },
                { key: 'totalBoxesOrdered', header: 'Boxes', width: 30 },
                { key: 'quantityPassedQC', header: 'QC Passed', width: 30 },
                { key: 'qcProgress', header: 'Progress', width: 25 },
            ],
            tableData: po.items.map((item, idx) => ({
                sNo: idx + 1,
                tileName: item.tile?.name || 'Unknown',
                tileNumber: item.tile?.tileNumber || '-',
                size: item.tile?.size || '-',
                palletsOrdered: item.palletsOrdered || 0,
                khatlisOrdered: item.khatlisOrdered || 0,
                totalBoxesOrdered: item.totalBoxesOrdered || 0,
                quantityPassedQC: item.quantityPassedQC || 0,
                qcProgress: `${item.totalBoxesOrdered > 0 ? ((item.quantityPassedQC / item.totalBoxesOrdered) * 100).toFixed(0) : 0}%`,
            })),
            fileName: `PO_${po.poId}`,
            orientation: 'landscape',
        });
    };

    // EXPORT EXCEL
    const handleExportExcel = async () => {
        if (!po) return;
        
        // Get packing rules
        const boxesPerPallet = po.packingRules?.boxesPerPallet || 0;
        const boxesPerKhatli = po.packingRules?.boxesPerKhatli || 0;
        const palletsPerContainer = po.packingRules?.palletsPerContainer || 0;
        
        await generateExcelReport({
            title: `Purchase Order - ${po.poId}`,
            headerInfo: [
                { label: 'PO Number', value: po.poId },
                { label: 'Factory', value: po.factory?.name || 'N/A' },
                { label: 'Status', value: po.status },
                { label: 'Source', value: po.sourceRestockRequest?.requestId || 'Manual' },
                { label: 'Created', value: format(new Date(po.createdAt), 'dd MMM, yyyy') },
                { label: 'Created By', value: po.createdBy?.username || 'N/A' },
                { label: 'Boxes/Pallet', value: boxesPerPallet },
                { label: 'Boxes/Khatli', value: boxesPerKhatli },
                { label: 'Pallets/Container', value: palletsPerContainer },
            ],
            summaryData: [
                { label: 'Pallets', value: totals.pallets },
                { label: 'Khatlis', value: totals.khatlis },
                { label: 'Total Boxes', value: totals.boxes },
                { label: 'QC Passed', value: totals.qcPassed },
            ],
            tableColumns: [
                { key: 'sNo', header: 'S.No' },
                { key: 'tileName', header: 'Tile Name' },
                { key: 'tileNumber', header: 'Tile No.' },
                { key: 'size', header: 'Size' },
                { key: 'palletsOrdered', header: 'Pallets' },
                { key: 'khatlisOrdered', header: 'Khatlis' },
                { key: 'totalBoxesOrdered', header: 'Boxes' },
                { key: 'quantityPassedQC', header: 'QC Passed' },
                { key: 'qcProgress', header: 'Progress' },
            ],
            tableData: po.items.map((item, idx) => ({
                sNo: idx + 1,
                tileName: item.tile?.name || 'Unknown',
                tileNumber: item.tile?.tileNumber || '-',
                size: item.tile?.size || '-',
                palletsOrdered: item.palletsOrdered || 0,
                khatlisOrdered: item.khatlisOrdered || 0,
                totalBoxesOrdered: item.totalBoxesOrdered || 0,
                quantityPassedQC: item.quantityPassedQC || 0,
                qcProgress: `${item.totalBoxesOrdered > 0 ? ((item.quantityPassedQC / item.totalBoxesOrdered) * 100).toFixed(0) : 0}%`,
            })),
            fileName: `PO_${po.poId}`,
            sheetName: 'PO Details',
        });
    };

    const getStatusColor = (status) => ({
        'Draft': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
        'SentToFactory': 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300',
        'Manufacturing': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300',
        'QC_InProgress': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
        'QC_Completed': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
        'Packing': 'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-300',
        'Completed': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
        'Cancelled': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    }[status] || 'bg-gray-100 text-gray-800');

    const getNextAction = () => po && ({
        'Draft': { label: 'Send to Factory', status: 'SentToFactory', color: 'bg-cyan-500 hover:bg-cyan-600' },
        'SentToFactory': { label: 'Start Manufacturing', status: 'Manufacturing', color: 'bg-indigo-500 hover:bg-indigo-600' },
        'Manufacturing': { label: 'Start QC', status: 'QC_InProgress', color: 'bg-amber-500 hover:bg-amber-600' },
        'QC_InProgress': { label: 'Complete QC', status: 'QC_Completed', color: 'bg-blue-500 hover:bg-blue-600' },
        'QC_Completed': { label: 'Start Packing', status: 'Packing', color: 'bg-pink-500 hover:bg-pink-600' },
        'Packing': { label: 'Mark Completed', status: 'Completed', color: 'bg-emerald-500 hover:bg-emerald-600' },
    }[po.status]);

    if (!poId) return null;

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            {isQcModalOpen && selectedItemForQc && (
                <RecordQCModal poId={po._id} item={selectedItemForQc} onClose={() => setIsQcModalOpen(false)} onSave={handleSaveQc} />
            )}

            <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-start p-5 border-b border-border dark:border-dark-border">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl font-bold text-text dark:text-dark-text">Purchase Order</h1>
                            {po && <span className={`px-3 py-1 text-sm font-bold rounded-full ${getStatusColor(po.status)}`}>{po.status?.replace(/_/g, ' ')}</span>}
                        </div>
                        <p className="font-mono text-primary text-lg">{po?.poId || 'Loading...'}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {po && <ReportExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} variant="icons" />}
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background"><X size={24} className="text-text-secondary" /></button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6">
                    {loading && <div className="flex justify-center items-center h-64"><Loader2 size={32} className="animate-spin text-primary" /></div>}
                    {error && <div className="flex items-center gap-2 p-4 bg-red-100 text-red-700 rounded-lg"><AlertCircle size={20} />{error}</div>}
                    
                    {po && (
                        <div className="space-y-6">
                            {/* Info Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-background dark:bg-dark-background rounded-xl">
                                    <div className="text-sm text-text-secondary flex items-center gap-2"><Factory size={14}/> Factory</div>
                                    <div className="text-lg font-bold text-text dark:text-dark-text mt-1">{po.factory?.name || 'N/A'}</div>
                                </div>
                                <div className="p-4 bg-background dark:bg-dark-background rounded-xl">
                                    <div className="text-sm text-text-secondary flex items-center gap-2"><Calendar size={14}/> Created</div>
                                    <div className="text-lg font-bold text-text dark:text-dark-text mt-1">{format(new Date(po.createdAt), 'dd MMM, yyyy')}</div>
                                </div>
                                <div className="p-4 bg-background dark:bg-dark-background rounded-xl">
                                    <div className="text-sm text-text-secondary">Source</div>
                                    <div className="text-lg font-bold text-text dark:text-dark-text mt-1">{po.sourceRestockRequest?.requestId || 'Manual'}</div>
                                </div>
                                <div className="p-4 bg-background dark:bg-dark-background rounded-xl">
                                    <div className="text-sm text-text-secondary">Created By</div>
                                    <div className="text-lg font-bold text-text dark:text-dark-text mt-1">{po.createdBy?.username || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Summary Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                                    <div className="flex items-center gap-2 text-blue-600 text-sm"><Box size={16} /> Pallets</div>
                                    <p className="text-2xl font-bold text-blue-700 mt-1">{totals.pallets}</p>
                                </div>
                                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800">
                                    <div className="flex items-center gap-2 text-purple-600 text-sm"><Package size={16} /> Khatlis</div>
                                    <p className="text-2xl font-bold text-purple-700 mt-1">{totals.khatlis}</p>
                                </div>
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                    <div className="flex items-center gap-2 text-green-600 text-sm"><Boxes size={16} /> Total Boxes</div>
                                    <p className="text-2xl font-bold text-green-700 mt-1">{totals.boxes.toLocaleString()}</p>
                                </div>
                                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                                    <div className="flex items-center gap-2 text-amber-600 text-sm"><ClipboardCheck size={16} /> QC Passed</div>
                                    <p className="text-2xl font-bold text-amber-700 mt-1">{totals.qcPassed.toLocaleString()}</p>
                                    <p className="text-xs text-amber-600">{totals.boxes > 0 ? ((totals.qcPassed / totals.boxes) * 100).toFixed(1) : 0}%</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap gap-3 p-4 bg-gradient-to-r from-primary/5 to-indigo-500/5 rounded-xl border border-primary/20">
                                {getNextAction() && (
                                    <button onClick={() => handleUpdateStatus(getNextAction().status)} disabled={isUpdating}
                                        className={`flex items-center gap-2 px-4 py-2.5 text-white rounded-lg font-semibold disabled:opacity-50 ${getNextAction().color}`}>
                                        {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <PlayCircle size={18} />}
                                        {getNextAction().label}
                                    </button>
                                )}
                                {['QC_Completed', 'Packing'].includes(po.status) && allItemsQCPassed && (
                                    <button onClick={() => handleGeneratePallets()} disabled={isUpdating}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold disabled:opacity-50">
                                        <PackageCheck size={18} /> Generate All Pallets
                                    </button>
                                )}
                                {!['Completed', 'Cancelled'].includes(po.status) && (
                                    <button onClick={() => handleUpdateStatus('Cancelled')} disabled={isUpdating}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-red-100 text-red-600 rounded-lg font-semibold hover:bg-red-200">
                                        Cancel PO
                                    </button>
                                )}
                                <button onClick={() => setShowManualStatus(!showManualStatus)}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-text-secondary rounded-lg ml-auto">
                                    <Settings size={16} /> Manual Status {showManualStatus ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                </button>
                            </div>

                            {showManualStatus && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl border">
                                    <p className="text-sm text-text-secondary mb-3">Change status:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Draft', 'SentToFactory', 'Manufacturing', 'QC_InProgress', 'QC_Completed', 'Packing', 'Completed', 'Cancelled'].map(status => (
                                            <button key={status} onClick={() => handleUpdateStatus(status)} disabled={isUpdating || status === po.status}
                                                className={`px-3 py-1.5 text-sm rounded-lg font-medium disabled:opacity-40 ${getStatusColor(status)}`}>
                                                {status.replace(/_/g, ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Items */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-text dark:text-dark-text">Order Items</h3>
                                <div className="space-y-3">
                                    {po.items.map((item) => {
                                        const qcProgress = item.totalBoxesOrdered > 0 ? (item.quantityPassedQC / item.totalBoxesOrdered) * 100 : 0;
                                        const canGen = ['QC_InProgress', 'QC_Completed', 'Packing'].includes(po.status) && item.quantityPassedQC > (item.boxesConverted || 0);
                                        return (
                                            <div key={item._id} className="p-4 border border-border dark:border-dark-border rounded-xl">
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3">
                                                    <div className="flex-1">
                                                        <p className="font-bold text-lg text-text dark:text-dark-text">{item.tile?.name || 'Unknown'}</p>
                                                        <p className="text-sm text-text-secondary">{item.tile?.tileNumber} • {item.tile?.size}</p>
                                                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                                            <span className="text-blue-600">{item.palletsOrdered} pallets</span>
                                                            <span className="text-purple-600">{item.khatlisOrdered} khatlis</span>
                                                            <span className="text-green-600">{item.totalBoxesOrdered} boxes</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={() => handleOpenQcModal(item)} disabled={!['Manufacturing', 'QC_InProgress'].includes(po.status)}
                                                            className="flex items-center gap-2 text-sm font-semibold bg-primary/10 text-primary px-3 py-2 rounded-lg hover:bg-primary/20 disabled:opacity-50">
                                                            <CheckSquare size={16} /> Record QC
                                                        </button>
                                                        {canGen && (
                                                            <button onClick={() => handleGeneratePallets(item._id)} disabled={isUpdating}
                                                                className="flex items-center gap-2 text-sm font-semibold bg-emerald-500 text-white px-3 py-2 rounded-lg hover:bg-emerald-600 disabled:opacity-50">
                                                                <PackageCheck size={16} /> Generate
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="text-text-secondary">QC Progress</span>
                                                        <span className="font-medium text-text dark:text-dark-text">{item.quantityPassedQC || 0} / {item.totalBoxesOrdered} ({qcProgress.toFixed(0)}%)</span>
                                                    </div>
                                                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                        <div className={`h-full rounded-full ${qcProgress >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(qcProgress, 100)}%` }} />
                                                    </div>
                                                </div>
                                                {(item.palletsGenerated > 0 || item.khatlisGenerated > 0) && (
                                                    <div className="mt-2 flex items-center gap-2 text-sm text-emerald-600">
                                                        <PackageCheck size={14} /> Generated: {item.palletsGenerated || 0} pallets, {item.khatlisGenerated || 0} khatlis
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {po.packingRules && (
                                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                                    <h4 className="font-semibold text-text dark:text-dark-text mb-2">Packing Rules</h4>
                                    <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
                                        <span>Boxes/Pallet: <strong className="text-text">{po.packingRules.boxesPerPallet || 'N/A'}</strong></span>
                                        <span>Boxes/Khatli: <strong className="text-text">{po.packingRules.boxesPerKhatli || 'N/A'}</strong></span>
                                    </div>
                                </div>
                            )}

                            {po.generatedPallets?.length > 0 && (
                                <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                                    <div className="flex items-center gap-2 text-emerald-700">
                                        <PackageCheck size={20} />
                                        <span className="font-semibold">{po.generatedPallets.length} pallets/khatlis generated</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagePOModal;