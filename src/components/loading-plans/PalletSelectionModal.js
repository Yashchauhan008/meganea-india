// FILE LOCATION: src/components/loading-plans/PalletSelectionModal.js

import React, { useState, useEffect, useMemo } from 'react';
import { getAllAvailablePallets } from '../../api/palletApi';
import { 
    Loader2, X, Search, CheckSquare, Square, Warehouse, Package, 
    ChevronDown, ChevronRight, Box, Boxes, Layers, Ruler, Check
} from 'lucide-react';
import useDebounce from '../../hooks/useDebounce';

// ItemCard component for individual pallet/khatli selection
const ItemCard = ({ item, isSelected, onToggle, type }) => {
    const isPallet = type === 'Pallet';
    const colorClass = isPallet 
        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
        : 'border-purple-500 bg-purple-50 dark:bg-purple-900/20';
    const defaultBorder = isPallet
        ? 'border-blue-200 dark:border-blue-900/50 hover:border-blue-400'
        : 'border-purple-200 dark:border-purple-900/50 hover:border-purple-400';
    const textColor = isPallet ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400';

    return (
        <div 
            onClick={() => onToggle(item._id)} 
            className={`p-3 rounded-lg cursor-pointer border-2 transition-all ${
                isSelected 
                    ? `${colorClass} border-2 ${isPallet ? 'border-blue-500' : 'border-purple-500'}` 
                    : `bg-foreground dark:bg-dark-foreground ${defaultBorder}`
            }`}
        >
            <div className="flex justify-between items-center">
                <p className={`font-mono font-semibold text-sm ${isSelected ? textColor : 'text-text dark:text-dark-text'}`}>
                    {item.palletId}
                </p>
                {isSelected 
                    ? <CheckSquare size={18} className={textColor} /> 
                    : <Square size={18} className="text-text-secondary" />
                }
            </div>
            <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                    <Box size={12} /> {item.boxCount} boxes
                </p>
                <span className={`text-xs px-1.5 py-0.5 rounded ${isPallet ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'}`}>
                    {type}
                </span>
            </div>
        </div>
    );
};

