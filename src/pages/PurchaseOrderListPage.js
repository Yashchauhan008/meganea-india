// frontend/src/pages/PurchaseOrderListPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { getAllPurchaseOrders } from '../api/purchaseOrderApi';
// Removed Link, not needed for this button
import { ClipboardList, Factory, Calendar, FileText, Box, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
// --- 1. IMPORT THE NEW MODAL COMPONENT ---
import ManagePOModal from '../components/purchase-orders/ManagePOModal';

const PurchaseOrderListPage = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // --- 2. ADD STATE TO MANAGE THE MODAL ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPoId, setSelectedPoId] = useState(null);

    const fetchPurchaseOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getAllPurchaseOrders();
            setPurchaseOrders(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch purchase orders.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPurchaseOrders();
    }, [fetchPurchaseOrders]);

    // --- 3. CREATE A HANDLER TO OPEN THE MODAL ---
    const handleManageClick = (poId) => {
        setSelectedPoId(poId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedPoId(null);
        // Optionally, refresh the list in case a status was changed
        fetchPurchaseOrders();
    };

    const getStatusColor = (status) => {
        // (This function remains the same)
        switch (status) {
            case 'Draft': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
            case 'Manufacturing': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
            case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
            case 'Cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
            default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            {/* --- 4. RENDER THE MODAL WHEN isModalOpen IS TRUE --- */}
            {isModalOpen && <ManagePOModal poId={selectedPoId} onClose={handleCloseModal} />}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-text dark:text-dark-text">Purchase Orders</h1>
            </div>

            {loading && (
                <div className="text-center p-8">
                    <Loader2 size={32} className="mx-auto animate-spin text-primary" />
                    <p className="mt-4 text-text-secondary">Loading Purchase Orders...</p>
                </div>
            )}
            {error && <div className="p-6 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>}

            {!loading && !error && (
                <>
                    {purchaseOrders.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-lg">
                            <ClipboardList size={48} className="mx-auto text-text-secondary/50" />
                            <h3 className="mt-4 text-lg font-semibold">No Purchase Orders Found</h3>
                            <p className="text-text-secondary mt-1 text-sm">Create a PO from the "Incoming Requests" page to see it here.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {purchaseOrders.map((po) => (
                                <div key={po._id} className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-sm flex flex-col transition-shadow hover:shadow-lg">
                                    <div className="p-5 border-b border-border dark:border-dark-border">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-mono text-primary dark:text-dark-primary font-bold">{po.poId}</p>
                                                <h3 className="text-lg font-bold text-text dark:text-dark-text flex items-center gap-2">
                                                    <Factory size={18} /> {po.factory?.name || 'N/A'}
                                                </h3>
                                            </div>
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(po.status)}`}>
                                                {po.status}
                                            </span>
                                        </div>
                                        <div className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2 space-y-1">
                                            <p className="flex items-center gap-2"><Calendar size={12} /> Created: {format(new Date(po.createdAt), 'dd MMM, yyyy')}</p>
                                            <p className="flex items-center gap-2"><FileText size={12} /> Source: {po.sourceRestockRequest?.requestId || 'Manual PO'}</p>
                                        </div>
                                    </div>

                                    <div className="p-5 flex-grow">
                                        <h4 className="text-sm font-semibold mb-3 text-text dark:text-dark-text">Ordered Items</h4>
                                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                            {po.items.map((item, index) => {
                                                const totalBoxes = (item.palletsOrdered * po.packingRules.boxesPerPallet) + (item.khatlisOrdered * po.packingRules.boxesPerKhatli);
                                                return (
                                                    <div key={index} className="text-sm p-2 bg-background dark:bg-dark-background rounded-md flex justify-between items-center">
                                                        <span className="font-medium text-text-secondary dark:text-dark-text-secondary">{item.tile?.name || 'Unknown Tile'}</span>
                                                        <span className="font-bold text-text dark:text-dark-text flex items-center gap-1.5">
                                                            <Box size={14} /> {totalBoxes}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="p-3 bg-gray-50 dark:bg-dark-background/30 border-t border-border dark:border-dark-border text-right">
                                        {/* --- 5. CHANGE THE LINK TO A BUTTON THAT CALLS THE HANDLER --- */}
                                        <button onClick={() => handleManageClick(po._id)} className="font-semibold text-sm text-primary dark:text-dark-primary hover:underline">
                                            Manage PO
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default PurchaseOrderListPage;
