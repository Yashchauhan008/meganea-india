// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { useParams, useNavigate, useLocation } from 'react-router-dom';
// import { getRestockForWorkbench } from '../api/restockApi';
// import { getAllFactories } from '../api/factoryApi';
// import { createPurchaseOrder } from '../api/purchaseOrderApi';
// import { Loader2, CheckCircle, ClipboardList, ChevronLeft, PlusCircle, XCircle } from 'lucide-react';
// import Input from '../components/ui/Input';
// import Label from '../components/ui/Label';
// import Select from '../components/ui/Select';

// const CreatePurchaseOrderPage = () => {
//     const location = useLocation();
//     const navigate = useNavigate();
    
//     const initialRequest = location.state?.requestData;
//     const { restockId: paramId } = useParams();
//     const restockId = initialRequest?._id || paramId;

//     const [restockRequest, setRestockRequest] = useState(null);
//     const [factories, setFactories] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
    
//     const [selectedFactoryId, setSelectedFactoryId] = useState('');
//     const [packingRules, setPackingRules] = useState({ boxesPerPallet: 36, boxesPerKhatli: 28, palletsPerContainer: 26 });
//     const [poItems, setPoItems] = useState([]);
//     const [notes, setNotes] = useState('');
//     const [submitting, setSubmitting] = useState(false);

//     const fetchData = useCallback(async (id) => {
//         if (!id) {
//             setError('No restock request specified. Please navigate from the "Incoming Requests" page.');
//             setLoading(false);
//             return;
//         }
//         setLoading(true);
//         try {
//             const [restockRes, factoriesRes] = await Promise.all([
//                 getRestockForWorkbench(id),
//                 getAllFactories()
//             ]);
//             setRestockRequest(restockRes.data);
//             setFactories(factoriesRes.data);
//             setError('');
//         } catch (err) {
//             setError('Failed to load required data. Please go back and try again.');
//         } finally {
//             setLoading(false);
//         }
//     }, []);

//     useEffect(() => {
//         fetchData(restockId);
//     }, [restockId, fetchData]);

//     const availableTilesForFactory = useMemo(() => {
//         if (!restockRequest || !selectedFactoryId) return [];
        
//         const assignedTileIds = new Set(
//             restockRequest.requestedItems
//                 .filter(item => item.purchaseOrder)
//                 .map(item => item.tile._id)
//         );

//         return restockRequest.requestedItems.filter(item => {
//             const factories = item.tile.manufacturingFactories || [];
//             const isFactoryMatch = factories.some(factory => factory._id === selectedFactoryId);
//             const isNotAssigned = !assignedTileIds.has(item.tile._id);
            
//             return isFactoryMatch && isNotAssigned;
//         });
//     }, [restockRequest, selectedFactoryId]);

//     const handleAddTileToPO = (tile, quantityRequested) => {
//         if (poItems.some(item => item.tile._id === tile._id)) return;
//         setPoItems(prev => [...prev, { tile, quantityRequested, palletsOrdered: 0, khatlisOrdered: 0 }]);
//     };

//     const handleRemoveTileFromPO = (tileId) => {
//         setPoItems(prev => prev.filter(item => item.tile._id !== tileId));
//     };

//     const handleItemQuantityChange = (tileId, field, value) => {
//         const numValue = parseInt(value, 10) || 0;
//         setPoItems(prev => prev.map(item => item.tile._id === tileId ? { ...item, [field]: numValue } : item));
//     };

//     const resetForm = () => {
//         setSelectedFactoryId('');
//         setPoItems([]);
//         setNotes('');
//     };