const PalletSelectionModal = ({ isOpen, onClose, onSelect, currentContainerPallets = [] }) => {
    const [allPallets, setAllPallets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [openGroups, setOpenGroups] = useState({});
    const [activeTab, setActiveTab] = useState('all'); // 'all', 'pallets', 'khatlis'
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const [selectedPalletIds, setSelectedPalletIds] = useState(() => new Set(currentContainerPallets.map(p => p._id)));

    useEffect(() => {
        const fetchPallets = async () => {
            if (!isOpen) return;
            setLoading(true);
            setError('');
            try {
                const response = await getAllAvailablePallets();
                const availableStock = response?.data || response || [];
                const combinedPallets = [...availableStock, ...currentContainerPallets];
                const uniquePallets = Array.from(new Map(combinedPallets.map(p => [p._id, p])).values());
                setAllPallets(uniquePallets);
            } catch (err) {
                setError('Failed to load available items.');
            } finally {
                setLoading(false);
            }
        };
        fetchPallets();
    }, [isOpen, currentContainerPallets]);

    // Aggregate data by factory -> type -> tile -> boxCount
    const aggregatedData = useMemo(() => {
        let filteredPallets = allPallets.filter(p => 
            (p.tile?.name?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase())
        );

        // Filter by tab
        if (activeTab === 'pallets') {
            filteredPallets = filteredPallets.filter(p => p.type === 'Pallet');
        } else if (activeTab === 'khatlis') {
            filteredPallets = filteredPallets.filter(p => p.type === 'Khatli');
        }

        const factoryGroups = {};

        filteredPallets.forEach(pallet => {
            const factoryId = pallet.factory?._id || 'unknown-factory';
            if (!factoryGroups[factoryId]) {
                factoryGroups[factoryId] = {
                    factory: pallet.factory || { name: 'Unknown Factory' },
                    pallets: { tileGroups: {} },
                    khatlis: { tileGroups: {} }
                };
            }

            const type = pallet.type || 'Pallet';
            const typeGroup = type === 'Pallet' ? 'pallets' : 'khatlis';
            const tileId = pallet.tile?._id || 'unknown-tile';

            if (!factoryGroups[factoryId][typeGroup].tileGroups[tileId]) {
                factoryGroups[factoryId][typeGroup].tileGroups[tileId] = {
                    tile: pallet.tile || { name: 'Unknown Tile', size: 'N/A' },
                    boxCountGroups: {}
                };
            }

            const boxCount = pallet.boxCount || 0;
            if (!factoryGroups[factoryId][typeGroup].tileGroups[tileId].boxCountGroups[boxCount]) {
                factoryGroups[factoryId][typeGroup].tileGroups[tileId].boxCountGroups[boxCount] = {
                    boxCount,
                    items: []
                };
            }
            factoryGroups[factoryId][typeGroup].tileGroups[tileId].boxCountGroups[boxCount].items.push(pallet);
        });

        // Convert to array format
        return Object.values(factoryGroups).map(fg => ({
            factory: fg.factory,
            pallets: {
                tileGroups: Object.values(fg.pallets.tileGroups).map(tg => ({
                    ...tg,
                    boxCountGroups: Object.values(tg.boxCountGroups)
                }))
            },
            khatlis: {
                tileGroups: Object.values(fg.khatlis.tileGroups).map(tg => ({
                    ...tg,
                    boxCountGroups: Object.values(tg.boxCountGroups)
                }))
            }
        }));
    }, [allPallets, debouncedSearchTerm, activeTab]);

    // Count totals
    const counts = useMemo(() => {
        const palletCount = allPallets.filter(p => p.type === 'Pallet').length;
        const khatliCount = allPallets.filter(p => p.type === 'Khatli').length;
        const selectedPallets = allPallets.filter(p => selectedPalletIds.has(p._id) && p.type === 'Pallet').length;
        const selectedKhatlis = allPallets.filter(p => selectedPalletIds.has(p._id) && p.type === 'Khatli').length;
        return { palletCount, khatliCount, selectedPallets, selectedKhatlis, total: palletCount + khatliCount };
    }, [allPallets, selectedPalletIds]);

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

    const handleSelectSubgroup = (itemsInGroup, shouldSelect) => {
        setSelectedPalletIds(prev => {
            const newSet = new Set(prev);
            itemsInGroup.forEach(p => {
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

    // Render a type section (Pallets or Khatlis)
    const renderTypeSection = (factoryGroup, type) => {
        const typeData = type === 'Pallet' ? factoryGroup.pallets : factoryGroup.khatlis;
        const isPallet = type === 'Pallet';
        const Icon = isPallet ? Package : Boxes;
        const colorClasses = isPallet 
            ? { header: 'text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-800' }
            : { header: 'text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800' };

        if (typeData.tileGroups.length === 0) return null;

        return (
            <div className={`rounded-lg border ${colorClasses.border} overflow-hidden`}>
                <div className={`px-4 py-3 ${colorClasses.header} flex items-center gap-2 font-semibold`}>
                    <Icon size={18} />
                    {type}s ({typeData.tileGroups.reduce((sum, tg) => sum + tg.boxCountGroups.reduce((s, bg) => s + bg.items.length, 0), 0)})
                </div>
                <div className="divide-y divide-border dark:divide-dark-border">
                    {typeData.tileGroups.map((tileGroup) => (
                        <div key={tileGroup.tile._id} className="bg-foreground dark:bg-dark-foreground">
                            <div className="px-4 py-3 border-b border-border dark:border-dark-border">
                                <h3 className={`font-semibold ${isPallet ? 'text-blue-600 dark:text-blue-400' : 'text-purple-600 dark:text-purple-400'}`}>
                                    {tileGroup.tile.name}
                                </h3>
                                <div className="flex items-center gap-3 text-xs text-text-secondary dark:text-dark-text-secondary mt-1">
                                    <span className="flex items-center gap-1"><Ruler size={12} /> {tileGroup.tile.size}</span>
                                    {tileGroup.tile.surface && (
                                        <span className="flex items-center gap-1"><Layers size={12} /> {tileGroup.tile.surface}</span>
                                    )}
                                </div>
                            </div>
                            {tileGroup.boxCountGroups.map((boxGroup) => {
                                const groupKey = `${type}-${tileGroup.tile._id}-${boxGroup.boxCount}`;
                                const isExpanded = openGroups[groupKey];
                                const allInSubgroupSelected = boxGroup.items.every(p => selectedPalletIds.has(p._id));
                                const someSelected = boxGroup.items.some(p => selectedPalletIds.has(p._id));

                                return (
                                    <div key={groupKey} className="border-t border-border dark:border-dark-border">
                                        <div 
                                            className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors" 
                                            onClick={() => handleToggleGroup(groupKey)}
                                        >
                                            <div className="flex items-center gap-3">
                                                {isExpanded 
                                                    ? <ChevronDown size={16} className="text-text-secondary" /> 
                                                    : <ChevronRight size={16} className="text-text-secondary" />
                                                }
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                                        isPallet 
                                                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' 
                                                            : 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400'
                                                    }`}>
                                                        {boxGroup.items.length}
                                                    </span>
                                                    <div>
                                                        <span className="font-medium text-text dark:text-dark-text">
                                                            {boxGroup.boxCount} boxes/{isPallet ? 'pallet' : 'khatli'}
                                                        </span>
                                                        <span className="text-text-secondary dark:text-dark-text-secondary text-sm ml-2">
                                                            ({boxGroup.items.length * boxGroup.boxCount} total boxes)
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {someSelected && (
                                                    <span className={`text-xs px-2 py-1 rounded-full ${
                                                        isPallet 
                                                            ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
                                                            : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300'
                                                    }`}>
                                                        {boxGroup.items.filter(p => selectedPalletIds.has(p._id)).length} selected
                                                    </span>
                                                )}
                                                <button 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectSubgroup(boxGroup.items, !allInSubgroupSelected);
                                                    }} 
                                                    className={`text-xs font-semibold px-2 py-1 rounded transition-colors ${
                                                        allInSubgroupSelected 
                                                            ? 'bg-gray-200 dark:bg-gray-700 text-text-secondary hover:bg-gray-300 dark:hover:bg-gray-600' 
                                                            : isPallet 
                                                                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                                                                : 'bg-purple-600 text-white hover:bg-purple-700'
                                                    }`}
                                                >
                                                    {allInSubgroupSelected ? 'Deselect All' : 'Select All'}
                                                </button>
                                            </div>
                                        </div>
                                        {isExpanded && (
                                            <div className="p-4 bg-background dark:bg-dark-background border-t border-dashed border-border dark:border-dark-border grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                                {boxGroup.items.map(item => (
                                                    <ItemCard 
                                                        key={item._id} 
                                                        item={item} 
                                                        isSelected={selectedPalletIds.has(item._id)} 
                                                        onToggle={handleTogglePallet}
                                                        type={type}
                                                    />
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
        );
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b border-border dark:border-dark-border flex-shrink-0">
                    <div>
                        <h1 className="text-2xl font-bold text-text dark:text-dark-text">Select Items</h1>
                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                            Choose pallets and khatlis to add to container
                        </p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background">
                        <X size={24} className="text-text-secondary" />
                    </button>
                </div>

                {/* Tabs & Search */}
                <div className="p-4 border-b border-border dark:border-dark-border space-y-4 flex-shrink-0">
                    {/* Tabs */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                activeTab === 'all' 
                                    ? 'bg-primary text-white' 
                                    : 'bg-background dark:bg-dark-background text-text dark:text-dark-text hover:bg-gray-100 dark:hover:bg-dark-border'
                            }`}
                        >
                            All ({counts.total})
                        </button>
                        <button
                            onClick={() => setActiveTab('pallets')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                activeTab === 'pallets' 
                                    ? 'bg-blue-600 text-white' 
                                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40'
                            }`}
                        >
                            <Package size={16} /> Pallets ({counts.palletCount})
                        </button>
                        <button
                            onClick={() => setActiveTab('khatlis')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                                activeTab === 'khatlis' 
                                    ? 'bg-purple-600 text-white' 
                                    : 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/40'
                            }`}
                        >
                            <Boxes size={16} /> Khatlis ({counts.khatliCount})
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                        <input
                            type="text"
                            placeholder="Search by tile name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {loading && (
                        <div className="flex justify-center items-center h-full">
                            <Loader2 size={32} className="animate-spin text-primary" />
                        </div>
                    )}
                    {error && <div className="text-red-500 text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">{error}</div>}
                    
                    {!loading && aggregatedData.map((factoryGroup) => {
                        const hasPallets = factoryGroup.pallets.tileGroups.length > 0;
                        const hasKhatlis = factoryGroup.khatlis.tileGroups.length > 0;
                        
                        if (!hasPallets && !hasKhatlis) return null;

                        return (
                            <div key={factoryGroup.factory._id} className="space-y-4">
                                {/* Factory Header */}
                                <div className="flex items-center gap-3 pb-2 border-b border-border dark:border-dark-border">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
                                        <Warehouse size={20} className="text-white" />
                                    </div>
                                    <h2 className="text-lg font-bold text-text dark:text-dark-text">
                                        {factoryGroup.factory.name}
                                    </h2>
                                </div>

                                {/* Pallets Section */}
                                {(activeTab === 'all' || activeTab === 'pallets') && renderTypeSection(factoryGroup, 'Pallet')}

                                {/* Khatlis Section */}
                                {(activeTab === 'all' || activeTab === 'khatlis') && renderTypeSection(factoryGroup, 'Khatli')}
                            </div>
                        );
                    })}

                    {!loading && aggregatedData.length === 0 && (
                        <div className="text-center text-text-secondary dark:text-dark-text-secondary py-16">
                            <Package size={48} className="mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium">No available items found</p>
                            <p className="text-sm">Try adjusting your search or filter</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-background dark:bg-dark-background border-t border-border dark:border-dark-border flex flex-col sm:flex-row justify-between items-center gap-4 flex-shrink-0">
                    <div className="flex items-center gap-4">
                        <p className="text-sm font-semibold text-text dark:text-dark-text">
                            Selected: {selectedPalletIds.size} items
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full flex items-center gap-1">
                                <Package size={12} /> {counts.selectedPallets} Pallets
                            </span>
                            <span className="text-xs px-2 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full flex items-center gap-1">
                                <Boxes size={12} /> {counts.selectedKhatlis} Khatlis
                            </span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            onClick={onClose} 
                            className="px-4 py-2.5 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleConfirm} 
                            className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
                        >
                            <Check size={16} /> Confirm Selection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PalletSelectionModal;