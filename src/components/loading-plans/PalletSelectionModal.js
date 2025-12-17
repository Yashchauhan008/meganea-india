import React, { useState, useEffect, useMemo } from 'react';
import { getAllAvailablePallets } from '../../api/palletApi';
import { Loader2, X, Search, CheckSquare, Square, Warehouse, Package, ChevronDown, ChevronRight, Box } from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

// PalletCard component for individual pallet selection
const PalletCard = ({ pallet, isSelected, onToggle }) => (
    <div 
        onClick={() => onToggle(pallet._id)} 
        className={`p-3 rounded-lg cursor-pointer border-2 transition-colors ${isSelected ? 'border-primary bg-primary/10' : 'border-border dark:border-dark-border bg-background dark:bg-dark-background hover:border-gray-400'}`}
    >
        <div className="flex justify-between items-center">
            {/* FIX: Ensure text is white in dark mode */}
            <p className="font-mono font-semibold text-sm text-text dark:text-dark-text">{pallet.palletId}</p>
            {isSelected ? <CheckSquare size={18} className="text-primary" /> : <Square size={18} className="text-text-secondary" />}
        </div>
        <p className="text-xs text-text-secondary mt-2 flex items-center gap-1"><Package size={12} /> {pallet.boxCount} boxes</p>
    </div>
);

