import React, { useState, useEffect } from 'react';
import { getLoadingPlanById, updateLoadingPlan, deleteLoadingPlan } from '../../api/loadingPlanApi';
import PalletSelectionModal from './PalletSelectionModal';
import { Loader2, X, Warehouse, Calendar, User, Truck, Box, Package, Tag, Ruler, Edit, Save, Trash2, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';

const LoadingPlanDetailModal = ({ planId, onClose }) => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editablePlan, setEditablePlan] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPalletModalOpen, setIsPalletModalOpen] = useState(false);
    const [selectedContainerIndex, setSelectedContainerIndex] = useState(null);

    const fetchPlan = async () => {
        if (!planId) return;
        setLoading(true);
        setError('');
        try {
            const { data } = await getLoadingPlanById(planId);
            setPlan(data);
            setEditablePlan(JSON.parse(JSON.stringify(data)));
        } catch (err) {
            setError('Failed to load loading plan details.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlan();
    }, [planId]);

    const handleContainerChange = (index, field, value) => {
        const updatedContainers = [...editablePlan.containers];
        updatedContainers[index][field] = value;
        setEditablePlan(prev => ({ ...prev, containers: updatedContainers }));
    };

    const handleDateChange = (e) => {
        setEditablePlan(prev => ({ ...prev, loadingDate: e.target.value }));
    };

    const handleOpenPalletModal = (index) => {
        setSelectedContainerIndex(index);
        setIsPalletModalOpen(true);
    };

    const handlePalletSelect = (selectedPallets) => {
        const updatedContainers = [...editablePlan.containers];
        updatedContainers[selectedContainerIndex].pallets = selectedPallets;
        setEditablePlan(prev => ({ ...prev, containers: updatedContainers }));
        setIsPalletModalOpen(false);
        setSelectedContainerIndex(null);
    };

    const getAllSelectedPallets = () => {
        if (!editablePlan) return [];
        return editablePlan.containers.flatMap(c => c.pallets.map(p => p._id));
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError('');
        try {
            const payload = { 
                containers: editablePlan.containers,
                loadingDate: editablePlan.loadingDate 
            };
            const { data } = await updateLoadingPlan(planId, payload);
            setPlan(data);
            setEditablePlan(JSON.parse(JSON.stringify(data)));
            setIsEditMode(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePlan = async () => {
        if (window.confirm('Are you sure you want to permanently delete this loading plan? This action cannot be undone and will revert all associated pallets to factory stock.')) {
            setIsSaving(true);
            try {
                await deleteLoadingPlan(planId);
                onClose();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete plan.');
                setIsSaving(false);
            }
        }
    };

    const formattedLoadingDateForInput = editablePlan?.loadingDate ? format(parseISO(editablePlan.loadingDate), 'yyyy-MM-dd') : '';

    return (
        <>
            {isPalletModalOpen && (
                <PalletSelectionModal
                    isOpen={isPalletModalOpen}
                    onClose={() => setIsPalletModalOpen(false)}
                    onSelect={handlePalletSelect}
                    factoryId={plan.factory._id}
                    currentlySelectedPallets={getAllSelectedPallets()}
                    currentContainerPallets={editablePlan.containers[selectedContainerIndex].pallets}
                />
            )}

            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    
                    <div className="flex justify-between items-center p-5 border-b border-border dark:border-dark-border flex-shrink-0">
                        <div>
                            <h1 className="text-2xl font-bold text-text dark:text-dark-text">Loading Plan Details</h1>
                            <p className="font-mono text-primary dark:text-dark-primary">{plan?.loadingPlanId || 'Loading...'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditMode ? (
                                <>
                                    <button onClick={() => setIsEditMode(false)} className="text-sm text-text-secondary px-3 py-1.5 rounded-md hover:bg-background dark:hover:bg-dark-background">Cancel</button>
                                    <button onClick={handleSaveChanges} disabled={isSaving} className="flex items-center gap-2 bg-green-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-green-700 disabled:opacity-50">
                                        {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleDeletePlan} disabled={isSaving} className="flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-red-700 disabled:opacity-50">
                                        <Trash2 size={16} />
                                    </button>
                                    <button onClick={() => setIsEditMode(true)} className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-blue-700">
                                        <Edit size={16} /> Edit Plan
                                    </button>
                                </>
                            )}
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background"><X size={24} className="text-text-secondary" /></button>
                        </div>
                    </div>

                    <div className="flex-grow overflow-y-auto p-6">
                        {loading && <div className="flex justify-center items-center h-full"><Loader2 size={32} className="animate-spin text-primary" /></div>}
                        {error && <div className="p-3 mb-4 text-red-700 bg-red-100 rounded-md flex items-center gap-2"><AlertTriangle size={16}/> {error}</div>}
                        
                        {plan && editablePlan && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
                                        <div className="text-sm text-text-secondary flex items-center gap-2"><Warehouse size={14}/> Factory</div>
                                        <div className="text-lg font-bold text-text dark:text-dark-text">{plan.factory?.name}</div>
                                    </div>
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
                                        <div className="text-sm text-text-secondary flex items-center gap-2"><Calendar size={14}/> Loading Date</div>
                                        {isEditMode ? (
                                            <input type="date" value={formattedLoadingDateForInput} onChange={handleDateChange} className="form-input p-1 mt-1 w-full"/>
                                        ) : (
                                            <div className="text-lg font-bold text-text dark:text-dark-text">{plan.loadingDate ? format(parseISO(plan.loadingDate), 'dd MMM, yyyy') : 'N/A'}</div>
                                        )}
                                    </div>
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
                                        <div className="text-sm text-text-secondary flex items-center gap-2"><User size={14}/> Created By</div>
                                        <div className="text-lg font-bold text-text dark:text-dark-text">{plan.createdBy?.name}</div>
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-xl font-semibold mb-3 text-text dark:text-dark-text">Containers ({isEditMode ? editablePlan.containers.length : plan.containers.length})</h2>
                                    <div className="space-y-4">
                                        {(isEditMode ? editablePlan.containers : plan.containers).map((container, index) => (
                                            <div key={container._id} className="border border-border dark:border-dark-border rounded-lg">
                                                <div className="p-3 bg-background dark:bg-dark-background rounded-t-lg">
                                                    {isEditMode ? (
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <input type="text" value={container.containerNumber} onChange={(e) => handleContainerChange(index, 'containerNumber', e.target.value.toUpperCase())} className="form-input" placeholder="Container Number"/>
                                                            <input type="text" value={container.truckNumber} onChange={(e) => handleContainerChange(index, 'truckNumber', e.target.value.toUpperCase())} className="form-input" placeholder="Truck Number"/>
                                                        </div>
                                                    ) : (
                                                        <div className="flex justify-between items-center">
                                                            <h3 className="font-bold text-md text-primary flex items-center gap-2"><Truck size={18}/> {container.containerNumber}</h3>
                                                            <p className="text-xs text-text-secondary">Truck: {container.truckNumber}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-3">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <h4 className="text-sm font-semibold flex items-center gap-2"><Package size={16}/> Pallets ({container.pallets.length})</h4>
                                                        {isEditMode && (
                                                            <button onClick={() => handleOpenPalletModal(index)} className="text-xs font-semibold text-blue-600 hover:underline">Manage Pallets</button>
                                                        )}
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                                                        {container.pallets.map(pallet => (
                                                            <div key={pallet._id} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-md text-left" title={`${pallet.palletId} - ${pallet.tile?.name}`}>
                                                                <div className="flex justify-between items-center font-mono text-xs font-semibold text-text dark:text-dark-text">
                                                                    <span className="flex items-center gap-1"><Tag size={12}/> {pallet.palletId}</span>
                                                                    <span className="flex items-center gap-1">{pallet.boxCount} <Box size={12}/></span>
                                                                </div>
                                                                <p className="text-xs text-text-secondary truncate mt-1">{pallet.tile?.name || 'N/A'}</p>
                                                                <p className="text-xs text-text-secondary/70 flex items-center gap-1 mt-1">
                                                                    <Ruler size={12}/> {pallet.tile?.size || 'N/A'}
                                                                </p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default LoadingPlanDetailModal;
