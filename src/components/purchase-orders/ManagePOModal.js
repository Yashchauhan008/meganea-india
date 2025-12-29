// // frontend/src/components/purchase-orders/ManagePOModal.js

// import React, { useState, useEffect, useMemo } from 'react';
// import { getPurchaseOrderById, updatePOStatus, generatePalletsForPO } from '../../api/purchaseOrderApi';
// import { Loader2, X, Factory, Calendar, PlayCircle, CheckSquare, History, PackageCheck, ClipboardCheck } from 'lucide-react';
// import { format } from 'date-fns';
// import RecordQCModal from './RecordQCModal';

// const ManagePOModal = ({ poId, onClose }) => {
//     const [po, setPo] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [isUpdating, setIsUpdating] = useState(false);
//     const [isQcModalOpen, setIsQcModalOpen] = useState(false);
//     const [selectedItemForQc, setSelectedItemForQc] = useState(null);

//     // useMemo ensures this calculation only runs when the 'po' state changes.
//     // This determines if the "Generate Pallets" button should be enabled.
//     const allItemsQCPassed = useMemo(() => {
//         if (!po || !po.items) return false;
//         return po.items.every(item => item.quantityPassedQC >= item.totalBoxesOrdered);
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

//     useEffect(() => {
//         fetchPO();
//     }, [poId]);

//     const handleUpdateStatus = async (newStatus) => {
//         if (!window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) return;
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

//     const handleGeneratePallets = async () => {
//         if (!window.confirm('This will confirm production and generate all pallet records for this PO. This action cannot be undone. Proceed?')) return;
//         setIsUpdating(true);
//         try {
//             const { data } = await generatePalletsForPO(poId);
//             setPo(data); // Update the modal with the final PO state (e.g., status: "Completed")
//         } catch (err) {
//             alert(err.response?.data?.message || 'Failed to generate pallets.');
//         } finally {
//             setIsUpdating(false);
//         }
//     };

//     const handleOpenQcModal = (item) => {
//         setSelectedItemForQc(item);
//         setIsQcModalOpen(true);
//     };

//     const handleSaveQc = (updatedPO) => {
//         setPo(updatedPO); // Instantly update the main modal with the new data from the backend
//     };

//     const getStatusColor = (status) => {
//         switch (status) {
//             case 'Draft': return 'bg-blue-100 text-blue-800';
//             case 'SentToFactory': return 'bg-cyan-100 text-cyan-800';
//             case 'Manufacturing': return 'bg-yellow-100 text-yellow-800';
//             case 'QC_InProgress': return 'bg-orange-100 text-orange-800';
//             case 'QC_Completed': return 'bg-indigo-100 text-indigo-800';
//             case 'Packing': return 'bg-purple-100 text-purple-800';
//             case 'Completed': return 'bg-green-100 text-green-800';
//             case 'Cancelled': return 'bg-red-100 text-red-800';
//             default: return 'bg-gray-100 text-gray-800';
//         }
//     };

//     return (
//         <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
//             {isQcModalOpen && (
//                 <RecordQCModal
//                     poId={po._id}
//                     item={selectedItemForQc}
//                     onClose={() => setIsQcModalOpen(false)}
//                     onSave={handleSaveQc}
//                 />
//             )}

//             <div 
//                 className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
//                 onClick={e => e.stopPropagation()}
//             >
//                 <div className="flex justify-between items-center p-5 border-b border-border dark:border-dark-border">
//                     <div>
//                         <h1 className="text-2xl font-bold text-text dark:text-dark-text">Manage Purchase Order</h1>
//                         <p className="font-mono text-primary dark:text-dark-primary">{po?.poId || 'Loading...'}</p>
//                     </div>
//                     <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background">
//                         <X size={24} className="text-text-secondary" />
//                     </button>
//                 </div>

//                 <div className="flex-grow overflow-y-auto p-6">
//                     {loading && <div className="flex justify-center items-center h-full"><Loader2 size={32} className="animate-spin text-primary" /></div>}
//                     {error && <p className="text-center text-red-500">{error}</p>}
                    