const PalletSelectionModal = ({ isOpen, onClose, onSelect, currentContainerPallets = [] }) => {
    const [allPallets, setAllPallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [openGroups, setOpenGroups] = useState({});
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const [selectedPalletIds, setSelectedPalletIds] = useState(() => new Set(currentContainerPallets.map(p => p._id)));

    useEffect(() => {
        const fetchPallets = async () => {
            if (!isOpen) return;
            setLoading(true);
            setError('');
            try {
                const { data: availableStock } = await getAllAvailablePallets();
                const combinedPallets = [...availableStock, ...currentContainerPallets];
                const uniquePallets = Array.from(new Map(combinedPallets.map(p => [p._id, p])).values());
                setAllPallets(uniquePallets);
            } catch (err) {
                setError('Failed to load available pallets.');
            } finally {
                setLoading(false);
            }
        };
        fetchPallets();
    }, [isOpen]);

    const aggregatedData = useMemo(() => {
        const factoryGroups = {};
        const filteredPallets = allPallets.filter(p => 
            p.tile?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );

        filteredPallets.forEach(pallet => {
            const factoryId = pallet.factory?._id || 'unknown-factory';
            if (!factoryGroups[factoryId]) {
                factoryGroups[factoryId] = {
                    factory: pallet.factory || { name: 'Unknown Factory' },
                    tileGroups: {},
                };
            }

            const tileId = pallet.tile?._id || 'unknown-tile';
            if (!factoryGroups[factoryId].tileGroups[tileId]) {
                factoryGroups[factoryId].tileGroups[tileId] = {
                    tile: pallet.tile || { name: 'Unknown Tile', size: 'N/A' },
                    boxCountGroups: {},
                };
            }

            const boxCount = pallet.boxCount || 0;
            if (!factoryGroups[factoryId].tileGroups[tileId].boxCountGroups[boxCount]) {
                factoryGroups[factoryId].tileGroups[tileId].boxCountGroups[boxCount] = {
                    boxCount: boxCount,
                    pallets: [],
                };
            }
            factoryGroups[factoryId].tileGroups[tileId].boxCountGroups[boxCount].pallets.push(pallet);
        });

        return Object.values(factoryGroups).map(fg => ({
            ...fg,
            tileGroups: Object.values(fg.tileGroups).map(tg => ({
                ...tg,
                boxCountGroups: Object.values(tg.boxCountGroups),
            })),
        }));
    }, [allPallets, debouncedSearchTerm]);

    const handleToggleGroup = (key) => {
        setOpenGroups(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleTogglePallet = (palletId) => {
        setSelectedPalletIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(palletId)) newSet.delete(palletId);
            else newSet.add(palletId);
            return newSet;
        });
    };

    const handleSelectSubgroup = (palletsInGroup, shouldSelect) => {
        setSelectedPalletIds(prev => {
            const newSet = new Set(prev);
            palletsInGroup.forEach(p => {
                if (shouldSelect) newSet.add(p._id);
                else newSet.delete(p._id);
            });
            return newSet;
        });
    };

    const handleConfirm = () => {
        const selectedObjects = allPallets.filter(p => selectedPalletIds.has(p._id));
        onSelect(selectedObjects);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4 animate-fade-in">
            <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
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

                <div className="flex-grow overflow-y-auto p-6 space-y-4">
                    {loading && <div className="flex justify-center items-center h-full"><Loader2 size={32} className="animate-spin text-primary" /></div>}
                    {error && <div className="text-red-500 text-center">{error}</div>}
                    
                    {!loading && aggregatedData.map((factoryGroup) => (
                        <div key={factoryGroup.factory._id} className="bg-background dark:bg-dark-background/50 rounded-lg">
                            {/* FIX: Ensure factory name is white in dark mode */}
                            <h2 className="text-lg font-bold text-text dark:text-dark-text p-4 flex items-center gap-2"><Warehouse size={20} /> {factoryGroup.factory.name}</h2>
                            <div className="space-y-2 p-4 pt-0">
                                {factoryGroup.tileGroups.map((tileGroup) => (
                                    <div key={tileGroup.tile._id} className="border border-border dark:border-dark-border rounded-md">
                                        <div className="p-3">
                                            {/* Tile name is already blue (text-primary), which is fine */}
                                            <h3 className="font-semibold text-md text-primary">{tileGroup.tile.name}</h3>
                                            <p className="text-xs text-text-secondary">{tileGroup.tile.size}</p>
                                        </div>
                                        {tileGroup.boxCountGroups.map((boxGroup) => {
                                            const groupKey = `${tileGroup.tile._id}-${boxGroup.boxCount}`;
                                            const isExpanded = openGroups[groupKey];
                                            const allInSubgroupSelected = boxGroup.pallets.every(p => selectedPalletIds.has(p._id));
                                            return (
                                                <div key={groupKey} className="border-t border-border dark:border-dark-border">
                                                    <div className="flex justify-between items-center p-3 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5" onClick={() => handleToggleGroup(groupKey)}>
                                                        <div className="flex items-center gap-3">
                                                            {isExpanded ? <ChevronDown size={16} className="text-text-secondary" /> : <ChevronRight size={16} className="text-text-secondary" />}
                                                            {/* FIX: Ensure this descriptive text is white in dark mode */}
                                                            <div className="flex items-center gap-2 text-text dark:text-dark-text">
                                                                <Box size={16} className="text-text-secondary"/>
                                                                <span className="font-medium">{boxGroup.pallets.length} Pallets</span>
                                                                <span className="text-text-secondary">with {boxGroup.boxCount} boxes each</span>
                                                            </div>
                                                        </div>
                                                        <button 
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleSelectSubgroup(boxGroup.pallets, !allInSubgroupSelected);
                                                            }} 
                                                            className="text-xs font-semibold text-primary hover:underline"
                                                        >
                                                            {allInSubgroupSelected ? 'Deselect All' : 'Select All'}
                                                        </button>
                                                    </div>
                                                    {isExpanded && (
                                                        <div className="p-4 bg-background dark:bg-dark-background border-t border-dashed border-border dark:border-dark-border grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                            {boxGroup.pallets.map(pallet => (
                                                                <PalletCard key={pallet._id} pallet={pallet} isSelected={selectedPalletIds.has(pallet._id)} onToggle={handleTogglePallet} />
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {!loading && aggregatedData.length === 0 && (
                        <div className="text-center text-text-secondary py-10">
                            <p>No available pallets found.</p>
                        </div>
                    )}
                </div>

                <div className="p-4 bg-background/50 dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-between items-center">
                    <p className="text-sm font-semibold text-text dark:text-dark-text">Total Selected: {selectedPalletIds.size}</p>
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