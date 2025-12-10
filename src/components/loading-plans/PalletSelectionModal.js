import React, { useState, useEffect, useMemo } from 'react';
// --- THE FIX: Import the correct function ---
import { getAllAvailablePallets } from '../../api/palletApi';
import { Loader2, X, Search, CheckSquare, Square, Warehouse, Package } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

const PalletSelectionModal = ({ isOpen, onClose, onSelect, currentContainerPallets = [] }) => {
    const [allPallets, setAllPallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Initialize the selection state with the pallets already in the container.
    const [selectedPalletIds, setSelectedPalletIds] = useState(() => new Set(currentContainerPallets.map(p => p._id)));

    useEffect(() => {
        const fetchPallets = async () => {
            if (!isOpen) return;
            setLoading(true);
            setError('');
            try {
                // --- THE FIX: Call the correct, existing API function ---
                const { data: availableStock } = await getAllAvailablePallets();
                
                // Combine the available stock with the pallets already in this container.
                const combinedPallets = [...availableStock, ...currentContainerPallets];
                
                // Remove duplicates using a Map.
                const uniquePallets = Array.from(new Map(combinedPallets.map(p => [p._id, p])).values());
                
                setAllPallets(uniquePallets);
            } catch (err) {
                setError('Failed to load available pallets.');
            } finally {
                setLoading(false);
            }
        };
        
        fetchPallets();
    }, [isOpen]); // Re-fetch when the modal is opened.

    const aggregatedPallets = useMemo(() => {
        const tileGroups = {};
        const filteredPallets = allPallets.filter(pallet => 
            pallet.tile?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );

        filteredPallets.forEach(pallet => {
            const tileId = pallet.tile?._id || 'unknown-tile';
            if (!tileGroups[tileId]) {
                tileGroups[tileId] = {
                    tile: pallet.tile || { name: 'Unknown Tile', size: 'N/A' },
                    factoryGroups: {},
                };
            }

            const factoryId = pallet.factory?._id || 'unknown-factory';
            if (!tileGroups[tileId].factoryGroups[factoryId]) {
                tileGroups[tileId].factoryGroups[factoryId] = {
                    factory: pallet.factory || { name: 'Unknown Factory' },
                    pallets: [],
                };
            }
            tileGroups[tileId].factoryGroups[factoryId].pallets.push(pallet);
        });

        return Object.values(tileGroups).map(tg => ({
            ...tg,
            factoryGroups: Object.values(tg.factoryGroups),
        }));
    }, [allPallets, debouncedSearchTerm]);

    const handleTogglePallet = (palletId) => {
        setSelectedPalletIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(palletId)) {
                newSet.delete(palletId);
            } else {
                newSet.add(palletId);
            }
            return newSet;
        });
    };

    const handleSelectFactoryGroup = (palletsInGroup, isSelected) => {
        setSelectedPalletIds(prev => {
            const newSet = new Set(prev);
            palletsInGroup.forEach(p => {
                if (isSelected) {
                    newSet.add(p._id);
                } else {
                    newSet.delete(p._id);
                }
            });
            return newSet;
        });
    };

    const handleConfirm = () => {
        // Find the full pallet objects corresponding to the selected IDs and pass them back.
        const selectedObjects = allPallets.filter(p => selectedPalletIds.has(p._id));
        onSelect(selectedObjects);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fade-in">
            <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-5 border-b border-border dark:border-dark-border">
                    <h1 className="text-2xl font-bold text-text dark:text-dark-text">Select Pallets</h1>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background"><X size={24} /></button>
                </div>

                <div className="p-4 border-b border-border dark:border-dark-border">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by tile name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full form-input pl-10"
                        />
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {loading && <div className="flex justify-center items-center h-full"><Loader2 size={32} className="animate-spin text-primary" /></div>}
                    {error && <div className="text-red-500 text-center">{error}</div>}
                    {!loading && aggregatedPallets.map((tileGroup, tgIndex) => (
                        <div key={tgIndex}>
                            <h2 className="text-xl font-bold text-text dark:text-dark-text">{tileGroup.tile.name}</h2>
                            <p className="text-sm text-text-secondary mb-3">{tileGroup.tile.size}</p>
                            {tileGroup.factoryGroups.map((factoryGroup, fgIndex) => {
                                const allInGroupSelected = factoryGroup.pallets.every(p => selectedPalletIds.has(p._id));
                                return (
                                    <div key={fgIndex} className="p-4 border border-border dark:border-dark-border rounded-lg">
                                        <div className="flex justify-between items-center mb-3">
                                            <h3 className="font-semibold text-text dark:text-dark-text flex items-center gap-2"><Warehouse size={16} /> {factoryGroup.factory.name}</h3>
                                            <button onClick={() => handleSelectFactoryGroup(factoryGroup.pallets, !allInGroupSelected)} className="text-sm font-semibold text-primary hover:underline">
                                                {allInGroupSelected ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {factoryGroup.pallets.map(pallet => (
                                                <div key={pallet._id} onClick={() => handleTogglePallet(pallet._id)} className={`p-3 rounded-lg cursor-pointer border-2 ${selectedPalletIds.has(pallet._id) ? 'border-primary bg-primary/10' : 'border-border dark:border-dark-border bg-background dark:bg-dark-background'}`}>
                                                    <div className="flex justify-between items-center">
                                                        <p className="font-mono font-semibold text-sm">{pallet.palletId}</p>
                                                        {selectedPalletIds.has(pallet._id) ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-text-secondary" />}
                                                    </div>
                                                    <p className="text-xs text-text-secondary mt-2 flex items-center gap-1"><Package size={12} /> {pallet.boxCount} boxes</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                     {!loading && aggregatedPallets.length === 0 && (
                        <div className="text-center text-text-secondary py-10">
                            <p>No available pallets match your search.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-background/50 dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-between items-center">
                    <p className="text-sm font-semibold">Total Selected: {selectedPalletIds.size}</p>
                    <div>
                        <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary rounded-md mr-2">Cancel</button>
                        <button onClick={handleConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover">Confirm Selection</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PalletSelectionModal;
