// frontend/src/components/purchase-orders/ManagePOModal.js

import React, { useState, useEffect } from 'react';
// --- 1. IMPORT THE NEW API FUNCTION ---
import { getPurchaseOrderById, updatePOStatus } from '../../api/purchaseOrderApi';
import { Loader2, X, Factory, Calendar, User, FileText, Hash, Box, Package, Container } from 'lucide-react';
import { format } from 'date-fns';

const ManagePOModal = ({ poId, onClose }) => {
    const [po, setPo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    // --- 2. ADD STATE FOR THE BUTTON ACTION ---
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
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
        fetchPO();
    }, [poId]);

    // --- 3. CREATE THE HANDLER FUNCTION ---
    const handleUpdateStatus = async (newStatus) => {
        if (!window.confirm(`Are you sure you want to change the status to "${newStatus}"?`)) {
            return;
        }
        setIsUpdating(true);
        try {
            const { data } = await updatePOStatus(poId, newStatus);
            // Update the local state to instantly reflect the change in the UI
            setPo(data); 
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setIsUpdating(false);
        }
    };

    const getStatusColor = (status) => {
        // ... (this function remains the same)
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
            <div 
                className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Header (no changes) */}
                <div className="flex justify-between items-center p-5 border-b border-border dark:border-dark-border">
                    <div>
                        <h1 className="text-2xl font-bold text-text dark:text-dark-text">Manage Purchase Order</h1>
                        <p className="font-mono text-primary dark:text-dark-primary">{po?.poId || 'Loading...'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background">
                        <X size={24} className="text-text-secondary" />
                    </button>
                </div>

                {/* Body (no changes) */}
                <div className="flex-grow overflow-y-auto p-6">
                    {/* ... (loading, error, and PO details display remain the same) ... */}
                    {loading && (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 size={32} className="animate-spin text-primary" />
                        </div>
                    )}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    
                    {po && (
                        <div className="space-y-6">
                            {/* Key Details Grid */}
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
                                <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
                                    <div className="text-sm text-text-secondary flex items-center gap-2"><User size={14}/> Created By</div>
                                    <div className="text-lg font-bold text-text dark:text-dark-text">{po.createdBy.username}</div>
                                </div>
                                <div className="p-4 bg-background dark:bg-dark-background rounded-lg col-span-1 md:col-span-2">
                                    <div className="text-sm text-text-secondary flex items-center gap-2"><FileText size={14}/> Source Request</div>
                                    <div className="text-lg font-bold text-text dark:text-dark-text">{po.sourceRestockRequest?.requestId || 'Manual PO'}</div>
                                </div>
                            </div>

                            {/* Ordered Items Section */}
                            <div>
                                <h3 className="text-lg font-semibold mb-3 text-text dark:text-dark-text">Ordered Items & Packing</h3>
                                <div className="border border-border dark:border-dark-border rounded-lg p-4 space-y-3">
                                    <div className="grid grid-cols-3 gap-4 text-center text-sm text-text-secondary">
                                        <div className="flex items-center justify-center gap-2"><Package size={16}/> {po.packingRules.boxesPerPallet} boxes/pallet</div>
                                        <div className="flex items-center justify-center gap-2"><Box size={16}/> {po.packingRules.boxesPerKhatli} boxes/khatli</div>
                                        <div className="flex items-center justify-center gap-2"><Container size={16}/> {po.packingRules.palletsPerContainer} pallets/container</div>
                                    </div>
                                    <div className="border-t border-border dark:border-dark-border my-3"></div>
                                    {po.items.map((item, index) => (
                                        <div key={index} className="grid grid-cols-4 gap-4 items-center">
                                            <div className="col-span-2 font-semibold text-text dark:text-dark-text">{item.tile.name}</div>
                                            <div className="text-sm text-text-secondary">Pallets: {item.palletsOrdered}</div>
                                            <div className="text-sm text-text-secondary">Khatlis: {item.khatlisOrdered}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer with Actions */}
                <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary rounded-md bg-foreground dark:bg-dark-border hover:bg-gray-100">
                        Close
                    </button>
                    {/* --- 4. UPDATE THE BUTTON --- */}
                    <button 
                        onClick={() => handleUpdateStatus('SentToFactory')}
                        disabled={po?.status !== 'Draft' || isUpdating} 
                        className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2"
                    >
                        {isUpdating && <Loader2 size={16} className="animate-spin" />}
                        Send to Factory
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManagePOModal;
