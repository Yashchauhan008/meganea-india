// frontend/src/components/purchase-orders/ManagePOModal.js

import React, { useState, useEffect, useMemo } from 'react';
import { getPurchaseOrderById, updatePOStatus, generatePalletsForPO } from '../../api/purchaseOrderApi';
import { Loader2, X, Factory, Calendar, PlayCircle, CheckSquare, History, PackageCheck, ClipboardCheck } from 'lucide-react';
import { format } from 'date-fns';
import RecordQCModal from './RecordQCModal';

const ManagePOModal = ({ poId, onClose }) => {
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);
    const [isQcModalOpen, setIsQcModalOpen] = useState(false);
    const [selectedItemForQc, setSelectedItemForQc] = useState(null);

    // useMemo ensures this calculation only runs when the 'po' state changes.
    // This determines if the "Generate Pallets" button should be enabled.
    const allItemsQCPassed = useMemo(() => {
        if (!po || !po.items) return false;
        return po.items.every(item => item.quantityPassedQC >= item.totalBoxesOrdered);
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

    useEffect(() => {
        fetchPO();
    }, [poId]);

    const handleUpdateStatus = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) return;
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

    const handleGeneratePallets = async () => {
        if (!window.confirm('This will confirm production and generate all pallet records for this PO. This action cannot be undone. Proceed?')) return;
        setIsUpdating(true);
        try {
            const { data } = await generatePalletsForPO(poId);
            setPo(data); // Update the modal with the final PO state (e.g., status: "Completed")
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to generate pallets.');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleOpenQcModal = (item) => {
        setSelectedItemForQc(item);
        setIsQcModalOpen(true);
    };

    const handleSaveQc = (updatedPO) => {
        setPo(updatedPO); // Instantly update the main modal with the new data from the backend
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Draft': return 'bg-blue-100 text-blue-800';
            case 'SentToFactory': return 'bg-cyan-100 text-cyan-800';
            case 'Manufacturing': return 'bg-yellow-100 text-yellow-800';
            case 'QC_InProgress': return 'bg-orange-100 text-orange-800';
            case 'QC_Completed': return 'bg-indigo-100 text-indigo-800';
            case 'Packing': return 'bg-purple-100 text-purple-800';
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
            {isQcModalOpen && (
                <RecordQCModal
                    poId={po._id}
                    item={selectedItemForQc}
                    onClose={() => setIsQcModalOpen(false)}
                    onSave={handleSaveQc}
                />
            )}

            <div 
                className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-border dark:border-dark-border">
                    <div>
                        <h1 className="text-2xl font-bold text-text dark:text-dark-text">Manage Purchase Order</h1>
                        <p className="font-mono text-primary dark:text-dark-primary">{po?.poId || 'Loading...'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background">
                        <X size={24} className="text-text-secondary" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    {loading && <div className="flex justify-center items-center h-full"><Loader2 size={32} className="animate-spin text-primary" /></div>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    
                    {po && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
                                    <div className="text-sm text-text-secondary flex items-center gap-2"><Factory size={14}/> Factory</div>
                                    <div className="text-lg font-bold text-text dark:text-dark-text">{po.factory.name}</div>
                                </div>
                                <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
                                    <div className="text-sm text-text-secondary">Status</div>
                                    <div className={`text-lg font-bold inline-block px-3 py-1 mt-1 rounded-full text-sm ${getStatusColor(po.status)}`}>{po.status}</div>
                                </div>
                                <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
                                    <div className="text-sm text-text-secondary flex items-center gap-2"><Calendar size={14}/> Created Date</div>
                                    <div className="text-lg font-bold text-text dark:text-dark-text">{format(new Date(po.createdAt), 'dd MMM, yyyy')}</div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-text dark:text-dark-text">Ordered Items</h3>
                                <div className="space-y-4">
                                    {po.items.map((item) => {
                                        const totalBoxes = item.totalBoxesOrdered;
                                        const qcProgress = totalBoxes > 0 ? (item.quantityPassedQC / totalBoxes) * 100 : 0;
                                        
                                        return (
                                            <div key={item._id} className="p-4 border border-border dark:border-dark-border rounded-lg">
                                                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                                                    <div>
                                                        <p className="font-bold text-lg text-text dark:text-dark-text">{item.tile.name}</p>
                                                        <p className="text-sm text-text-secondary">
                                                            {item.palletsOrdered} pallets, {item.khatlisOrdered} khatlis ({totalBoxes} total boxes)
                                                        </p>
                                                    </div>
                                                    <div className="mt-2 sm:mt-0">
                                                        <button 
                                                            onClick={() => handleOpenQcModal(item)}
                                                            disabled={!['Manufacturing', 'QC_InProgress'].includes(po.status)}
                                                            className="flex items-center gap-2 text-sm font-semibold bg-primary/10 text-primary px-3 py-2 rounded-md hover:bg-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <CheckSquare size={16} /> Record QC
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="mt-3">
                                                    <div className="flex justify-between text-xs text-text-secondary mb-1">
                                                        <span>QC Progress</span>
                                                        <span>{item.quantityPassedQC} / {totalBoxes} boxes</span>
                                                    </div>
                                                    <div className="w-full bg-background dark:bg-dark-background rounded-full h-2.5">
                                                        <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${qcProgress}%` }}></div>
                                                    </div>
                                                </div>

                                                {item.qcHistory && item.qcHistory.length > 0 && (
                                                    <div className="mt-4 border-t border-border dark:border-dark-border pt-3">
                                                        <h5 className="text-xs font-bold text-text-secondary flex items-center gap-2 mb-2"><History size={14}/> QC History</h5>
                                                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                                                            {item.qcHistory.map(rec => (
                                                                <div key={rec._id} className="text-xs p-2 bg-background dark:bg-dark-background rounded-md">
                                                                    <div className="flex justify-between">
                                                                        <span>Checked by {rec.checkedBy?.username || '...'} on {format(new Date(rec.qcDate), 'dd MMM')}</span>
                                                                        <div className="font-semibold">
                                                                            <span className="text-green-600">Passed: {rec.quantityPassed}</span>, <span className="text-red-600">Failed: {rec.quantityFailed}</span>
                                                                        </div>
                                                                    </div>
                                                                    {rec.notes && <p className="text-text-secondary mt-1 italic">"{rec.notes}"</p>}
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

                            {po.generatedPallets && po.generatedPallets.length > 0 && (
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 text-text dark:text-dark-text flex items-center gap-2">
                                        <PackageCheck size={20} className="text-green-500" />
                                        Generated Inventory
                                    </h3>
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
                                        <p className="font-semibold text-text dark:text-dark-text">
                                            {po.generatedPallets.length} pallets/khatlis have been created and added to factory stock.
                                        </p>
                                        <p className="text-sm text-text-secondary">
                                            You can now view these items on the "Factory Stock" page.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary rounded-md bg-foreground dark:bg-dark-border hover:bg-gray-100">
                        Close
                    </button>
                    
                    {po?.status === 'Draft' && (
                        <button 
                            onClick={() => handleUpdateStatus('SentToFactory')}
                            disabled={isUpdating} 
                            className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2"
                        >
                            {isUpdating && <Loader2 size={16} className="animate-spin" />}
                            Send to Factory
                        </button>
                    )}

                    {po?.status === 'SentToFactory' && (
                        <button 
                            onClick={() => handleUpdateStatus('Manufacturing')}
                            disabled={isUpdating} 
                            className="px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-md hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isUpdating && <Loader2 size={16} className="animate-spin" />}
                            <PlayCircle size={16} />
                            Start Manufacturing
                        </button>
                    )}

                    {['Manufacturing', 'QC_InProgress'].includes(po?.status) && (
                        <button 
                            onClick={() => handleUpdateStatus('QC_Completed')}
                            disabled={isUpdating} 
                            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-500 rounded-md hover:bg-indigo-600 disabled:opacity-50 flex items-center gap-2"
                        >
                            {isUpdating && <Loader2 size={16} className="animate-spin" />}
                            <ClipboardCheck size={16} />
                            Mark QC as Completed
                        </button>
                    )}

                    {po?.status === 'QC_Completed' && (
                        <button 
                            onClick={handleGeneratePallets}
                            disabled={!allItemsQCPassed || isUpdating} 
                            className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                            title={!allItemsQCPassed ? 'Not all items have passed QC yet.' : 'Generate all pallet records for this PO.'}
                        >
                            {isUpdating && <Loader2 size={16} className="animate-spin" />}
                            <PackageCheck size={16} />
                            Confirm Production & Generate Pallets
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManagePOModal;
