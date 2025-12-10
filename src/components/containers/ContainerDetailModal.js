import React, { useState, useEffect, useMemo } from 'react';
import { X, Loader2, Edit, Save, Warehouse, Box, Ruler } from 'lucide-react';
import { updateContainer } from '../../api/containerApi';
import PalletSelectionModal from '../loading-plans/PalletSelectionModal';
import Input from '../ui/Input';
import Label from '../ui/Label';

const ContainerDetailModal = ({ container: initialContainer, onClose, onUpdate }) => {
    const [container, setContainer] = useState(initialContainer);
    const [editMode, setEditMode] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [isPalletModalOpen, setIsPalletModalOpen] = useState(false);

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
                pallets: initialContainer.pallets,
            });
        }
    }, [initialContainer]);

    // --- THIS IS THE NEW AGGREGATION LOGIC ---
    const aggregatedPallets = useMemo(() => {
        const palletsToDisplay = editMode ? formData.pallets : container.pallets;
        if (!palletsToDisplay || palletsToDisplay.length === 0) return [];

        const factoryGroups = {};

        palletsToDisplay.forEach(pallet => {
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
            const boxCount = pallet.boxCount;

            const tileGroupKey = `${tileId}-${boxCount}`;
            if (!factoryGroups[factoryId].tileGroups[tileGroupKey]) {
                factoryGroups[factoryId].tileGroups[tileGroupKey] = {
                    tileName,
                    tileSize,
                    boxCount,
                    count: 0,
                };
            }
            factoryGroups[factoryId].tileGroups[tileGroupKey].count++;
        });

        return Object.values(factoryGroups).map(fg => ({
            ...fg,
            tileGroups: Object.values(fg.tileGroups),
        }));
    }, [container.pallets, formData.pallets, editMode]);
    // --- END OF AGGREGATION LOGIC ---

    const handleSaveChanges = async () => {
        setIsSaving(true);
        setError('');
        try {
            const updateData = {
                containerNumber: formData.containerNumber,
                truckNumber: formData.truckNumber,
                pallets: formData.pallets.map(p => p._id),
            };
            const { data: updatedContainer } = await updateContainer(container._id, updateData);
            onUpdate(updatedContainer);
            setContainer(updatedContainer);
            setEditMode(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save changes.');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePalletSelect = (selectedPallets) => {
        setFormData(prev => ({ ...prev, pallets: selectedPallets }));
        setIsPalletModalOpen(false);
    };

    if (!container) return null;

    const totalPalletCount = (editMode ? formData.pallets : container.pallets).length;
    const totalBoxes = (editMode ? formData.pallets : container.pallets).reduce((sum, pallet) => sum + pallet.boxCount, 0);

    return (
        <>
            {isPalletModalOpen && (
                <PalletSelectionModal
                    isOpen={isPalletModalOpen}
                    onClose={() => setIsPalletModalOpen(false)}
                    onSelect={handlePalletSelect}
                    factoryId={null}
                    currentContainerPallets={formData.pallets}
                />
            )}

            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center p-5 border-b border-border dark:border-dark-border">
                        <div>
                            <h1 className="text-2xl font-bold text-text dark:text-dark-text">Container Details</h1>
                            <p className="font-mono text-primary dark:text-dark-primary">{container.containerId}</p>
                        </div>
                        {!editMode && <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background"><X size={24} /></button>}
                    </div>

                    <div className="flex-grow overflow-y-auto p-6 space-y-6">
                        {error && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{error}</div>}
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="containerNumber">Container Number</Label>
                                <Input id="containerNumber" name="containerNumber" value={formData.containerNumber} onChange={(e) => setFormData(p => ({...p, containerNumber: e.target.value}))} readOnly={!editMode} />
                            </div>
                            <div>
                                <Label htmlFor="truckNumber">Truck Number</Label>
                                <Input id="truckNumber" name="truckNumber" value={formData.truckNumber} onChange={(e) => setFormData(p => ({...p, truckNumber: e.target.value}))} readOnly={!editMode} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text">
                                    Contents ({totalPalletCount} Pallets, {totalBoxes} Total Boxes)
                                </h3>
                                {editMode && <button onClick={() => setIsPalletModalOpen(true)} className="text-sm font-semibold text-primary dark:text-dark-primary hover:underline">Manage Pallets</button>}
                            </div>
                            
                            {/* --- NEW AGGREGATED DISPLAY --- */}
                            <div className="space-y-4">
                                {aggregatedPallets.length > 0 ? aggregatedPallets.map((factoryGroup, index) => (
                                    <div key={index} className="p-4 border border-border dark:border-dark-border rounded-lg">
                                        <h4 className="font-bold text-text dark:text-dark-text flex items-center gap-2 mb-3">
                                            <Warehouse size={18} className="text-primary"/>
                                            From: {factoryGroup.factoryName}
                                        </h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {factoryGroup.tileGroups.map((tileGroup, tgIndex) => (
                                                <div key={tgIndex} className="p-3 bg-background dark:bg-dark-background rounded-md">
                                                    <div className="flex justify-between items-start">
                                                        <p className="font-semibold text-text dark:text-dark-text">{tileGroup.tileName}</p>
                                                        <span className="px-2 py-1 text-xs font-bold bg-primary/10 text-primary rounded-full">{tileGroup.count}x</span>
                                                    </div>
                                                    <div className="text-xs text-text-secondary mt-1 flex items-center justify-between">
                                                        <span><Ruler size={12} className="inline mr-1"/>{tileGroup.tileSize}</span>
                                                        <span><Box size={12} className="inline mr-1"/>{tileGroup.boxCount} boxes/pallet</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )) : (
                                    <div className="text-center p-8 text-text-secondary">This container is empty.</div>
                                )}
                            </div>
                            {/* --- END OF AGGREGATED DISPLAY --- */}
                        </div>
                    </div>

                    <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-end items-center gap-3">
                        {editMode ? (
                            <>
                                <button onClick={() => setEditMode(false)} className="px-4 py-2 text-sm font-semibold text-text-secondary rounded-md hover:bg-border">Cancel</button>
                                <button onClick={handleSaveChanges} disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2">
                                    {isSaving ? <Loader2 size={16} className="animate-spin"/> : <Save size={16}/>}
                                    Save Changes
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary rounded-md hover:bg-border">Close</button>
                                <button onClick={() => setEditMode(true)} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover flex items-center gap-2">
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