//                     {po && (
//                         <div className="space-y-6">
//                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                                 <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
//                                     <div className="text-sm text-text-secondary flex items-center gap-2"><Factory size={14}/> Factory</div>
//                                     <div className="text-lg font-bold text-text dark:text-dark-text">{po.factory.name}</div>
//                                 </div>
//                                 <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
//                                     <div className="text-sm text-text-secondary">Status</div>
//                                     <div className={`text-lg font-bold inline-block px-3 py-1 mt-1 rounded-full text-sm ${getStatusColor(po.status)}`}>{po.status}</div>
//                                 </div>
//                                 <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
//                                     <div className="text-sm text-text-secondary flex items-center gap-2"><Calendar size={14}/> Created Date</div>
//                                     <div className="text-lg font-bold text-text dark:text-dark-text">{format(new Date(po.createdAt), 'dd MMM, yyyy')}</div>
//                                 </div>
//                             </div>

//                             <div>
//                                 <h3 className="text-lg font-semibold mb-3 text-text dark:text-dark-text">Ordered Items</h3>
//                                 <div className="space-y-4">
//                                     {po.items.map((item) => {
//                                         const totalBoxes = item.totalBoxesOrdered;
//                                         const qcProgress = totalBoxes > 0 ? (item.quantityPassedQC / totalBoxes) * 100 : 0;
                                        
//                                         return (
//                                             <div key={item._id} className="p-4 border border-border dark:border-dark-border rounded-lg">
//                                                 <div className="flex flex-col sm:flex-row justify-between sm:items-center">
//                                                     <div>
//                                                         <p className="font-bold text-lg text-text dark:text-dark-text">{item.tile.name}</p>
//                                                         <p className="text-sm text-text-secondary">
//                                                             {item.palletsOrdered} pallets, {item.khatlisOrdered} khatlis ({totalBoxes} total boxes)
//                                                         </p>
//                                                     </div>
//                                                     <div className="mt-2 sm:mt-0">
//                                                         <button 
//                                                             onClick={() => handleOpenQcModal(item)}
//                                                             disabled={!['Manufacturing', 'QC_InProgress'].includes(po.status)}
//                                                             className="flex items-center gap-2 text-sm font-semibold bg-primary/10 text-primary px-3 py-2 rounded-md hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
//                                                         >
//                                                             <CheckSquare size={16} /> Record QC
//                                                         </button>
//                                                     </div>
//                                                 </div>
//                                                 <div className="mt-3">
//                                                     <div className="flex justify-between text-xs text-text-secondary mb-1">
//                                                         <span>QC Progress</span>
//                                                         <span>{item.quantityPassedQC} / {totalBoxes} boxes</span>
//                                                     </div>
//                                                     <div className="w-full bg-background dark:bg-dark-background rounded-full h-2.5">
//                                                         <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${qcProgress}%` }}></div>
//                                                     </div>
//                                                 </div>

//                                                 {item.qcHistory && item.qcHistory.length > 0 && (
//                                                     <div className="mt-4 border-t border-border dark:border-dark-border pt-3">
//                                                         <h5 className="text-xs font-bold text-text-secondary flex items-center gap-2 mb-2"><History size={14}/> QC History</h5>
//                                                         <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
//                                                             {item.qcHistory.map(rec => (
//                                                                 <div key={rec._id} className="text-xs p-2 bg-background dark:bg-dark-background rounded-md">
//                                                                     <div className="flex justify-between">
//                                                                         <span>Checked by {rec.checkedBy?.username || '...'} on {format(new Date(rec.qcDate), 'dd MMM')}</span>
//                                                                         <div className="font-semibold">
//                                                                             <span className="text-green-600">Passed: {rec.quantityPassed}</span>, <span className="text-red-600">Failed: {rec.quantityFailed}</span>
//                                                                         </div>
//                                                                     </div>
//                                                                     {rec.notes && <p className="text-text-secondary mt-1 italic">"{rec.notes}"</p>}
//                                                                 </div>
//                                                             ))}
//                                                         </div>
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </div>