//     const handleSubmitPO = async (e) => {
//         e.preventDefault();
//         setSubmitting(true);
//         setError('');
//         try {
//             const poData = {
//                 sourceRestockRequestId: restockRequest._id,
//                 factoryId: selectedFactoryId,
//                 packingRules,
//                 notes,
//                 items: poItems.map(item => ({ tileId: item.tile._id, palletsOrdered: item.palletsOrdered, khatlisOrdered: item.khatlisOrdered })),
//             };
//             await createPurchaseOrder(poData);
//             await fetchData(restockRequest._id);
//             resetForm();
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to create Purchase Order.');
//         } finally {
//             setSubmitting(false);
//         }
//     };

//     if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary" size={48} /></div>;
//     if (error || !restockRequest) return <div className="p-8 text-center text-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg">{error || 'Could not load restock request.'}</div>;

//     const allTilesAssigned = restockRequest?.requestedItems.every(item => item.purchaseOrder);

//     return (
//         <div className="p-4 sm:p-6 md:p-8">
//             <div className="flex items-center gap-4 mb-6">
//                 <button onClick={() => navigate('/restock-requests')} className="p-2 rounded-md hover:bg-background dark:hover:bg-dark-background"><ChevronLeft /></button>
//                 <div>
//                     <h1 className="text-3xl font-bold text-text dark:text-dark-text">Create Purchase Orders</h1>
//                     <p className="text-text-secondary dark:text-dark-text-secondary">From Restock Request: <span className="font-mono text-primary dark:text-dark-primary">{restockRequest?.requestId}</span></p>
//                 </div>
//             </div>

//             {allTilesAssigned && (
//                 <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-4 rounded-lg flex items-center gap-4 mb-6">
//                     <CheckCircle />
//                     <div>
//                         <h3 className="font-bold">All items assigned!</h3>
//                         <p className="text-sm">All tiles from the restock request have been assigned to a purchase order.</p>
//                     </div>
//                 </div>
//             )}

//             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
//                 <div className="lg:col-span-2 bg-foreground dark:bg-dark-foreground p-6 rounded-xl border border-border dark:border-dark-border">
//                     <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-text dark:text-dark-text"><ClipboardList /> Pending Items</h2>
//                     <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
//                         {restockRequest?.requestedItems.map(item => (
//                             <div key={item.tile._id} className={`p-3 rounded-lg border ${item.purchaseOrder ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-background dark:bg-dark-background border-border dark:border-dark-border'}`}>
//                                 <div className="flex justify-between items-start">
//                                     <div>
//                                         <p className="font-bold text-text dark:text-dark-text">{item.tile.name}</p>
//                                         <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{item.tile.size}</p>
//                                     </div>
//                                     {item.purchaseOrder ? (
//                                         <div className="text-right text-xs">
//                                             <p className="font-bold text-green-600 dark:text-green-400">Assigned</p>
//                                             <p className="font-mono text-text-secondary dark:text-dark-text-secondary">{item.purchaseOrder.poId}</p>
//                                         </div>
//                                     ) : (
//                                         <p className="font-bold text-lg text-primary dark:text-dark-primary">{item.quantityRequested} <span className="text-sm font-normal text-text-secondary dark:text-dark-text-secondary">boxes</span></p>
//                                     )}
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 <div className="lg:col-span-3 bg-foreground dark:bg-dark-foreground p-6 rounded-xl border border-border dark:border-dark-border">
//                     <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-text dark:text-dark-text"><PlusCircle /> New Purchase Order</h2>
//                     <form onSubmit={handleSubmitPO} className="space-y-6">
//                         <div>
//                             <Label htmlFor="factory">1. Select a Factory</Label>
//                             <Select id="factory" value={selectedFactoryId} onChange={e => setSelectedFactoryId(e.target.value)} required>
//                                 <option value="" disabled>Choose a factory...</option>
//                                 {factories.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
//                             </Select>
//                         </div>

