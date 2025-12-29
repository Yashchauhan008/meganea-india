// FILE LOCATION: src/components/loading-plans/LoadingPlanDetailModal.js

import React, { useState, useEffect, useMemo } from 'react';
import { getLoadingPlanById, updateLoadingPlan, deleteLoadingPlan } from '../../api/loadingPlanApi';
import PalletSelectionModal from './PalletSelectionModal';
import { 
    Loader2, X, Warehouse, Calendar, User, Truck, Box, Package, Edit, Save, 
    Trash2, AlertTriangle, Boxes, Ruler, Layers, FileText, Clock, CheckCircle,
    XCircle, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

// Aggregation logic for displaying pallets/khatlis grouped by tile and box count
const aggregateContainerItems = (pallets) => {
    if (!pallets || pallets.length === 0) return { pallets: [], khatlis: [] };
    
    const palletGroups = {};
    const khatliGroups = {};
    
    pallets.forEach(item => {
        if (!item || !item.tile) return;
        const type = item.type || 'Pallet';
        const targetGroup = type === 'Pallet' ? palletGroups : khatliGroups;
        const key = `${item.tile._id}-${item.boxCount}`;
        
        if (!targetGroup[key]) {
            targetGroup[key] = {
                tile: item.tile,
                boxCount: item.boxCount,
                count: 0,
                items: []
            };
        }
        targetGroup[key].count++;
        targetGroup[key].items.push(item);
    });
    
    return {
        pallets: Object.values(palletGroups).sort((a, b) => a.tile.name.localeCompare(b.tile.name)),
        khatlis: Object.values(khatliGroups).sort((a, b) => a.tile.name.localeCompare(b.tile.name))
    };
};

const LoadingPlanDetailModal = ({ planId, onClose }) => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);
    const [editablePlan, setEditablePlan] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isPalletModalOpen, setIsPalletModalOpen] = useState(false);
    const [selectedContainerIndex, setSelectedContainerIndex] = useState(null);
    const [expandedContainers, setExpandedContainers] = useState({});

    useEffect(() => {
        const fetchPlan = async () => {
            if (!planId) return;
            setLoading(true);
            setError('');
            try {
                const response = await getLoadingPlanById(planId);
                const data = response?.data || response;
                setPlan(data);
                setEditablePlan(JSON.parse(JSON.stringify(data)));
                // Expand first container by default
                if (data?.containers?.length > 0) {
                    setExpandedContainers({ 0: true });
                }
            } catch (err) {
                setError('Failed to load loading plan details.');
            } finally {
                setLoading(false);
            }
        };
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

    const handlePalletSelect = (finalSelectedPallets) => {
        const updatedContainers = [...editablePlan.containers];
        updatedContainers[selectedContainerIndex].pallets = finalSelectedPallets;
        setEditablePlan(prev => ({ ...prev, containers: updatedContainers }));
        setIsPalletModalOpen(false);
        setSelectedContainerIndex(null);
    };

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError('');
        try {
            const payload = { 
                containers: editablePlan.containers.map(c => ({
                    _id: c._id,
                    containerNumber: c.containerNumber,
                    truckNumber: c.truckNumber,
                    pallets: c.pallets.map(p => p._id)
                })),
                loadingDate: editablePlan.loadingDate 
            };
            const response = await updateLoadingPlan(planId, payload);
            const data = response?.data || response;
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
                onClose(true);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete plan.');
                setIsSaving(false);
            }
        }
    };

    const toggleContainer = (index) => {
        setExpandedContainers(prev => ({ ...prev, [index]: !prev[index] }));
    };

    // Calculate totals
    const totals = useMemo(() => {
        if (!plan?.containers) return { containers: 0, pallets: 0, khatlis: 0, boxes: 0 };
        
        let pallets = 0, khatlis = 0, boxes = 0;
        plan.containers.forEach(c => {
            c.pallets?.forEach(p => {
                if (p.type === 'Khatli') khatlis++;
                else pallets++;
                boxes += p.boxCount || 0;
            });
        });
        
        return { containers: plan.containers.length, pallets, khatlis, boxes };
    }, [plan]);

    const getStatusConfig = (status) => {
        const configs = {
            'Draft': { icon: FileText, color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
            'Finalized': { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' },
            'Cancelled': { icon: XCircle, color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' }
        };
        return configs[status] || configs['Draft'];
    };

    const formattedLoadingDateForInput = editablePlan?.loadingDate ? format(parseISO(editablePlan.loadingDate), 'yyyy-MM-dd') : '';
    const statusConfig = getStatusConfig(plan?.status);
    const StatusIcon = statusConfig.icon;

    return (
        <>
            {isPalletModalOpen && selectedContainerIndex !== null && (
                <PalletSelectionModal
                    isOpen={isPalletModalOpen}
                    onClose={() => setIsPalletModalOpen(false)}
                    onSelect={handlePalletSelect}
                    currentContainerPallets={editablePlan.containers[selectedContainerIndex].pallets}
                />
            )}

            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => onClose(false)}>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    
                    {/* Header */}
                    <div className="flex justify-between items-start p-5 border-b border-border dark:border-dark-border flex-shrink-0">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-text dark:text-dark-text">Loading Plan Details</h1>
                                {plan?.status && (
                                    <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${statusConfig.bg} ${statusConfig.color}`}>
                                        <StatusIcon size={12} /> {plan.status}
                                    </span>
                                )}
                            </div>
                            <p className="font-mono text-primary dark:text-dark-primary font-bold">{plan?.loadingPlanId || 'Loading...'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {isEditMode ? (
                                <>
                                    <button 
                                        onClick={() => { setIsEditMode(false); setEditablePlan(JSON.parse(JSON.stringify(plan))); }} 
                                        className="text-sm text-text-secondary px-3 py-2 rounded-lg hover:bg-background dark:hover:bg-dark-background transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={handleSaveChanges} 
                                        disabled={isSaving} 
                                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors"
                                    >
                                        {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16} />}
                                        Save Changes
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button 
                                        onClick={handleDeletePlan} 
                                        disabled={isSaving} 
                                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                        title="Delete Plan"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                    <button 
                                        onClick={() => setIsEditMode(true)} 
                                        className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary-hover transition-colors"
                                    >
                                        <Edit size={16} /> Edit Plan
                                    </button>
                                </>
                            )}
                            <button 
                                onClick={() => onClose(false)} 
                                className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background ml-2"
                            >
                                <X size={24} className="text-text-secondary" />
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-6">
                        {loading && (
                            <div className="flex justify-center items-center h-64">
                                <Loader2 size={32} className="animate-spin text-primary" />
                            </div>
                        )}
                        
                        {error && (
                            <div className="p-4 mb-4 text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center gap-2">
                                <AlertTriangle size={16}/> {error}
                            </div>
                        )}
                        
                        {plan && editablePlan && (
                            <div className="space-y-6">
                                {/* Info Cards */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-xl border border-border dark:border-dark-border">
                                        <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary text-sm mb-2">
                                            <Warehouse size={16} /> Factory
                                        </div>
                                        <p className="text-lg font-bold text-text dark:text-dark-text">{plan.factory?.name || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-xl border border-border dark:border-dark-border">
                                        <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary text-sm mb-2">
                                            <Calendar size={16} /> Loading Date
                                        </div>
                                        {isEditMode ? (
                                            <input 
                                                type="date" 
                                                value={formattedLoadingDateForInput} 
                                                onChange={handleDateChange} 
                                                className="w-full px-3 py-1.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text"
                                            />
                                        ) : (
                                            <p className="text-lg font-bold text-text dark:text-dark-text">
                                                {plan.loadingDate ? format(parseISO(plan.loadingDate), 'dd MMM, yyyy') : 'N/A'}
                                            </p>
                                        )}
                                    </div>
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-xl border border-border dark:border-dark-border">
                                        <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary text-sm mb-2">
                                            <User size={16} /> Created By
                                        </div>
                                        <p className="text-lg font-bold text-text dark:text-dark-text">{plan.createdBy?.username || 'N/A'}</p>
                                    </div>
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-xl border border-border dark:border-dark-border">
                                        <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary text-sm mb-2">
                                            <Clock size={16} /> Created
                                        </div>
                                        <p className="text-lg font-bold text-text dark:text-dark-text">
                                            {plan.createdAt ? format(parseISO(plan.createdAt), 'dd MMM, yyyy') : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Summary Stats */}
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                                        <Truck size={24} className="mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                                        <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totals.containers}</p>
                                        <p className="text-sm text-blue-700 dark:text-blue-300">Containers</p>
                                    </div>
                                    <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800 text-center">
                                        <Package size={24} className="mx-auto text-indigo-600 dark:text-indigo-400 mb-2" />
                                        <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{totals.pallets}</p>
                                        <p className="text-sm text-indigo-700 dark:text-indigo-300">Pallets</p>
                                    </div>
                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 text-center">
                                        <Boxes size={24} className="mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totals.khatlis}</p>
                                        <p className="text-sm text-purple-700 dark:text-purple-300">Khatlis</p>
                                    </div>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-center">
                                        <Box size={24} className="mx-auto text-green-600 dark:text-green-400 mb-2" />
                                        <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totals.boxes.toLocaleString()}</p>
                                        <p className="text-sm text-green-700 dark:text-green-300">Total Boxes</p>
                                    </div>
                                </div>

                                {/* Containers */}
                                <div>
                                    <h2 className="text-xl font-bold mb-4 text-text dark:text-dark-text flex items-center gap-2">
                                        <Truck size={20} /> Containers ({(isEditMode ? editablePlan : plan).containers.length})
                                    </h2>
                                    <div className="space-y-4">
                                        {(isEditMode ? editablePlan.containers : plan.containers).map((container, index) => {
                                            const aggregated = aggregateContainerItems(container.pallets);
                                            const isExpanded = expandedContainers[index];
                                            const containerPalletCount = aggregated.pallets.reduce((sum, g) => sum + g.count, 0);
                                            const containerKhatliCount = aggregated.khatlis.reduce((sum, g) => sum + g.count, 0);
                                            const containerBoxCount = container.pallets?.reduce((sum, p) => sum + (p.boxCount || 0), 0) || 0;

                                            return (
                                                <div key={container._id || index} className="border border-border dark:border-dark-border rounded-xl overflow-hidden">
                                                    {/* Container Header */}
                                                    <div 
                                                        className="p-4 bg-background dark:bg-dark-background cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors"
                                                        onClick={() => !isEditMode && toggleContainer(index)}
                                                    >
                                                        {isEditMode ? (
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <label className="block text-sm text-text-secondary dark:text-dark-text-secondary mb-1">Container Number</label>
                                                                    <input 
                                                                        type="text" 
                                                                        value={container.containerNumber} 
                                                                        onChange={(e) => handleContainerChange(index, 'containerNumber', e.target.value.toUpperCase())} 
                                                                        className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text"
                                                                        placeholder="Container Number"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <label className="block text-sm text-text-secondary dark:text-dark-text-secondary mb-1">Truck Number</label>
                                                                    <input 
                                                                        type="text" 
                                                                        value={container.truckNumber} 
                                                                        onChange={(e) => handleContainerChange(index, 'truckNumber', e.target.value.toUpperCase())} 
                                                                        className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text"
                                                                        placeholder="Truck Number"
                                                                    />
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                                                        <Truck size={20} className="text-blue-600 dark:text-blue-400" />
                                                                    </div>
                                                                    <div>
                                                                        <h3 className="font-bold text-lg text-text dark:text-dark-text">{container.containerNumber}</h3>
                                                                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Truck: {container.truckNumber}</p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-4">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="px-2 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 rounded-full text-xs font-semibold">
                                                                            {containerPalletCount} Pallets
                                                                        </span>
                                                                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-xs font-semibold">
                                                                            {containerKhatliCount} Khatlis
                                                                        </span>
                                                                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-xs font-semibold">
                                                                            {containerBoxCount.toLocaleString()} Boxes
                                                                        </span>
                                                                    </div>
                                                                    {isExpanded ? <ChevronUp size={20} className="text-text-secondary" /> : <ChevronDown size={20} className="text-text-secondary" />}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Container Content */}
                                                    {(isExpanded || isEditMode) && (
                                                        <div className="p-4 border-t border-border dark:border-dark-border">
                                                            {isEditMode && (
                                                                <div className="flex justify-end mb-4">
                                                                    <button 
                                                                        onClick={() => handleOpenPalletModal(index)} 
                                                                        className="text-sm font-semibold text-primary hover:underline flex items-center gap-1"
                                                                    >
                                                                        <Package size={14} /> Manage Items
                                                                    </button>
                                                                </div>
                                                            )}

                                                            {container.pallets?.length === 0 ? (
                                                                <div className="text-center py-8 text-text-secondary dark:text-dark-text-secondary">
                                                                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                                                                    <p>No items in this container</p>
                                                                </div>
                                                            ) : (
                                                                <div className="space-y-4">
                                                                    {/* Pallets Section */}
                                                                    {aggregated.pallets.length > 0 && (
                                                                        <div>
                                                                            <h4 className="text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
                                                                                <Package size={16} /> Pallets ({containerPalletCount})
                                                                            </h4>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                                                {aggregated.pallets.map((group, groupIndex) => (
                                                                                    <div 
                                                                                        key={groupIndex} 
                                                                                        className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg relative"
                                                                                    >
                                                                                        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold">
                                                                                            {group.count}×
                                                                                        </span>
                                                                                        <p className="font-semibold text-sm text-text dark:text-dark-text truncate" title={group.tile.name}>
                                                                                            {group.tile.name}
                                                                                        </p>
                                                                                        <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                                                                                            <span className="flex items-center gap-1"><Ruler size={10} /> {group.tile.size}</span>
                                                                                        </div>
                                                                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 font-medium">
                                                                                            {group.boxCount} boxes/pallet
                                                                                        </p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}

                                                                    {/* Khatlis Section */}
                                                                    {aggregated.khatlis.length > 0 && (
                                                                        <div>
                                                                            <h4 className="text-sm font-semibold text-purple-600 dark:text-purple-400 mb-3 flex items-center gap-2">
                                                                                <Boxes size={16} /> Khatlis ({containerKhatliCount})
                                                                            </h4>
                                                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                                                                {aggregated.khatlis.map((group, groupIndex) => (
                                                                                    <div 
                                                                                        key={groupIndex} 
                                                                                        className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg relative"
                                                                                    >
                                                                                        <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold">
                                                                                            {group.count}×
                                                                                        </span>
                                                                                        <p className="font-semibold text-sm text-text dark:text-dark-text truncate" title={group.tile.name}>
                                                                                            {group.tile.name}
                                                                                        </p>
                                                                                        <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                                                                                            <span className="flex items-center gap-1"><Ruler size={10} /> {group.tile.size}</span>
                                                                                        </div>
                                                                                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-2 font-medium">
                                                                                            {group.boxCount} boxes/khatli
                                                                                        </p>
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
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