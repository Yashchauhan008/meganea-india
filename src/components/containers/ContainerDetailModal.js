// FILE LOCATION: src/components/containers/ContainerDetailModal.js

import React, { useState, useEffect, useMemo } from 'react';
import { 
    X, Loader2, Edit, Save, Warehouse, Box, Ruler, Truck, Package,
    Calendar, User, FileText, RotateCcw, CheckCircle, AlertCircle,
    Ship, MapPin, Clock, Boxes
} from 'lucide-react';
import { updateContainer, updateContainerStatus } from '../../api/containerApi';
import PalletSelectionModal from '../loading-plans/PalletSelectionModal';
import Input from '../ui/Input';
import Label from '../ui/Label';
import { format } from 'date-fns';

const ContainerDetailModal = ({ container: initialContainer, onClose, onUpdate }) => {
    const [container, setContainer] = useState(initialContainer);
    const [editMode, setEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isPalletModalOpen, setIsPalletModalOpen] = useState(false);
    
    // Status change modal state
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [newStatus, setNewStatus] = useState('');
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [statusError, setStatusError] = useState('');

    const [formData, setFormData] = useState({
        containerNumber: '',
        truckNumber: '',
        pallets: [],
    });

    useEffect(() => {
        setContainer(initialContainer);
        if (initialContainer) {
            setFormData({
                containerNumber: initialContainer.containerNumber,
                truckNumber: initialContainer.truckNumber,
                pallets: initialContainer.pallets || [],
            });
        }
    }, [initialContainer]);

    // Status configuration
    const statusConfig = {
        'Empty': { 
            icon: Package, 
            color: 'text-gray-600 dark:text-gray-400', 
            bg: 'bg-gray-100 dark:bg-gray-800',
            description: 'Container has no items'
        },
        'Loading': { 
            icon: Boxes, 
            color: 'text-yellow-600 dark:text-yellow-400', 
            bg: 'bg-yellow-100 dark:bg-yellow-900/40',
            description: 'Being loaded with pallets'
        },
        'Loaded': { 
            icon: Package, 
            color: 'text-blue-600 dark:text-blue-400', 
            bg: 'bg-blue-100 dark:bg-blue-900/40',
            description: 'Fully loaded and ready'
        },
        'Ready to Dispatch': { 
            icon: Truck, 
            color: 'text-purple-600 dark:text-purple-400', 
            bg: 'bg-purple-100 dark:bg-purple-900/40',
            description: 'Ready for dispatch'
        },
        'Dispatched': { 
            icon: Truck, 
            color: 'text-orange-600 dark:text-orange-400', 
            bg: 'bg-orange-100 dark:bg-orange-900/40',
            description: 'Dispatched from factory'
        },
        'In Transit': { 
            icon: Ship, 
            color: 'text-cyan-600 dark:text-cyan-400', 
            bg: 'bg-cyan-100 dark:bg-cyan-900/40',
            description: 'In transit to destination'
        },
        'Delivered': { 
            icon: CheckCircle, 
            color: 'text-green-600 dark:text-green-400', 
            bg: 'bg-green-100 dark:bg-green-900/40',
            description: 'Delivered to destination'
        },
    };

    // Get available status transitions
    const getAvailableStatuses = (currentStatus) => {
        const transitions = {
            'Empty': ['Loading'],
            'Loading': ['Empty', 'Loaded'],
            'Loaded': ['Loading', 'Ready to Dispatch'],
            'Ready to Dispatch': ['Loaded', 'Dispatched'],
            'Dispatched': ['Ready to Dispatch', 'In Transit'],
            'In Transit': ['Dispatched', 'Delivered'],
            'Delivered': ['In Transit'], // Allow revert
        };
        return transitions[currentStatus] || [];
    };

    const getStatusInfo = (status) => statusConfig[status] || statusConfig['Empty'];

    // Aggregated pallets display
    const aggregatedPallets = useMemo(() => {
        const palletsToDisplay = editMode ? formData.pallets : (container?.pallets || []);
        if (!palletsToDisplay || palletsToDisplay.length === 0) return [];

        const factoryGroups = {};

        palletsToDisplay.forEach(pallet => {
            if (!pallet) return;
            const factoryId = pallet.factory?._id || 'unknown';
            const factoryName = pallet.factory?.name || 'Unknown Factory';

            if (!factoryGroups[factoryId]) {
                factoryGroups[factoryId] = {
                    factoryName,
                    tileGroups: {},
                };
            }

            const tileId = pallet.tile?._id || 'unknown-tile';
            const tileName = pallet.tile?.name || 'Unknown Tile';
            const tileSize = pallet.tile?.size || 'N/A';
            const boxCount = pallet.boxCount || 0;
            const palletType = pallet.type || 'Pallet';

            const tileGroupKey = `${tileId}-${boxCount}-${palletType}`;
            if (!factoryGroups[factoryId].tileGroups[tileGroupKey]) {
                factoryGroups[factoryId].tileGroups[tileGroupKey] = {
                    tileName,
                    tileSize,
                    boxCount,
                    palletType,
                    count: 0,
                };
            }
            factoryGroups[factoryId].tileGroups[tileGroupKey].count++;
        });

        return Object.values(factoryGroups).map(fg => ({
            ...fg,
            tileGroups: Object.values(fg.tileGroups),
        }));
    }, [container?.pallets, formData.pallets, editMode]);

    // Handle save changes
    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError('');
        try {
            const updateData = {
                containerNumber: formData.containerNumber,
                truckNumber: formData.truckNumber,
                pallets: formData.pallets.map(p => p._id),
            };
            const response = await updateContainer(container._id, updateData);
            const updatedContainer = response?.data || response;
            onUpdate(updatedContainer);
            setContainer(updatedContainer);
            setEditMode(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle status change
    const handleStatusChange = async () => {
        if (!newStatus) return;
        setStatusUpdating(true);
        setStatusError('');
        try {
            const response = await updateContainerStatus(container._id, newStatus);
            const updatedContainer = response?.data || response;
            onUpdate(updatedContainer);
            setContainer(updatedContainer);
            setShowStatusModal(false);
            setNewStatus('');
        } catch (err) {
            setStatusError(err.response?.data?.message || 'Failed to update status.');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handlePalletSelect = (selectedPallets) => {
        setFormData(prev => ({ ...prev, pallets: selectedPallets }));
        setIsPalletModalOpen(false);
    };

    if (!container) return null;

    const currentPallets = editMode ? formData.pallets : (container.pallets || []);
    const totalPalletCount = currentPallets.filter(p => p?.type !== 'Khatli').length;
    const totalKhatliCount = currentPallets.filter(p => p?.type === 'Khatli').length;
    const totalBoxes = currentPallets.reduce((sum, pallet) => sum + (pallet?.boxCount || 0), 0);
    const currentStatusInfo = getStatusInfo(container.status);
    const availableStatuses = getAvailableStatuses(container.status);
    const factoryName = container.factory?.name || container.loadingPlan?.factory?.name || 'N/A';

    return (
        <>
            {/* Pallet Selection Modal */}
            {isPalletModalOpen && (
                <PalletSelectionModal
                    isOpen={isPalletModalOpen}
                    onClose={() => setIsPalletModalOpen(false)}
                    onSelect={handlePalletSelect}
                    factoryId={null}
                    currentContainerPallets={formData.pallets}
                />
            )}

            {/* Status Change Modal */}
            {showStatusModal && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4" onClick={() => setShowStatusModal(false)}>
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-text dark:text-dark-text">Change Status</h3>
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
                                    Container: <span className="font-mono font-bold">{container.containerId}</span>
                                </p>
                            </div>
                            <button onClick={() => setShowStatusModal(false)} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-border">
                                <X size={20} className="text-text-secondary" />
                            </button>
                        </div>

                        {/* Current Status */}
                        <div className="mb-4 p-3 bg-background dark:bg-dark-background rounded-lg">
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">Current Status</p>
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold ${currentStatusInfo.bg} ${currentStatusInfo.color}`}>
                                <currentStatusInfo.icon size={14} /> {container.status}
                            </span>
                        </div>

                        {/* New Status Selection */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">
                                Select New Status
                            </label>
                            {availableStatuses.length === 0 ? (
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary py-4 text-center">
                                    No status transitions available for this container.
                                </p>
                            ) : (
                                <div className="space-y-2">
                                    {availableStatuses.map(status => {
                                        const statusInfo = getStatusInfo(status);
                                        const StatusIcon = statusInfo.icon;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => setNewStatus(status)}
                                                className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                                                    newStatus === status 
                                                        ? 'border-primary bg-primary/5' 
                                                        : 'border-border dark:border-dark-border hover:border-primary/50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <span className={`flex items-center justify-center w-8 h-8 rounded-full ${statusInfo.bg}`}>
                                                        <StatusIcon size={16} className={statusInfo.color} />
                                                    </span>
                                                    <div className="text-left">
                                                        <p className="font-medium text-text dark:text-dark-text">{status}</p>
                                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{statusInfo.description}</p>
                                                    </div>
                                                </div>
                                                {newStatus === status && (
                                                    <CheckCircle size={20} className="text-primary" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {statusError && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={16} />{statusError}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowStatusModal(false)}
                                className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleStatusChange}
                                disabled={!newStatus || statusUpdating}
                                className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                            >
                                {statusUpdating && <Loader2 size={16} className="animate-spin" />}
                                Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Main Modal */}
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex justify-between items-start p-5 border-b border-border dark:border-dark-border">
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-text dark:text-dark-text">Container Details</h1>
                                <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${currentStatusInfo.bg} ${currentStatusInfo.color}`}>
                                    <currentStatusInfo.icon size={12} /> {container.status}
                                </span>
                            </div>
                            <p className="font-mono text-primary dark:text-dark-primary font-bold">{container.containerId}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {!editMode && availableStatuses.length > 0 && (
                                <button 
                                    onClick={() => { setShowStatusModal(true); setNewStatus(''); setStatusError(''); }}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary dark:text-dark-text-secondary border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors"
                                >
                                    <RotateCcw size={16} /> Change Status
                                </button>
                            )}
                            {!editMode && (
                                <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background">
                                    <X size={24} className="text-text-secondary" />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-6">
                        {error && (
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={16} />{error}
                            </div>
                        )}

                        {/* Container Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="containerNumber">Container Number</Label>
                                <Input 
                                    id="containerNumber" 
                                    value={formData.containerNumber} 
                                    onChange={(e) => setFormData(p => ({...p, containerNumber: e.target.value.toUpperCase()}))} 
                                    readOnly={!editMode} 
                                />
                            </div>
                            <div>
                                <Label htmlFor="truckNumber">Truck Number</Label>
                                <Input 
                                    id="truckNumber" 
                                    value={formData.truckNumber} 
                                    onChange={(e) => setFormData(p => ({...p, truckNumber: e.target.value.toUpperCase()}))} 
                                    readOnly={!editMode} 
                                />
                            </div>
                        </div>

                        {/* Additional Info (read-only) */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="p-3 bg-background dark:bg-dark-background rounded-lg">
                                <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary text-sm mb-1">
                                    <Warehouse size={14} /> Factory
                                </div>
                                <p className="font-semibold text-text dark:text-dark-text">{factoryName}</p>
                            </div>
                            <div className="p-3 bg-background dark:bg-dark-background rounded-lg">
                                <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary text-sm mb-1">
                                    <FileText size={14} /> Loading Plan
                                </div>
                                <p className="font-semibold text-text dark:text-dark-text font-mono">
                                    {container.loadingPlan?.loadingPlanId || 'N/A'}
                                </p>
                            </div>
                            <div className="p-3 bg-background dark:bg-dark-background rounded-lg">
                                <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary text-sm mb-1">
                                    <Calendar size={14} /> Created
                                </div>
                                <p className="font-semibold text-text dark:text-dark-text">
                                    {container.createdAt ? format(new Date(container.createdAt), 'dd MMM, yyyy') : 'N/A'}
                                </p>
                            </div>
                            <div className="p-3 bg-background dark:bg-dark-background rounded-lg">
                                <div className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary text-sm mb-1">
                                    <User size={14} /> Created By
                                </div>
                                <p className="font-semibold text-text dark:text-dark-text">
                                    {container.createdBy?.username || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {/* Summary Stats */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center border border-blue-200 dark:border-blue-800">
                                <Package size={24} className="mx-auto text-blue-600 dark:text-blue-400 mb-2" />
                                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{totalPalletCount}</p>
                                <p className="text-sm text-blue-700 dark:text-blue-300">Pallets</p>
                            </div>
                            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center border border-purple-200 dark:border-purple-800">
                                <Boxes size={24} className="mx-auto text-purple-600 dark:text-purple-400 mb-2" />
                                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalKhatliCount}</p>
                                <p className="text-sm text-purple-700 dark:text-purple-300">Khatlis</p>
                            </div>
                            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg text-center border border-green-200 dark:border-green-800">
                                <Box size={24} className="mx-auto text-green-600 dark:text-green-400 mb-2" />
                                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{totalBoxes.toLocaleString()}</p>
                                <p className="text-sm text-green-700 dark:text-green-300">Total Boxes</p>
                            </div>
                        </div>

                        {/* Contents */}
                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text">Contents</h3>
                                {editMode && (
                                    <button 
                                        onClick={() => setIsPalletModalOpen(true)} 
                                        className="text-sm font-semibold text-primary dark:text-dark-primary hover:underline flex items-center gap-1"
                                    >
                                        <Package size={14} /> Manage Pallets
                                    </button>
                                )}
                            </div>
                            
                            <div className="space-y-4">
                                {aggregatedPallets.length > 0 ? aggregatedPallets.map((factoryGroup, index) => (
                                    <div key={index} className="p-4 border border-border dark:border-dark-border rounded-lg">
                                        <h4 className="font-bold text-text dark:text-dark-text flex items-center gap-2 mb-3">
                                            <Warehouse size={18} className="text-primary"/>
                                            From: {factoryGroup.factoryName}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {factoryGroup.tileGroups.map((tileGroup, tgIndex) => (
                                                <div key={tgIndex} className="p-3 bg-background dark:bg-dark-background rounded-lg">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <p className="font-semibold text-text dark:text-dark-text text-sm">{tileGroup.tileName}</p>
                                                        <span className="px-2 py-0.5 text-xs font-bold bg-primary/10 text-primary rounded-full">
                                                            {tileGroup.count}x
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-text-secondary dark:text-dark-text-secondary flex items-center justify-between">
                                                        <span className="flex items-center gap-1"><Ruler size={12}/>{tileGroup.tileSize}</span>
                                                        <span className="flex items-center gap-1"><Box size={12}/>{tileGroup.boxCount} boxes</span>
                                                    </div>
                                                    {tileGroup.palletType === 'Khatli' && (
                                                        <span className="inline-block mt-1 text-xs px-1.5 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded">
                                                            Khatli
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center py-8 bg-background dark:bg-dark-background rounded-lg">
                                        <Package size={40} className="mx-auto text-text-secondary/30 mb-2" />
                                        <p className="text-text-secondary dark:text-dark-text-secondary">This container is empty.</p>
                                        {editMode && (
                                            <button 
                                                onClick={() => setIsPalletModalOpen(true)} 
                                                className="mt-2 text-sm font-semibold text-primary hover:underline"
                                            >
                                                Add Pallets
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-end items-center gap-3">
                        {editMode ? (
                            <>
                                <button 
                                    onClick={() => { 
                                        setEditMode(false); 
                                        setFormData({
                                            containerNumber: container.containerNumber,
                                            truckNumber: container.truckNumber,
                                            pallets: container.pallets || [],
                                        });
                                    }} 
                                    className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveChanges} 
                                    disabled={isSaving} 
                                    className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                                >
                                    {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <button 
                                    onClick={onClose} 
                                    className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border transition-colors"
                                >
                                    Close
                                </button>
                                <button 
                                    onClick={() => setEditMode(true)} 
                                    className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover flex items-center gap-2 transition-colors"
                                >
                                    <Edit size={16}/> Edit Container
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ContainerDetailModal;