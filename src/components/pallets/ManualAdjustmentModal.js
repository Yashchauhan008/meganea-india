import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { createManualPallet, deletePallet, getPalletDetailsForTile, updatePalletBoxCount } from '../../api/palletApi';
import { Loader2, X, Trash2, PlusCircle, AlertTriangle, Info, Package, Archive, ChevronDown, ChevronUp, Edit } from 'lucide-react';

// This sub-component renders a single group of identical pallets.
const PalletGroup = ({ group, onDelete, onEdit }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="bg-foreground dark:bg-dark-foreground/50 rounded-lg animate-fade-in">
            <div 
                className="flex items-center justify-between p-3 cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <Package size={20} className="text-primary flex-shrink-0" />
                    <div>
                        <p className="font-semibold text-text dark:text-dark-text">{group.type} - {group.boxCount} boxes</p>
                        <p className="text-xs text-text-secondary">
                            <span className="font-bold text-primary">{group.count}</span> {group.count > 1 ? 'units' : 'unit'} from PO: {group.poId}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-text-secondary">
                    {group.isManual && <div className="text-xs font-semibold text-yellow-500 flex items-center gap-1" title="Manually Added"><AlertTriangle size={12}/> Manual</div>}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
            </div>
            {isExpanded && (
                <div className="px-3 pb-3">
                    <div className="border-t border-border dark:border-dark-border pt-2 space-y-1">
                        <p className="text-xs font-bold text-text-secondary px-2">Individual Pallet IDs:</p>
                        {group.pallets.map(pallet => (
                            <div key={pallet._id} className="flex items-center justify-between text-sm p-2 rounded-md hover:bg-background dark:hover:bg-dark-background">
                                <span className="text-text-secondary">{pallet.palletId}</span>
                                {/* --- THIS IS THE FIX --- */}
                                <div className="flex items-center gap-2">
                                    {/* The "Edit" button is now added here */}
                                    <button onClick={() => onEdit(pallet._id, pallet.boxCount)} className="p-1 text-blue-500 hover:bg-blue-100 dark:hover:bg-blue-500/20 rounded-full" title={`Edit ${pallet.palletId}`}>
                                        <Edit size={14} />
                                    </button>
                                    <button onClick={() => onDelete(pallet._id)} className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20 rounded-full" title={`Delete ${pallet.palletId}`}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};


// This is the main modal component.
const ManualAdjustmentModal = ({ factory, tileData, allPOs, onClose, onAdjust }) => {
    const [pallets, setPallets] = useState([]);
    const [listLoading, setListLoading] = useState(true);
    const [listError, setListError] = useState('');
    const [formError, setFormError] = useState('');
    const [newPalletType, setNewPalletType] = useState('Pallet');
    const [newPalletBoxes, setNewPalletBoxes] = useState('');
    const [selectedPoId, setSelectedPoId] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPalletDetails = useCallback(async () => {
        setListLoading(true);
        setListError('');
        try {
            const { data } = await getPalletDetailsForTile(factory._id, tileData.tile._id);
            setPallets(data);
        } catch (err) {
            setListError(err.response?.data?.message || 'An unexpected error occurred while fetching pallet details.');
        } finally {
            setListLoading(false);
        }
    }, [factory._id, tileData.tile._id]);

    useEffect(() => {
        fetchPalletDetails();
    }, [fetchPalletDetails]);

    const relevantPOs = useMemo(() => {
        if (!allPOs) return [];
        return allPOs.filter(po => po.factory._id === factory._id);
    }, [allPOs, factory._id]);

    const groupedPallets = useMemo(() => {
        const groups = {};
        pallets.forEach(p => {
            const poId = p.sourcePurchaseOrder?.poId || 'N/A';
            const key = `${p.type}-${p.boxCount}-${poId}-${p.isManualAdjustment}`;
            if (!groups[key]) {
                groups[key] = {
                    type: p.type,
                    boxCount: p.boxCount,
                    poId: poId,
                    isManual: p.isManualAdjustment,
                    count: 0,
                    pallets: []
                };
            }
            groups[key].count++;
            groups[key].pallets.push(p);
        });
        return Object.values(groups);
    }, [pallets]);

    const handleAddPallet = async (e) => {
        e.preventDefault();
        if (!selectedPoId || !newPalletBoxes || newPalletBoxes <= 0) {
            setFormError('Please select a source PO and enter a valid box count.');
            return;
        }
        setFormError('');
        setIsSubmitting(true);
        try {
            const palletPayload = { factoryId: factory._id, tileId: tileData.tile._id, poId: selectedPoId, type: newPalletType, boxCount: Number(newPalletBoxes) };
            await createManualPallet(palletPayload);
            setNewPalletBoxes('');
            setNewPalletType('Pallet');
            fetchPalletDetails();
            onAdjust();
        } catch (err) {
            setFormError(err.response?.data?.message || 'Failed to add pallet.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditPallet = async (palletId, currentBoxCount) => {
        const newBoxCountStr = prompt(`Enter the new box count for this pallet. The current count is ${currentBoxCount}.`);
        if (newBoxCountStr === null) return;

        const newBoxCount = Number(newBoxCountStr);
        if (isNaN(newBoxCount) || newBoxCount <= 0) {
            alert('Invalid input. Please enter a positive number for the box count.');
            return;
        }

        try {
            await updatePalletBoxCount(palletId, newBoxCount);
            fetchPalletDetails();
            onAdjust();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to update pallet.');
        }
    };

    const handleDeletePallet = async (palletId) => {
        if (!window.confirm('Are you sure you want to delete this pallet? This action will permanently remove the pallet and adjust the tile stock. It cannot be undone.')) return;
        try {
            await deletePallet(palletId);
            fetchPalletDetails();
            onAdjust();
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to delete pallet.');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-border dark:border-dark-border">
                    <div>
                        <h1 className="text-2xl font-bold text-text dark:text-dark-text">Manual Adjustment</h1>
                        <p className="text-primary dark:text-dark-primary font-semibold">{tileData.tile.name} <span className="text-text-secondary font-normal">at</span> {factory.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background"><X size={24} className="text-text-secondary" /></button>
                </div>

                <div className="flex-grow overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-x-8">
                    <div className="flex flex-col space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2 text-text dark:text-dark-text"><PlusCircle size={20} /> Add a Non-Standard Pallet</h3>
                        <div className="p-4 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border space-y-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 rounded-md text-sm flex items-start gap-3">
                                <Info size={18} className="flex-shrink-0 mt-0.5" />
                                <div>Use this form to add a pallet that was missed or has a non-standard box count.</div>
                            </div>
                            <form onSubmit={handleAddPallet} className="space-y-4">
                                <div>
                                    <label className="form-label">Source Purchase Order*</label>
                                    <select value={selectedPoId} onChange={e => setSelectedPoId(e.target.value)} className="form-select">
                                        <option value="" disabled>Select a PO...</option>
                                        {relevantPOs.map(po => (<option key={po._id} value={po._id}>{po.poId}</option>))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div><label className="form-label">Type*</label><select value={newPalletType} onChange={e => setNewPalletType(e.target.value)} className="form-select"><option>Pallet</option><option>Khatli</option></select></div>
                                    <div><label className="form-label">Box Count*</label><input type="number" value={newPalletBoxes} onChange={e => setNewPalletBoxes(e.target.value)} className="form-input" placeholder={`e.g., ${tileData.tile.packing?.pallet || 30}`} /></div>
                                </div>
                                {formError && <p className="text-sm text-red-500 dark:text-red-400">{formError}</p>}
                                <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 bg-primary text-white font-semibold py-2 rounded-md hover:bg-primary-hover disabled:opacity-50">{isSubmitting ? <Loader2 className="animate-spin" /> : 'Add Pallet to Stock'}</button>
                            </form>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <h3 className="font-bold text-lg text-text dark:text-dark-text">Existing Pallets in Stock</h3>
                        <div className="flex-grow p-4 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border">
                            <div className="space-y-3 h-full max-h-96 overflow-y-auto pr-2">
                                {listLoading ? <div className="flex flex-col items-center justify-center h-full text-text-secondary"><Loader2 size={24} className="animate-spin text-primary" /><p className="mt-2">Loading Pallets...</p></div>
                                : listError ? <div className="flex flex-col items-center justify-center h-full text-red-500 dark:text-red-400 text-center"><AlertTriangle size={24} /><p className="mt-2 font-semibold">Failed to Load</p><p className="text-sm">{listError}</p></div>
                                : groupedPallets.length > 0 ? (
                                    groupedPallets.map(group => (
                                        <PalletGroup key={`${group.type}-${group.boxCount}-${group.poId}`} group={group} onDelete={handleDeletePallet} onEdit={handleEditPallet} />
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-text-secondary text-center"><Archive size={24} /><p className="mt-2 font-semibold">No Pallets Found</p><p className="text-sm">There are no individual pallets in stock for this tile.</p></div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 text-sm font-semibold text-text-secondary rounded-md bg-foreground dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-dark-border/50">Done</button>
                </div>
            </div>
        </div>
    );
};

export default ManualAdjustmentModal;