//                         {selectedFactoryId && (
//                             <div>
//                                 <Label>2. Add Tiles for this Factory</Label>
//                                 <div className="p-3 bg-background dark:bg-dark-background rounded-lg space-y-2 max-h-48 overflow-y-auto">
//                                     {availableTilesForFactory.length > 0 ? availableTilesForFactory.map(item => (
//                                         <div key={item.tile._id} className="flex justify-between items-center">
//                                             <div>
//                                                 <p className="font-semibold text-text dark:text-dark-text">{item.tile.name}</p>
//                                                 <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Requested: {item.quantityRequested} boxes</p>
//                                             </div>
//                                             <button type="button" onClick={() => handleAddTileToPO(item.tile, item.quantityRequested)} className="text-sm font-semibold text-primary dark:text-dark-primary hover:underline">Add to PO</button>
//                                         </div>
//                                     )) : <p className="text-sm text-center text-text-secondary dark:text-dark-text-secondary py-4">No more tiles available for this factory in this request.</p>}
//                                 </div>
//                             </div>
//                         )}

//                         {poItems.length > 0 && (
//                             <>
//                                 <div>
//                                     <Label>3. Enter Packing & Order Details</Label>
//                                     <div className="grid grid-cols-3 gap-4 p-3 bg-background dark:bg-dark-background rounded-lg">
//                                         <div><Label htmlFor="boxesPerPallet">Boxes/Pallet</Label><Input type="number" id="boxesPerPallet" value={packingRules.boxesPerPallet} onChange={e => setPackingRules(p => ({...p, boxesPerPallet: e.target.value}))} /></div>
//                                         <div><Label htmlFor="boxesPerKhatli">Boxes/Khatli</Label><Input type="number" id="boxesPerKhatli" value={packingRules.boxesPerKhatli} onChange={e => setPackingRules(p => ({...p, boxesPerKhatli: e.target.value}))} /></div>
//                                         <div><Label htmlFor="palletsPerContainer">Pallets/Container</Label><Input type="number" id="palletsPerContainer" value={packingRules.palletsPerContainer} onChange={e => setPackingRules(p => ({...p, palletsPerContainer: e.target.value}))} /></div>
//                                     </div>
//                                 </div>

//                                 <div className="space-y-3">
//                                     {poItems.map(item => {
//                                         const totalBoxes = (item.palletsOrdered * packingRules.boxesPerPallet) + (item.khatlisOrdered * packingRules.boxesPerKhatli);
//                                         return (
//                                             // --- CHANGE #1: Removed conditional red border ---
//                                             <div key={item.tile._id} className="p-4 rounded-lg border border-border dark:border-dark-border relative">
//                                                 <button type="button" onClick={() => handleRemoveTileFromPO(item.tile._id)} className="absolute top-2 right-2 text-text-secondary hover:text-red-500 p-1"><XCircle size={16}/></button>
//                                                 <p className="font-bold text-text dark:text-dark-text">{item.tile.name}</p>
//                                                 <div className="grid grid-cols-3 gap-4 mt-2">
//                                                     <div><Label htmlFor={`pallets-${item.tile._id}`}>Pallets</Label><Input type="number" id={`pallets-${item.tile._id}`} value={item.palletsOrdered} onChange={e => handleItemQuantityChange(item.tile._id, 'palletsOrdered', e.target.value)} /></div>
//                                                     <div><Label htmlFor={`khatlis-${item.tile._id}`}>Khatlis</Label><Input type="number" id={`khatlis-${item.tile._id}`} value={item.khatlisOrdered} onChange={e => handleItemQuantityChange(item.tile._id, 'khatlisOrdered', e.target.value)} /></div>
//                                                     <div className="text-center">
//                                                         <Label>Total Boxes</Label>
//                                                         {/* --- CHANGE #2: Removed conditional red text color --- */}
//                                                         <p className="font-bold text-lg mt-2 text-text dark:text-dark-text">{totalBoxes}</p>
//                                                         <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Req: {item.quantityRequested}</p>
//                                                     </div>
//                                                 </div>
//                                                 {/* --- CHANGE #3: Removed the warning message --- */}
//                                             </div>
//                                         );
//                                     })}
//                                 </div>
//                             </>
//                         )}
//                         {error && <p className="text-red-500 text-sm">{error}</p>}
//                         <button type="submit" disabled={submitting || poItems.length === 0} className="w-full flex justify-center items-center gap-2 bg-primary text-white font-semibold py-3 rounded-md hover:bg-primary-hover disabled:opacity-50">
//                             {submitting ? <Loader2 className="animate-spin" /> : 'Create Purchase Order'}
//                         </button>
//                     </form>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default CreatePurchaseOrderPage;
// frontend/src/pages/CreatePurchaseOrderPage.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getRestockForWorkbench } from '../api/restockApi';
import { getAllFactories } from '../api/factoryApi';
import { createPurchaseOrder } from '../api/purchaseOrderApi';
import { Loader2, CheckCircle, ClipboardList, ChevronLeft, PlusCircle, XCircle } from 'lucide-react';
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
    const [packingRules, setPackingRules] = useState({ boxesPerPallet: 36, boxesPerKhatli: 28, palletsPerContainer: 26 });
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
        try {
            const [restockRes, factoriesRes] = await Promise.all([
                getRestockForWorkbench(id),
                getAllFactories()
            ]);
            setRestockRequest(restockRes.data);
            setFactories(factoriesRes.data);
            setError('');
        } catch (err) {
            setError('Failed to load required data. Please go back and try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData(restockId);
    }, [restockId, fetchData]);

    const availableTilesForFactory = useMemo(() => {
        if (!restockRequest || !selectedFactoryId) return [];
        
        return restockRequest.requestedItems.filter(item => {
            const isFactoryMatch = item.tile.manufacturingFactories?.some(factory => factory._id === selectedFactoryId);
            const isNotFullyAssigned = item.quantityInPO < item.quantityRequested;
            const isNotInCurrentPOForm = !poItems.some(poItem => poItem.tile._id === item.tile._id);
            return isFactoryMatch && isNotFullyAssigned && isNotInCurrentPOForm;
        });
    }, [restockRequest, selectedFactoryId, poItems]);

    const handleAddTileToPO = (tile, quantityRequested, quantityInPO) => {
        if (poItems.some(item => item.tile._id === tile._id)) return;
        const remainingQty = quantityRequested - quantityInPO;
        setPoItems(prev => [...prev, { tile, quantityRequested, remainingQty, palletsOrdered: 0, khatlisOrdered: 0 }]);
    };

    const handleRemoveTileFromPO = (tileId) => {
        setPoItems(prev => prev.filter(item => item.tile._id !== tileId));
    };

    const handleItemQuantityChange = (tileId, field, value) => {
        const numValue = parseInt(value, 10) || 0;
        setPoItems(prev => prev.map(item => item.tile._id === tileId ? { ...item, [field]: numValue } : item));
    };

    const resetForm = () => {
        setSelectedFactoryId('');
        setPoItems([]);
        setNotes('');
    };

    // --- THIS IS THE FINAL, CORRECTED SUBMIT HANDLER ---
    const handleSubmitPO = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');
        try {
            const poData = {
                sourceRestockRequestId: restockRequest._id,
                factoryId: selectedFactoryId,
                packingRules,
                notes,
                items: poItems.map(item => ({ tileId: item.tile._id, palletsOrdered: item.palletsOrdered, khatlisOrdered: item.khatlisOrdered })),
            };
            
            // The backend sends back the updated restockRequest object.
            const { data } = await createPurchaseOrder(poData);
            
            // *** THE CRUCIAL FIX ***
            // We explicitly update the state with the fresh data from the server.
            // This will cause the entire component to re-render with the correct "Pending" values.
            setRestockRequest(data.restockRequest);
            
            // Now, we reset the form for the next PO.
            resetForm();

        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create Purchase Order.');
        } finally {
            setSubmitting(false);
        }
    };
    // --- END OF CORRECTION ---

    if (loading && !restockRequest) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-primary" size={48} /></div>;
    if (error) return <div className="p-8 text-center text-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg">{error}</div>;
    if (!restockRequest) return <div className="p-8 text-center text-red-500 bg-red-100 dark:bg-red-900/30 rounded-lg">Could not load restock request.</div>;

    const allTilesAssigned = restockRequest.requestedItems.every(item => item.quantityInPO >= item.quantityRequested);

    return (
        <div className="p-4 sm:p-6 md:p-8">
            {submitting && <div className="fixed top-4 right-4 z-50"><Loader2 className="animate-spin text-primary" /></div>}

            <div className="flex items-center gap-4 mb-6">
                <button onClick={() => navigate('/restock-requests')} className="p-2 rounded-md hover:bg-background dark:hover:bg-dark-background"><ChevronLeft /></button>
                <div>
                    <h1 className="text-3xl font-bold text-text dark:text-dark-text">Create Purchase Orders</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">From Restock Request: <span className="font-mono text-primary dark:text-dark-primary">{restockRequest.requestId}</span></p>
                </div>
            </div>

            {allTilesAssigned && (
                <div className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 p-4 rounded-lg flex items-center gap-4 mb-6">
                    <CheckCircle />
                    <div>
                        <h3 className="font-bold">All items assigned!</h3>
                        <p className="text-sm">All tiles from the restock request have been assigned to a purchase order.</p>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 bg-foreground dark:bg-dark-foreground p-6 rounded-xl border border-border dark:border-dark-border">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-text dark:text-dark-text"><ClipboardList /> Pending Items</h2>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                        {restockRequest.requestedItems.map(item => {
                            const isFullyAssigned = item.quantityInPO >= item.quantityRequested;
                            const pendingQty = item.quantityRequested - item.quantityInPO;

                            return (
                                <div key={item.tile._id} className={`p-3 rounded-lg border ${isFullyAssigned ? 'bg-green-50 dark:bg-green-900/20 border-green-200' : 'bg-background dark:bg-dark-background border-border'}`}>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold text-text dark:text-dark-text">{item.tile.name}</p>
                                            <p className="text-sm text-text-secondary">{item.tile.size}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-lg text-primary">{item.quantityRequested} <span className="text-sm font-normal">boxes</span></p>
                                            <p className={`text-xs font-mono ${isFullyAssigned ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {isFullyAssigned ? 'Fully Assigned' : `Pending: ${pendingQty}`}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                                        <div 
                                            className={`h-1.5 rounded-full ${isFullyAssigned ? 'bg-green-500' : 'bg-yellow-500'}`} 
                                            style={{ width: `${(item.quantityInPO / item.quantityRequested) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="lg:col-span-3 bg-foreground dark:bg-dark-foreground p-6 rounded-xl border border-border dark:border-dark-border">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-text dark:text-dark-text"><PlusCircle /> New Purchase Order</h2>
                    <form onSubmit={handleSubmitPO} className="space-y-6">
                        <div>
                            <Label htmlFor="factory">1. Select a Factory</Label>
                            <Select id="factory" value={selectedFactoryId} onChange={e => setSelectedFactoryId(e.target.value)} required>
                                <option value="" disabled>Choose a factory...</option>
                                {factories.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                            </Select>
                        </div>

                        {selectedFactoryId && (
                            <div>
                                <Label>2. Add Tiles for this Factory</Label>
                                <div className="p-3 bg-background dark:bg-dark-background rounded-lg space-y-2 max-h-48 overflow-y-auto">
                                    {availableTilesForFactory.length > 0 ? availableTilesForFactory.map(item => (
                                        <div key={item.tile._id} className="flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-text dark:text-dark-text">{item.tile.name}</p>
                                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pending: {item.quantityRequested - item.quantityInPO} boxes</p>
                                            </div>
                                            <button type="button" onClick={() => handleAddTileToPO(item.tile, item.quantityRequested, item.quantityInPO)} className="text-sm font-semibold text-primary dark:text-dark-primary hover:underline">Add to PO</button>
                                        </div>
                                    )) : <p className="text-sm text-center text-text-secondary dark:text-dark-text-secondary py-4">No more tiles available for this factory in this request.</p>}
                                </div>
                            </div>
                        )}

                        {poItems.length > 0 && (
                            <>
                                <div>
                                    <Label>3. Enter Packing & Order Details</Label>
                                    <div className="grid grid-cols-3 gap-4 p-3 bg-background dark:bg-dark-background rounded-lg">
                                        <div><Label htmlFor="boxesPerPallet">Boxes/Pallet</Label><Input type="number" id="boxesPerPallet" value={packingRules.boxesPerPallet} onChange={e => setPackingRules(p => ({...p, boxesPerPallet: e.target.value}))} /></div>
                                        <div><Label htmlFor="boxesPerKhatli">Boxes/Khatli</Label><Input type="number" id="boxesPerKhatli" value={packingRules.boxesPerKhatli} onChange={e => setPackingRules(p => ({...p, boxesPerKhatli: e.target.value}))} /></div>
                                        <div><Label htmlFor="palletsPerContainer">Pallets/Container</Label><Input type="number" id="palletsPerContainer" value={packingRules.palletsPerContainer} onChange={e => setPackingRules(p => ({...p, palletsPerContainer: e.target.value}))} /></div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {poItems.map(item => {
                                        const totalBoxes = (item.palletsOrdered * packingRules.boxesPerPallet) + (item.khatlisOrdered * packingRules.boxesPerKhatli);
                                        const isOverAssigned = totalBoxes > item.remainingQty;
                                        return (
                                            <div key={item.tile._id} className={`p-4 rounded-lg border relative ${isOverAssigned ? 'border-red-500' : 'border-border dark:border-dark-border'}`}>
                                                <button type="button" onClick={() => handleRemoveTileFromPO(item.tile._id)} className="absolute top-2 right-2 text-text-secondary hover:text-red-500 p-1"><XCircle size={16}/></button>
                                                <p className="font-bold text-text dark:text-dark-text">{item.tile.name}</p>
                                                <div className="grid grid-cols-3 gap-4 mt-2">
                                                    <div><Label htmlFor={`pallets-${item.tile._id}`}>Pallets</Label><Input type="number" id={`pallets-${item.tile._id}`} value={item.palletsOrdered} onChange={e => handleItemQuantityChange(item.tile._id, 'palletsOrdered', e.target.value)} /></div>
                                                    <div><Label htmlFor={`khatlis-${item.tile._id}`}>Khatlis</Label><Input type="number" id={`khatlis-${item.tile._id}`} value={item.khatlisOrdered} onChange={e => handleItemQuantityChange(item.tile._id, 'khatlisOrdered', e.target.value)} /></div>
                                                    <div className="text-center">
                                                        <Label>Total Boxes</Label>
                                                        <p className={`font-bold text-lg mt-2 ${isOverAssigned ? 'text-red-500' : 'text-text dark:text-dark-text'}`}>{totalBoxes}</p>
                                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pending: {item.remainingQty}</p>
                                                    </div>
                                                </div>
                                                {isOverAssigned && <p className="text-xs text-red-500 mt-2">Warning: Quantity exceeds the pending amount for this request.</p>}
                                            </div>
                                        );
                                    })}
                                </div>
                            </>
                        )}
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button type="submit" disabled={submitting || poItems.length === 0} className="w-full flex justify-center items-center gap-2 bg-primary text-white font-semibold py-3 rounded-md hover:bg-primary-hover disabled:opacity-50">
                            {submitting ? <Loader2 className="animate-spin" /> : 'Create Purchase Order'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CreatePurchaseOrderPage;