//                             {po.generatedPallets && po.generatedPallets.length > 0 && (
//                                 <div>
//                                     <h3 className="text-lg font-semibold mb-3 text-text dark:text-dark-text flex items-center gap-2">
//                                         <PackageCheck size={20} className="text-green-500" />
//                                         Generated Inventory
//                                     </h3>
//                                     <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
//                                         <p className="font-semibold text-text dark:text-dark-text">
//                                             {po.generatedPallets.length} pallets/khatlis have been created and added to factory stock.
//                                         </p>
//                                         <p className="text-sm text-text-secondary">
//                                             You can now view these items on the "Factory Stock" page.
//                                         </p>
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-end gap-3">
//                     <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary rounded-md bg-foreground dark:bg-dark-border hover:bg-gray-100">
//                         Close
//                     </button>
                    
//                     {po?.status === 'Draft' && (
//                         <button 
//                             onClick={() => handleUpdateStatus('SentToFactory')}
//                             disabled={isUpdating} 
//                             className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2"
//                         >
//                             {isUpdating && <Loader2 size={16} className="animate-spin" />}
//                             Send to Factory
//                         </button>
//                     )}

//                     {po?.status === 'SentToFactory' && (
//                         <button 
//                             onClick={() => handleUpdateStatus('Manufacturing')}
//                             disabled={isUpdating} 
//                             className="px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-md hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
//                         >
//                             {isUpdating && <Loader2 size={16} className="animate-spin" />}
//                             <PlayCircle size={16} />
//                             Start Manufacturing
//                         </button>
//                     )}

//                     {['Manufacturing', 'QC_InProgress'].includes(po?.status) && (
//                         <button 
//                             onClick={() => handleUpdateStatus('QC_Completed')}
//                             disabled={isUpdating} 
//                             className="px-4 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-md hover:bg-indigo-600 disabled:opacity-50 flex items-center gap-2"
//                         >
//                             {isUpdating && <Loader2 size={16} className="animate-spin" />}
//                             <ClipboardCheck size={16} />
//                             Mark QC as Completed
//                         </button>
//                     )}

//                     {po?.status === 'QC_Completed' && (
//                         <button 
//                             onClick={handleGeneratePallets}
//                             disabled={!allItemsQCPassed || isUpdating} 
//                             className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
//                             title={!allItemsQCPassed ? 'Not all items have passed QC yet.' : 'Generate all pallet records for this PO.'}
//                         >
//                             {isUpdating && <Loader2 size={16} className="animate-spin" />}
//                             <PackageCheck size={16} />
//                             Confirm Production & Generate Pallets
//                         </button>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ManagePOModal;

// FILE LOCATION: src/components/purchase-orders/ManagePOModal.js

import React, { useState, useEffect, useMemo } from 'react';
import { getPurchaseOrderById, updatePOStatus, generatePalletsForPO } from '../../api/purchaseOrderApi';
import { 
    Loader2, X, Factory, Calendar, PlayCircle, CheckSquare, History, 
    PackageCheck, ClipboardCheck, FileText, ArrowRight, Package, 
    Box, Boxes, ChevronDown, ChevronUp, User, Clock, CheckCircle, 
    XCircle, Clipboard, TrendingUp, AlertCircle, Send, Settings, Ban
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import RecordQCModal from './RecordQCModal';

// All possible statuses for manual change
const ALL_STATUSES = [
    { key: 'Draft', label: 'Draft', color: 'bg-blue-500' },
    { key: 'SentToFactory', label: 'Sent to Factory', color: 'bg-cyan-500' },
    { key: 'Manufacturing', label: 'Manufacturing', color: 'bg-yellow-500' },
    { key: 'QC_InProgress', label: 'QC In Progress', color: 'bg-orange-500' },
    { key: 'QC_Completed', label: 'QC Completed', color: 'bg-indigo-500' },
    { key: 'Packing', label: 'Packing', color: 'bg-purple-500' },
    { key: 'Completed', label: 'Completed', color: 'bg-green-500' },
    { key: 'Cancelled', label: 'Cancelled', color: 'bg-red-500' },
];

const ManagePOModal = ({ poId, onClose }) => {
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isQcModalOpen, setIsQcModalOpen] = useState(false);
    const [selectedItemForQc, setSelectedItemForQc] = useState(null);
    const [expandedItems, setExpandedItems] = useState({});
    const [showManualStatusChange, setShowManualStatusChange] = useState(false);
    const [generatingItemId, setGeneratingItemId] = useState(null);

    // Calculate totals
    const totals = useMemo(() => {
        if (!po?.items) return { pallets: 0, khatlis: 0, boxes: 0, qcPassed: 0, qcPercent: 0, converted: 0 };
        let pallets = 0, khatlis = 0, boxes = 0, qcPassed = 0, converted = 0;
        po.items.forEach(item => {
            pallets += item.palletsOrdered || 0;
            khatlis += item.khatlisOrdered || 0;
            boxes += item.totalBoxesOrdered || 0;
            qcPassed += item.quantityPassedQC || 0;
            converted += item.boxesConverted || 0;
        });
        return { 
            pallets, khatlis, boxes, qcPassed, converted,
            qcPercent: boxes > 0 ? Math.round((qcPassed / boxes) * 100) : 0 
        };
    }, [po]);

    const fetchPO = async () => {
        if (!poId) return;
        setLoading(true);
        setError('');
        try {
            const response = await getPurchaseOrderById(poId);
            setPo(response?.data || response);
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
            const response = await updatePOStatus(poId, newStatus);
            setPo(response?.data || response);
            setShowManualStatusChange(false);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Generate pallets for ALL items
    const handleGenerateAllPallets = async () => {
        if (!window.confirm('Generate pallets for ALL QC-passed items? This will add them to factory stock.')) return;
        setIsUpdating(true);
        try {
            const response = await generatePalletsForPO(poId);
            setPo(response?.data || response);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to generate pallets.');
        } finally {
            setIsUpdating(false);
        }
    };

    // Generate pallets for a SINGLE item (partial generation)
    const handleGenerateItemPallets = async (item) => {
        const qcPassed = item.quantityPassedQC || 0;
        const alreadyConverted = item.boxesConverted || 0;
        const availableBoxes = qcPassed - alreadyConverted;
        
        if (availableBoxes <= 0) {
            alert(`No new QC-passed boxes available.\n\nQC Passed: ${qcPassed} boxes\nAlready Converted: ${alreadyConverted} boxes`);
            return;
        }

        const boxesPerPallet = po.packingRules?.boxesPerPallet || 32;
        const boxesPerKhatli = po.packingRules?.boxesPerKhatli || 20;
        
        if (!window.confirm(
            `Generate pallets for "${item.tile?.name || 'this item'}"?\n\n` +
            `Available: ${availableBoxes} QC-passed boxes\n` +
            `Boxes per Pallet: ${boxesPerPallet}\n` +
            `Boxes per Khatli: ${boxesPerKhatli}\n\n` +
            `This will create inventory in factory stock.`
        )) return;
        
        setGeneratingItemId(item._id);
        try {
            const response = await generatePalletsForPO(poId, { itemId: item._id });
            setPo(response?.data || response);
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to generate pallets for this item.');
        } finally {
            setGeneratingItemId(null);
        }
    };

    const handleOpenQcModal = (item) => {
        setSelectedItemForQc(item);
        setIsQcModalOpen(true);
    };

    const handleSaveQc = (updatedPO) => { setPo(updatedPO); };
    const toggleItemExpand = (itemId) => { setExpandedItems(prev => ({ ...prev, [itemId]: !prev[itemId] })); };

    // Get action buttons based on current status
    const getActionButtons = () => {
        if (!po) return [];
        const buttons = [];
        
        switch (po.status) {
            case 'Draft':
                buttons.push({ label: 'Send to Factory', icon: Send, action: () => handleUpdateStatus('SentToFactory'), color: 'bg-cyan-600 hover:bg-cyan-700' });
                break;
            case 'SentToFactory':
                buttons.push({ label: 'Start Manufacturing', icon: PlayCircle, action: () => handleUpdateStatus('Manufacturing'), color: 'bg-yellow-600 hover:bg-yellow-700' });
                break;
            case 'Manufacturing':
                buttons.push({ label: 'Start QC', icon: Clipboard, action: () => handleUpdateStatus('QC_InProgress'), color: 'bg-orange-600 hover:bg-orange-700' });
                break;
            case 'QC_InProgress':
                if (totals.qcPassed > totals.converted) {
                    buttons.push({ label: 'Generate All Pallets', icon: PackageCheck, action: handleGenerateAllPallets, color: 'bg-green-600 hover:bg-green-700' });
                }
                buttons.push({ label: 'Complete QC', icon: ClipboardCheck, action: () => handleUpdateStatus('QC_Completed'), color: 'bg-indigo-600 hover:bg-indigo-700' });
                break;
            case 'QC_Completed':
                buttons.push({ label: 'Generate All Pallets', icon: PackageCheck, action: handleGenerateAllPallets, color: 'bg-green-600 hover:bg-green-700', disabled: totals.qcPassed === 0 || totals.qcPassed <= totals.converted });
                break;
            case 'Packing':
                if (totals.qcPassed > totals.converted) {
                    buttons.push({ label: 'Generate Remaining', icon: PackageCheck, action: handleGenerateAllPallets, color: 'bg-green-600 hover:bg-green-700' });
                }
                buttons.push({ label: 'Mark Completed', icon: CheckCircle, action: () => handleUpdateStatus('Completed'), color: 'bg-green-600 hover:bg-green-700' });
                break;
            default:
                break;
        }

        if (!['Completed', 'Cancelled'].includes(po.status)) {
            buttons.push({ label: 'Cancel PO', icon: Ban, action: () => handleUpdateStatus('Cancelled'), color: 'bg-red-600 hover:bg-red-700', isSecondary: true });
        }

        return buttons;
    };

    const actionButtons = getActionButtons();

    return (
        <>
            {isQcModalOpen && (
                <RecordQCModal poId={po._id} item={selectedItemForQc} onClose={() => setIsQcModalOpen(false)} onSave={handleSaveQc} />
            )}

            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
                    
                    {/* Header */}
                    <div className="flex justify-between items-start p-5 border-b border-border dark:border-dark-border flex-shrink-0">
                        <div>
                            <h1 className="text-2xl font-bold text-text dark:text-dark-text">Manage Purchase Order</h1>
                            <p className="font-mono text-primary dark:text-blue-400 font-bold">{po?.poId || 'Loading...'}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background">
                            <X size={24} className="text-text-secondary" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto">
                        {loading && <div className="flex justify-center items-center py-32"><Loader2 size={48} className="animate-spin text-primary" /></div>}
                        {error && <div className="m-6 p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3"><AlertCircle size={20} /> {error}</div>}
                        
                        {po && (
                            <div className="p-6 space-y-6">
                                
                                {/* ACTION BUTTONS - ALWAYS VISIBLE */}
                                {actionButtons.length > 0 && (
                                    <div className="bg-gradient-to-r from-primary/5 to-indigo-500/5 dark:from-primary/10 dark:to-indigo-500/10 rounded-xl p-4 border border-primary/20">
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                            <div>
                                                <p className="text-sm text-text-secondary">Current Status</p>
                                                <p className="text-xl font-bold text-text dark:text-dark-text">{po.status.replace(/_/g, ' ')}</p>
                                            </div>
                                            <div className="flex flex-wrap gap-3">
                                                {actionButtons.filter(b => !b.isSecondary).map((btn, idx) => (
                                                    <button key={idx} onClick={btn.action} disabled={isUpdating || btn.disabled}
                                                        className={`flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-semibold transition-all disabled:opacity-50 ${btn.color}`}>
                                                        {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <btn.icon size={18} />}
                                                        {btn.label}
                                                    </button>
                                                ))}
                                                {actionButtons.filter(b => b.isSecondary).map((btn, idx) => (
                                                    <button key={`sec-${idx}`} onClick={btn.action} disabled={isUpdating}
                                                        className="flex items-center gap-2 px-4 py-2.5 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50">
                                                        <btn.icon size={16} /> {btn.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Manual Status Change */}
                                <div className="border border-border dark:border-dark-border rounded-xl overflow-hidden">
                                    <button onClick={() => setShowManualStatusChange(!showManualStatusChange)}
                                        className="w-full p-3 flex items-center justify-between bg-background dark:bg-dark-background hover:bg-gray-100 dark:hover:bg-dark-border">
                                        <span className="flex items-center gap-2 text-sm font-medium text-text-secondary"><Settings size={16} /> Manual Status Change</span>
                                        {showManualStatusChange ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                    {showManualStatusChange && (
                                        <div className="p-4 border-t border-border dark:border-dark-border">
                                            <p className="text-xs text-text-secondary mb-3">Override workflow:</p>
                                            <div className="flex flex-wrap gap-2">
                                                {ALL_STATUSES.map(status => (
                                                    <button key={status.key} onClick={() => handleUpdateStatus(status.key)}
                                                        disabled={isUpdating || po.status === status.key}
                                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all disabled:opacity-30 ${po.status === status.key ? 'bg-gray-300 dark:bg-gray-600' : `${status.color} text-white hover:opacity-90`}`}>
                                                        {status.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Info Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-xl">
                                        <div className="flex items-center gap-2 text-text-secondary text-sm mb-1"><Factory size={14} /> Factory</div>
                                        <p className="font-bold text-text dark:text-dark-text">{po.factory?.name || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-xl">
                                        <div className="flex items-center gap-2 text-text-secondary text-sm mb-1"><Calendar size={14} /> Created</div>
                                        <p className="font-bold text-text dark:text-dark-text">{format(parseISO(po.createdAt), 'dd MMM yyyy')}</p>
                                    </div>
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-xl">
                                        <div className="flex items-center gap-2 text-text-secondary text-sm mb-1"><User size={14} /> Created By</div>
                                        <p className="font-bold text-text dark:text-dark-text">{po.createdBy?.username || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-xl">
                                        <div className="flex items-center gap-2 text-text-secondary text-sm mb-1"><FileText size={14} /> Source</div>
                                        <p className="font-bold text-text dark:text-dark-text">{po.sourceRestockRequest?.requestId || 'Manual'}</p>
                                    </div>
                                </div>

                                {/* Totals Summary */}
                                <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                    <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-center border border-indigo-200 dark:border-indigo-800">
                                        <Package size={20} className="mx-auto text-indigo-600 dark:text-indigo-400 mb-1" />
                                        <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{totals.pallets}</p>
                                        <p className="text-xs text-indigo-700 dark:text-indigo-300">Pallets</p>
                                    </div>
                                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center border border-purple-200 dark:border-purple-800">
                                        <Boxes size={20} className="mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{totals.khatlis}</p>
                                        <p className="text-xs text-purple-700 dark:text-purple-300">Khatlis</p>
                                    </div>
                                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl text-center border border-orange-200 dark:border-orange-800">
                                        <Box size={20} className="mx-auto text-orange-600 dark:text-orange-400 mb-1" />
                                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{totals.boxes}</p>
                                        <p className="text-xs text-orange-700 dark:text-orange-300">Total Boxes</p>
                                    </div>
                                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-center border border-green-200 dark:border-green-800">
                                        <CheckCircle size={20} className="mx-auto text-green-600 dark:text-green-400 mb-1" />
                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{totals.qcPassed}</p>
                                        <p className="text-xs text-green-700 dark:text-green-300">QC Passed</p>
                                    </div>
                                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-center border border-blue-200 dark:border-blue-800">
                                        <PackageCheck size={20} className="mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                                        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totals.converted}</p>
                                        <p className="text-xs text-blue-700 dark:text-blue-300">Converted</p>
                                    </div>
                                    <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl text-center border border-cyan-200 dark:border-cyan-800">
                                        <TrendingUp size={20} className="mx-auto text-cyan-600 dark:text-cyan-400 mb-1" />
                                        <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">{totals.qcPercent}%</p>
                                        <p className="text-xs text-cyan-700 dark:text-cyan-300">QC Progress</p>
                                    </div>
                                </div>

                                {/* Items List */}
                                <div>
                                    <h3 className="text-lg font-bold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                                        <Package size={20} /> Items ({po.items?.length || 0})
                                    </h3>
                                    <div className="space-y-3">
                                        {po.items?.map((item) => {
                                            const qcProgress = item.totalBoxesOrdered > 0 ? Math.round((item.quantityPassedQC / item.totalBoxesOrdered) * 100) : 0;
                                            const isExpanded = expandedItems[item._id];
                                            const canRecordQC = ['Manufacturing', 'QC_InProgress'].includes(po.status);
                                            const canGeneratePallets = ['QC_InProgress', 'QC_Completed', 'Packing'].includes(po.status);
                                            
                                            // Calculate available boxes for conversion
                                            const qcPassed = item.quantityPassedQC || 0;
                                            const boxesConverted = item.boxesConverted || 0;
                                            const availableForConversion = qcPassed - boxesConverted;
                                            const palletsGenerated = item.palletsGenerated || 0;
                                            const khatlisGenerated = item.khatlisGenerated || 0;

                                            return (
                                                <div key={item._id} className="border border-border dark:border-dark-border rounded-xl overflow-hidden">
                                                    <div className="p-4 bg-background dark:bg-dark-background">
                                                        <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-3">
                                                            <div className="flex-1">
                                                                <p className="font-bold text-lg text-text dark:text-dark-text">{item.tile?.name || 'Unknown'}</p>
                                                                <div className="flex flex-wrap gap-3 mt-1 text-sm text-text-secondary">
                                                                    <span className="flex items-center gap-1"><Package size={14} className="text-indigo-500" /> {item.palletsOrdered} pallets</span>
                                                                    <span className="flex items-center gap-1"><Boxes size={14} className="text-purple-500" /> {item.khatlisOrdered} khatlis</span>
                                                                    <span className="flex items-center gap-1"><Box size={14} className="text-orange-500" /> {item.totalBoxesOrdered} boxes</span>
                                                                </div>
                                                            </div>
                                                            
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                {canRecordQC && (
                                                                    <button onClick={() => handleOpenQcModal(item)}
                                                                        className="flex items-center gap-2 text-sm font-semibold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 px-3 py-2 rounded-lg hover:bg-orange-200 dark:hover:bg-orange-900/50">
                                                                        <CheckSquare size={16} /> Record QC
                                                                    </button>
                                                                )}
                                                                {canGeneratePallets && availableForConversion > 0 && (
                                                                    <button onClick={() => handleGenerateItemPallets(item)}
                                                                        disabled={generatingItemId === item._id}
                                                                        className="flex items-center gap-2 text-sm font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-2 rounded-lg hover:bg-green-200 dark:hover:bg-green-900/50 disabled:opacity-50">
                                                                        {generatingItemId === item._id ? <Loader2 size={16} className="animate-spin" /> : <PackageCheck size={16} />}
                                                                        Generate ({availableForConversion} boxes)
                                                                    </button>
                                                                )}
                                                                <button onClick={() => toggleItemExpand(item._id)}
                                                                    className="p-2 text-text-secondary hover:bg-foreground dark:hover:bg-dark-foreground rounded-lg">
                                                                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                                                </button>
                                                            </div>
                                                        </div>

                                                        {/* Progress Bars */}
                                                        <div className="mt-3 space-y-2">
                                                            {/* QC Progress */}
                                                            <div>
                                                                <div className="flex justify-between text-xs text-text-secondary mb-1">
                                                                    <span>QC Progress</span>
                                                                    <span><span className="text-green-600 font-medium">{item.quantityPassedQC || 0}</span> / {item.totalBoxesOrdered} boxes ({qcProgress}%)</span>
                                                                </div>
                                                                <div className="w-full bg-foreground dark:bg-dark-foreground rounded-full h-2">
                                                                    <div className={`h-2 rounded-full transition-all ${qcProgress === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                                                                        style={{ width: `${qcProgress}%` }} />
                                                                </div>
                                                            </div>

                                                            {/* Conversion Progress (if any converted) */}
                                                            {boxesConverted > 0 && (
                                                                <div>
                                                                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                                                                        <span>Converted to Stock</span>
                                                                        <span><span className="text-blue-600 font-medium">{boxesConverted}</span> / {qcPassed} QC-passed boxes</span>
                                                                    </div>
                                                                    <div className="w-full bg-foreground dark:bg-dark-foreground rounded-full h-2">
                                                                        <div className="h-2 rounded-full bg-blue-500 transition-all"
                                                                            style={{ width: `${qcPassed > 0 ? (boxesConverted / qcPassed) * 100 : 0}%` }} />
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Generated Info */}
                                                        {(palletsGenerated > 0 || khatlisGenerated > 0) && (
                                                            <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                                                <p className="text-sm text-green-700 dark:text-green-300 flex items-center gap-2">
                                                                    <PackageCheck size={14} />
                                                                    Generated: 
                                                                    {palletsGenerated > 0 && <span className="font-semibold">{palletsGenerated} pallets</span>}
                                                                    {palletsGenerated > 0 && khatlisGenerated > 0 && ', '}
                                                                    {khatlisGenerated > 0 && <span className="font-semibold">{khatlisGenerated} khatlis</span>}
                                                                    <span className="text-green-600">({boxesConverted} boxes)</span>
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* QC History */}
                                                    {isExpanded && (
                                                        <div className="p-4 border-t border-border dark:border-dark-border">
                                                            {item.qcHistory && item.qcHistory.length > 0 ? (
                                                                <>
                                                                    <h5 className="text-xs font-bold text-text-secondary uppercase flex items-center gap-2 mb-3"><History size={14} /> QC History</h5>
                                                                    <div className="space-y-2 max-h-48 overflow-y-auto">
                                                                        {item.qcHistory.map((rec, idx) => (
                                                                            <div key={rec._id || idx} className="p-3 bg-background dark:bg-dark-background rounded-lg">
                                                                                <div className="flex justify-between items-start">
                                                                                    <div className="flex items-center gap-2 text-sm text-text-secondary">
                                                                                        <User size={12} /> {rec.checkedBy?.username || 'Unknown'} • <Clock size={12} /> {format(parseISO(rec.qcDate), 'dd MMM, HH:mm')}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-3 text-sm font-semibold">
                                                                                        <span className="text-green-600">✓ {rec.quantityPassed}</span>
                                                                                        <span className="text-red-600">✗ {rec.quantityFailed}</span>
                                                                                    </div>
                                                                                </div>
                                                                                {rec.notes && <p className="text-sm text-text-secondary mt-2 italic">"{rec.notes}"</p>}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                </>
                                                            ) : (
                                                                <p className="text-center text-text-secondary text-sm py-4">No QC records yet</p>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Generated Pallets Summary */}
                                {po.generatedPallets && po.generatedPallets.length > 0 && (
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg"><PackageCheck size={24} className="text-green-600 dark:text-green-400" /></div>
                                            <div>
                                                <p className="font-bold text-green-700 dark:text-green-300">{po.generatedPallets.length} Pallets/Khatlis in Factory Stock</p>
                                                <p className="text-sm text-green-600 dark:text-green-400">View them on the Factory Stock page</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Packing Rules */}
                                {po.packingRules && (
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-xl border border-border dark:border-dark-border">
                                        <h3 className="text-sm font-semibold text-text-secondary uppercase mb-3">Packing Rules</h3>
                                        <div className="flex flex-wrap gap-6 text-sm">
                                            <div><span className="text-text-secondary">Boxes/Pallet:</span> <span className="font-bold text-text dark:text-dark-text">{po.packingRules.boxesPerPallet}</span></div>
                                            <div><span className="text-text-secondary">Boxes/Khatli:</span> <span className="font-bold text-text dark:text-dark-text">{po.packingRules.boxesPerKhatli}</span></div>
                                            <div><span className="text-text-secondary">Pallets/Container:</span> <span className="font-bold text-text dark:text-dark-text">{po.packingRules.palletsPerContainer}</span></div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-end flex-shrink-0">
                        <button onClick={onClose} className="px-6 py-2.5 font-semibold text-text dark:text-dark-text border border-border dark:border-dark-border rounded-lg hover:bg-foreground dark:hover:bg-dark-foreground">Close</button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ManagePOModal;