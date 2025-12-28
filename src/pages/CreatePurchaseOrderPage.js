// FILE LOCATION: src/pages/CreatePurchaseOrderPage.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestockForWorkbench } from '../api/restockApi';
import { getAllFactories } from '../api/factoryApi';
import { createPurchaseOrder } from '../api/purchaseOrderApi';
import { 
    Loader2, CheckCircle, ClipboardList, ChevronLeft, PlusCircle, XCircle,
    AlertCircle, RefreshCw, ArrowLeft, Package, Boxes
} from 'lucide-react';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import Select from '../components/ui/Select';

const CreatePurchaseOrderPage = () => {
    const navigate = useNavigate();
    const { restockId } = useParams();

    const [restockRequest, setRestockRequest] = useState(null);
    const [factories, setFactories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [selectedFactoryId, setSelectedFactoryId] = useState('');
    const [packingRules, setPackingRules] = useState({ 
        boxesPerPallet: 36, 
        boxesPerKhatli: 28, 
        palletsPerContainer: 26 
    });
    const [poItems, setPoItems] = useState([]);
    const [notes, setNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = useCallback(async (id) => {
        if (!id) {
            setError('No restock request specified. Please navigate from the "Incoming Requests" page.');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError('');
        try {
            const [restockRes, factoriesRes] = await Promise.all([
                getRestockForWorkbench(id),
                getAllFactories()
            ]);
            
            // Handle different response structures safely
            const restockData = restockRes?.data || restockRes;
            const factoriesData = factoriesRes?.data || factoriesRes || [];
            
            if (!restockData) {
                throw new Error('Restock request not found');
            }
            
            // Ensure requestedItems is always an array
            if (!restockData.requestedItems) {
                restockData.requestedItems = [];
            }
            
            setRestockRequest(restockData);
            setFactories(Array.isArray(factoriesData) ? factoriesData : []);
        } catch (err) {
            console.error('Failed to load data:', err);
            setError(err.response?.data?.message || err.message || 'Failed to load required data. Please go back and try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(restockId);
    }, [restockId, fetchData]);

    // Calculate available tiles for selected factory
    const availableTilesForFactory = useMemo(() => {
        if (!restockRequest?.requestedItems || !selectedFactoryId) return [];
        
        return restockRequest.requestedItems.filter(item => {
            if (!item?.tile) return false;
            const isFactoryMatch = item.tile.manufacturingFactories?.some(
                factory => factory?._id === selectedFactoryId
            );
            // Allow adding to a PO even if it's fully assigned, to enable over-provisioning
            const isNotInCurrentPOForm = !poItems.some(poItem => poItem.tile?._id === item.tile._id);
            return isFactoryMatch && isNotInCurrentPOForm;
        });
    }, [restockRequest, selectedFactoryId, poItems]);

    const handleAddTileToPO = (tile, quantityRequested, quantityInPO = 0) => {
        if (!tile?._id) return;
        if (poItems.some(item => item.tile?._id === tile._id)) return;
        const remainingQty = (quantityRequested || 0) - (quantityInPO || 0);
        setPoItems(prev => [...prev, { 
            tile, 
            quantityRequested: quantityRequested || 0, 
            remainingQty: Math.max(0, remainingQty), 
            palletsOrdered: 0, 
            khatlisOrdered: 0 
        }]);
    };

    const handleRemoveTileFromPO = (tileId) => {
        setPoItems(prev => prev.filter(item => item.tile?._id !== tileId));
    };

    const handleItemQuantityChange = (tileId, field, value) => {
        const numValue = Math.max(0, parseInt(value, 10) || 0);
        setPoItems(prev => prev.map(item => 
            item.tile?._id === tileId ? { ...item, [field]: numValue } : item
        ));
    };

    const resetForm = () => {
        setSelectedFactoryId('');
        setPoItems([]);
        setNotes('');
    };

    const handleSubmitPO = async (e) => {
        e.preventDefault();
        if (!restockRequest?._id || poItems.length === 0) return;
        
        setSubmitting(true);
        setError('');
        try {
            const poData = {
                sourceRestockRequestId: restockRequest._id,
                factoryId: selectedFactoryId,
                packingRules,
                notes,
                items: poItems.map(item => ({ 
                    tileId: item.tile._id, 
                    palletsOrdered: item.palletsOrdered, 
                    khatlisOrdered: item.khatlisOrdered 
                })),
            };
            
            const response = await createPurchaseOrder(poData);
            const updatedRestock = response?.data?.restockRequest || response?.restockRequest;
            
            if (updatedRestock) {
                // Ensure requestedItems is always an array
                if (!updatedRestock.requestedItems) {
                    updatedRestock.requestedItems = [];
                }
                setRestockRequest(updatedRestock);
            } else {
                // Refetch if we don't get updated data
                await fetchData(restockId);
            }
            resetForm();

        } catch (err) {
            console.error('Failed to create PO:', err);
            setError(err.response?.data?.message || err.message || 'Failed to create Purchase Order.');
        } finally {
            setSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-[60vh] gap-4">
                <Loader2 className="animate-spin text-primary" size={48} />
                <p className="text-text-secondary dark:text-dark-text-secondary">Loading restock request...</p>
            </div>
        );
    }

    // Error state
    if (error || !restockRequest) {
        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="max-w-lg mx-auto">
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-center">
                        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
                        <h2 className="text-xl font-bold text-red-700 dark:text-red-300 mb-2">
                            Failed to Load Data
                        </h2>
                        <p className="text-red-600 dark:text-red-400 mb-4">
                            {error || 'Could not load restock request.'}
                        </p>
                        <div className="flex justify-center gap-3">
                            <button 
                                onClick={() => navigate('/restock-requests')}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-text dark:text-dark-text rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 flex items-center gap-2"
                            >
                                <ArrowLeft size={18} /> Go Back
                            </button>
                            <button 
                                onClick={() => fetchData(restockId)}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover flex items-center gap-2"
                            >
                                <RefreshCw size={18} /> Retry
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Safe access to requestedItems
    const requestedItems = restockRequest.requestedItems || [];
    const allTilesAssigned = requestedItems.length > 0 && requestedItems.every(
        item => (item?.quantityInPO || 0) >= (item?.quantityRequested || 0)
    );

    return (
        <div className="p-4 sm:p-6 md:p-8">
            {submitting && (
                <div className="fixed top-4 right-4 z-50 bg-foreground dark:bg-dark-foreground p-3 rounded-lg shadow-lg flex items-center gap-2">
                    <Loader2 className="animate-spin text-primary" size={20} />
                    <span className="text-sm text-text dark:text-dark-text">Creating PO...</span>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button 
                    onClick={() => navigate('/restock-requests')} 
                    className="p-2 rounded-lg hover:bg-background dark:hover:bg-dark-background transition-colors"
                >
                    <ChevronLeft size={24} className="text-text dark:text-dark-text" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-text dark:text-dark-text">Create Purchase Orders</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">
                        From Restock Request: <span className="font-mono text-primary dark:text-dark-primary font-bold">{restockRequest.requestId}</span>
                    </p>
                </div>
            </div>

            {/* All Assigned Banner */}
            {allTilesAssigned && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-4 rounded-xl flex items-center gap-4 mb-6 border border-green-200 dark:border-green-800">
                    <CheckCircle size={24} />
                    <div>
                        <h3 className="font-bold">All items fulfilled!</h3>
                        <p className="text-sm">All tiles from the restock request have been assigned to purchase orders.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                {/* Left Panel: Pending Items */}
                <div className="lg:col-span-2 bg-foreground dark:bg-dark-foreground p-6 rounded-xl border border-border dark:border-dark-border">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-text dark:text-dark-text">
                        <ClipboardList className="text-primary" /> Pending Items
                    </h2>
                    
                    {requestedItems.length === 0 ? (
                        <div className="text-center py-8">
                            <Boxes size={40} className="mx-auto text-text-secondary/30 mb-3" />
                            <p className="text-text-secondary dark:text-dark-text-secondary">No items in this request</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                            {requestedItems.map((item, index) => {
                                if (!item?.tile) return null;
                                
                                const quantityRequested = item.quantityRequested || 0;
                                const quantityInPO = item.quantityInPO || 0;
                                const isOverAssigned = quantityInPO > quantityRequested;
                                const isExactlyAssigned = quantityInPO === quantityRequested;
                                const pendingQty = quantityRequested - quantityInPO;
                                
                                let statusText;
                                let statusColor;
                                let progressWidth;

                                if (isOverAssigned) {
                                    statusText = `Assigned: ${quantityInPO}`;
                                    statusColor = 'text-blue-600 dark:text-blue-400';
                                    progressWidth = 100;
                                } else if (isExactlyAssigned) {
                                    statusText = 'Fully Assigned';
                                    statusColor = 'text-green-600 dark:text-green-400';
                                    progressWidth = 100;
                                } else {
                                    statusText = `Pending: ${pendingQty}`;
                                    statusColor = 'text-yellow-600 dark:text-yellow-400';
                                    progressWidth = quantityRequested > 0 ? (quantityInPO / quantityRequested) * 100 : 0;
                                }

                                return (
                                    <div 
                                        key={item.tile._id || index} 
                                        className={`p-3 rounded-lg border transition-colors ${
                                            isExactlyAssigned || isOverAssigned 
                                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' 
                                                : 'bg-background dark:bg-dark-background border-border dark:border-dark-border'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="font-bold text-text dark:text-dark-text">
                                                    {item.tile.name || 'Unknown Tile'}
                                                </p>
                                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                                                    {item.tile.size || 'N/A'}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-lg text-primary dark:text-dark-primary">
                                                    {quantityRequested} <span className="text-sm font-normal">boxes</span>
                                                </p>
                                                <p className={`text-xs font-mono ${statusColor}`}>
                                                    {statusText}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                                            <div 
                                                className={`h-1.5 rounded-full transition-all ${
                                                    isOverAssigned ? 'bg-blue-500' : (isExactlyAssigned ? 'bg-green-500' : 'bg-yellow-500')
                                                }`} 
                                                style={{ width: `${Math.min(progressWidth, 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Panel: New Purchase Order Form */}
                <div className="lg:col-span-3 bg-foreground dark:bg-dark-foreground p-6 rounded-xl border border-border dark:border-dark-border">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-text dark:text-dark-text">
                        <PlusCircle className="text-primary" /> New Purchase Order
                    </h2>
                    
                    <form onSubmit={handleSubmitPO} className="space-y-6">
                        {/* Step 1: Select Factory */}
                        <div>
                            <Label htmlFor="factory">1. Select a Factory</Label>
                            <Select 
                                id="factory" 
                                value={selectedFactoryId} 
                                onChange={e => setSelectedFactoryId(e.target.value)} 
                                required
                            >
                                <option value="" disabled>Choose a factory...</option>
                                {factories.map(f => (
                                    <option key={f._id} value={f._id}>{f.name}</option>
                                ))}
                            </Select>
                        </div>

                        {/* Step 2: Add Tiles */}
                        {selectedFactoryId && (
                            <div>
                                <Label>2. Add Tiles for this Factory</Label>
                                <div className="p-3 bg-background dark:bg-dark-background rounded-lg space-y-2 max-h-48 overflow-y-auto">
                                    {availableTilesForFactory.length > 0 ? (
                                        availableTilesForFactory.map((item, index) => {
                                            if (!item?.tile) return null;
                                            const pendingQty = (item.quantityRequested || 0) - (item.quantityInPO || 0);
                                            return (
                                                <div key={item.tile._id || index} className="flex justify-between items-center">
                                                    <div>
                                                        <p className="font-semibold text-text dark:text-dark-text">
                                                            {item.tile.name || 'Unknown'}
                                                        </p>
                                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                                                            Pending: {pendingQty} boxes
                                                        </p>
                                                    </div>
                                                    <button 
                                                        type="button" 
                                                        onClick={() => handleAddTileToPO(item.tile, item.quantityRequested, item.quantityInPO)} 
                                                        className="text-sm font-semibold text-primary dark:text-dark-primary hover:underline"
                                                    >
                                                        Add to PO
                                                    </button>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <p className="text-sm text-center text-text-secondary dark:text-dark-text-secondary py-4">
                                            No more tiles available for this factory in this request.
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Step 3: Packing Details */}
                        {poItems.length > 0 && (
                            <>
                                <div>
                                    <Label>3. Enter Packing & Order Details</Label>
                                    <div className="grid grid-cols-3 gap-4 p-3 bg-background dark:bg-dark-background rounded-lg">
                                        <div>
                                            <Label htmlFor="boxesPerPallet">Boxes/Pallet</Label>
                                            <Input 
                                                type="number" 
                                                id="boxesPerPallet" 
                                                value={packingRules.boxesPerPallet} 
                                                onChange={e => setPackingRules(p => ({...p, boxesPerPallet: parseInt(e.target.value) || 0}))} 
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="boxesPerKhatli">Boxes/Khatli</Label>
                                            <Input 
                                                type="number" 
                                                id="boxesPerKhatli" 
                                                value={packingRules.boxesPerKhatli} 
                                                onChange={e => setPackingRules(p => ({...p, boxesPerKhatli: parseInt(e.target.value) || 0}))} 
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="palletsPerContainer">Pallets/Container</Label>
                                            <Input 
                                                type="number" 
                                                id="palletsPerContainer" 
                                                value={packingRules.palletsPerContainer} 
                                                onChange={e => setPackingRules(p => ({...p, palletsPerContainer: parseInt(e.target.value) || 0}))} 
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* PO Items */}
                                <div className="space-y-3">
                                    {poItems.map((item, index) => {
                                        if (!item?.tile) return null;
                                        const totalBoxes = (item.palletsOrdered * (packingRules.boxesPerPallet || 0)) + 
                                                          (item.khatlisOrdered * (packingRules.boxesPerKhatli || 0));
                                        const isOverAssigned = totalBoxes > (item.remainingQty || 0);
                                        
                                        return (
                                            <div 
                                                key={item.tile._id || index} 
                                                className={`p-4 rounded-lg border relative ${
                                                    isOverAssigned 
                                                        ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/10' 
                                                        : 'border-border dark:border-dark-border'
                                                }`}
                                            >
                                                <button 
                                                    type="button" 
                                                    onClick={() => handleRemoveTileFromPO(item.tile._id)} 
                                                    className="absolute top-2 right-2 text-text-secondary hover:text-red-500 p-1 transition-colors"
                                                >
                                                    <XCircle size={16}/>
                                                </button>
                                                <p className="font-bold text-text dark:text-dark-text">{item.tile.name}</p>
                                                <div className="grid grid-cols-3 gap-4 mt-2">
                                                    <div>
                                                        <Label htmlFor={`pallets-${item.tile._id}`}>Pallets</Label>
                                                        <Input 
                                                            type="number" 
                                                            id={`pallets-${item.tile._id}`} 
                                                            min="0"
                                                            value={item.palletsOrdered} 
                                                            onChange={e => handleItemQuantityChange(item.tile._id, 'palletsOrdered', e.target.value)} 
                                                        />
                                                    </div>
                                                    <div>
                                                        <Label htmlFor={`khatlis-${item.tile._id}`}>Khatlis</Label>
                                                        <Input 
                                                            type="number" 
                                                            id={`khatlis-${item.tile._id}`} 
                                                            min="0"
                                                            value={item.khatlisOrdered} 
                                                            onChange={e => handleItemQuantityChange(item.tile._id, 'khatlisOrdered', e.target.value)} 
                                                        />
                                                    </div>
                                                    <div className="text-center">
                                                        <Label>Total Boxes</Label>
                                                        <p className={`font-bold text-lg mt-2 ${
                                                            isOverAssigned ? 'text-yellow-600' : 'text-text dark:text-dark-text'
                                                        }`}>
                                                            {totalBoxes}
                                                        </p>
                                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                                                            Pending: {item.remainingQty || 0}
                                                        </p>
                                                    </div>
                                                </div>
                                                {isOverAssigned && (
                                                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-2">
                                                        ⚠️ Note: This quantity exceeds the pending amount for this request.
                                                    </p>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* Notes */}
                                <div>
                                    <Label htmlFor="notes">Notes (Optional)</Label>
                                    <textarea
                                        id="notes"
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                                        rows={2}
                                        placeholder="Any additional notes..."
                                    />
                                </div>
                            </>
                        )}

                        {/* Error Display */}
                        {error && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={16} />
                                {error}
                            </div>
                        )}

                        {/* Submit Button */}
                        <button 
                            type="submit" 
                            disabled={submitting || poItems.length === 0} 
                            className="w-full flex justify-center items-center gap-2 bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <Package size={20} />
                                    Create Purchase Order
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePurchaseOrderPage;