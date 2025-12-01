// frontend/src/pages/FactoryStockPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { getFactoryStock } from '../api/palletApi';
import { getAllPurchaseOrders } from '../api/purchaseOrderApi'; // <-- 1. Import PO API
import ManualAdjustmentModal from '../components/pallets/ManualAdjustmentModal'; // <-- 2. Import the new modal
import { Loader2, Warehouse, Box, Layers, Edit } from 'lucide-react';
import { useAuth } from '../hooks/useAuth'; // <-- 3. Import useAuth to check roles

const FactoryStockPage = () => {
    const { user } = useAuth(); // Get user to check if they are an admin
    const [factoryStock, setFactoryStock] = useState([]);
    const [allPOs, setAllPOs] = useState([]); // <-- 4. State to hold all POs
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the modal
    const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
    const [selectedTileForAdjustment, setSelectedTileForAdjustment] = useState(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            // Use Promise.all to fetch stock and POs concurrently
            const [stockRes, poRes] = await Promise.all([
                getFactoryStock(),
                user.role === 'admin' ? getAllPurchaseOrders() : Promise.resolve({ data: [] }) // Only fetch POs if admin
            ]);
            setFactoryStock(stockRes.data);
            setAllPOs(poRes.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch page data.');
        } finally {
            setLoading(false);
        }
    }, [user.role]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleOpenAdjustmentModal = (factory, tileData) => {
        setSelectedTileForAdjustment({ factory, tileData });
        setIsAdjustmentModalOpen(true);
    };

    const handleCloseAndRefresh = () => {
        setIsAdjustmentModalOpen(false);
        fetchData(); // Re-fetch all data to show the changes
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            {isAdjustmentModalOpen && (
                <ManualAdjustmentModal
                    factory={selectedTileForAdjustment.factory}
                    tileData={selectedTileForAdjustment.tileData}
                    allPOs={allPOs}
                    onClose={() => setIsAdjustmentModalOpen(false)}
                    onAdjust={handleCloseAndRefresh}
                />
            )}

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-text dark:text-dark-text">Factory Stock</h1>
                <p className="text-text-secondary">Live inventory of QC-passed goods.</p>
            </div>

            {loading && (
                <div className="text-center p-12">
                    <Loader2 size={48} className="mx-auto animate-spin text-primary" />
                    <p className="mt-4 text-text-secondary">Loading Inventory...</p>
                </div>
            )}

            {error && <div className="p-6 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>}

            {!loading && !error && (
                <div className="space-y-8">
                    {factoryStock.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-lg">
                            <Warehouse size={48} className="mx-auto text-text-secondary/50" />
                            <h3 className="mt-4 text-lg font-semibold">No Stock Found</h3>
                            <p className="text-text-secondary mt-1 text-sm">
                                Complete a Purchase Order's production to see stock here.
                            </p>
                        </div>
                    ) : (
                        factoryStock.map(({ factory, tiles }) => (
                            <div key={factory._id} className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-sm">
                                <div className="p-4 border-b border-border dark:border-dark-border">
                                    <h2 className="text-xl font-bold text-text dark:text-dark-text flex items-center gap-3">
                                        <Warehouse size={22} className="text-primary" />
                                        {factory.name}
                                    </h2>
                                </div>
                                <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {tiles.map((tileData) => (
                                        <div key={tileData.tile._id} className="bg-background dark:bg-dark-background p-4 rounded-lg border border-border dark:border-dark-border flex flex-col">
                                            <p className="font-bold text-text dark:text-dark-text">{tileData.tile.name}</p>
                                            <p className="text-sm text-text-secondary mb-3">{tileData.tile.size}</p>
                                            
                                            <div className="flex-grow flex items-end justify-between border-t border-border dark:border-dark-border pt-3">
                                                <div className="text-sm text-text-secondary space-y-1">
                                                    <p className="flex items-center gap-2"><Layers size={14} /> Pallets: <span className="font-semibold text-text dark:text-dark-text">{tileData.totalPallets}</span></p>
                                                    <p className="flex items-center gap-2"><Layers size={14} /> Khatlis: <span className="font-semibold text-text dark:text-dark-text">{tileData.totalKhatlis}</span></p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-text-secondary">Total Boxes</p>
                                                    <p className="text-2xl font-bold text-primary">{tileData.totalBoxes}</p>
                                                </div>
                                            </div>
                                            
                                            {/* --- 5. ADD THE MANUAL ADJUSTMENT BUTTON (ADMIN ONLY) --- */}
                                            {user.role === 'admin' && (
                                                <div className="border-t border-border dark:border-dark-border mt-3 pt-3">
                                                    <button onClick={() => handleOpenAdjustmentModal(factory, tileData)} className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-md py-1.5">
                                                        <Edit size={12} /> Manual Adjustment
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default FactoryStockPage;
