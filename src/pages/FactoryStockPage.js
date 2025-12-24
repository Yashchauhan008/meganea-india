import React, { useState, useEffect, useMemo } from 'react';
import { getAllFactories } from '../api/factoryApi';
import { getAllFactoryStock, getFactoryStock, getFactoryStockSummary } from '../api/palletApi';
import { Loader2, Warehouse, Box, Layers, Ruler, Package, Grid, List, Search, AlertCircle, Boxes, Plus, Edit2 } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import CreateCustomPalletModal from '../components/pallets/CreateCustomPalletModal';
import EditPalletModal from '../components/pallets/EditPalletModal';

const FactoryStockPage = () => {
    // State management
    const [factories, setFactories] = useState([]);
    const [tiles, setTiles] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState('');
    const [allFactoryStock, setAllFactoryStock] = useState([]);
    const [selectedFactoryStock, setSelectedFactoryStock] = useState([]);
    const [selectedFactorySummary, setSelectedFactorySummary] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detail'
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPallet, setEditingPallet] = useState(null);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch factories and tiles on mount
    useEffect(() => {
        const fetchFactoriesAndTiles = async () => {
            try {
                const { data: factoriesData } = await getAllFactories();
                setFactories(factoriesData);
                if (factoriesData.length > 0) {
                    setSelectedFactory(factoriesData[0]._id);
                }

                // Extract unique tiles from all stock
                const { data: stockData } = await getAllFactoryStock();
                const uniqueTiles = {};
                stockData.forEach(item => {
                    if (item.tile && !uniqueTiles[item.tile._id]) {
                        uniqueTiles[item.tile._id] = item.tile;
                    }
                });
                setTiles(Object.values(uniqueTiles));
            } catch (err) {
                setError('Failed to fetch factories and tiles.');
                console.error(err);
            }
        };
        fetchFactoriesAndTiles();
    }, []);

    // Fetch all factory stock for summary view
    useEffect(() => {
        const fetchAllStock = async () => {
            try {
                const { data } = await getAllFactoryStock();
                setAllFactoryStock(data);
                
                // Update tiles if new ones are found
                const uniqueTiles = {};
                data.forEach(item => {
                    if (item.tile && !uniqueTiles[item.tile._id]) {
                        uniqueTiles[item.tile._id] = item.tile;
                    }
                });
                setTiles(prev => {
                    const updated = { ...prev };
                    Object.values(uniqueTiles).forEach(tile => {
                        updated[tile._id] = tile;
                    });
                    return Object.values(updated);
                });
            } catch (err) {
                console.error('Failed to fetch all factory stock:', err);
            }
        };
        fetchAllStock();
    }, []);

    // Fetch stock for selected factory
    useEffect(() => {
        if (!selectedFactory) {
            setSelectedFactoryStock([]);
            setSelectedFactorySummary(null);
            return;
        }

        const fetchFactoryData = async () => {
            setLoading(true);
            setError('');
            try {
                const { data: stockData } = await getFactoryStock(selectedFactory);
                setSelectedFactoryStock(stockData);

                const { data: summaryData } = await getFactoryStockSummary(selectedFactory);
                setSelectedFactorySummary(summaryData);
            } catch (err) {
                setError('Failed to fetch stock for the selected factory.');
                setSelectedFactoryStock([]);
                setSelectedFactorySummary(null);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchFactoryData();
    }, [selectedFactory]);

    // Aggregate data for summary view
    const aggregatedAllStock = useMemo(() => {
        const filtered = allFactoryStock.filter(pallet =>
            (pallet.tile?.name?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase()) ||
            (pallet.factory?.name?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase())
        );

        const factoryGroups = {};
        filtered.forEach(pallet => {
            const factoryId = pallet.factory?._id || 'unknown';

            if (!factoryGroups[factoryId]) {
                factoryGroups[factoryId] = {
                    factory: pallet.factory,
                    tiles: {},
                    totalPalletCount: 0,
                    totalKhatliCount: 0,
                    totalPalletBoxes: 0,
                    totalKhatliBoxes: 0
                };
            }

            const tileId = pallet.tile?._id || 'unknown';
            const itemType = pallet.type;

            if (!factoryGroups[factoryId].tiles[tileId]) {
                factoryGroups[factoryId].tiles[tileId] = {
                    tile: pallet.tile,
                    pallets: { count: 0, totalBoxes: 0 },
                    khatlis: { count: 0, totalBoxes: 0 }
                };
            }

            if (itemType === 'Pallet') {
                factoryGroups[factoryId].tiles[tileId].pallets.count += 1;
                factoryGroups[factoryId].tiles[tileId].pallets.totalBoxes += pallet.boxCount;
                factoryGroups[factoryId].totalPalletCount += 1;
                factoryGroups[factoryId].totalPalletBoxes += pallet.boxCount;
            } else if (itemType === 'Khatli') {
                factoryGroups[factoryId].tiles[tileId].khatlis.count += 1;
                factoryGroups[factoryId].tiles[tileId].khatlis.totalBoxes += pallet.boxCount;
                factoryGroups[factoryId].totalKhatliCount += 1;
                factoryGroups[factoryId].totalKhatliBoxes += pallet.boxCount;
            }
        });

        return Object.values(factoryGroups);
    }, [allFactoryStock, debouncedSearchTerm]);

    // Aggregate data for detail view
    const aggregatedSelectedFactory = useMemo(() => {
        const filtered = selectedFactoryStock.filter(pallet =>
            (pallet.tile?.name?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase())
        );

        const pallets = {};
        const khatlis = {};

        filtered.forEach(pallet => {
            const tileId = pallet.tile?._id || 'unknown';
            const itemType = pallet.type;

            if (itemType === 'Pallet') {
                if (!pallets[tileId]) {
                    pallets[tileId] = {
                        tile: pallet.tile,
                        boxCountGroups: {}
                    };
                }
                const boxCount = pallet.boxCount;
                if (!pallets[tileId].boxCountGroups[boxCount]) {
                    pallets[tileId].boxCountGroups[boxCount] = {
                        boxCount,
                        items: []
                    };
                }
                pallets[tileId].boxCountGroups[boxCount].items.push(pallet);
            } else if (itemType === 'Khatli') {
                if (!khatlis[tileId]) {
                    khatlis[tileId] = {
                        tile: pallet.tile,
                        boxCountGroups: {}
                    };
                }
                const boxCount = pallet.boxCount;
                if (!khatlis[tileId].boxCountGroups[boxCount]) {
                    khatlis[tileId].boxCountGroups[boxCount] = {
                        boxCount,
                        items: []
                    };
                }
                khatlis[tileId].boxCountGroups[boxCount].items.push(pallet);
            }
        });

        return {
            pallets: Object.values(pallets).map(tg => ({
                ...tg,
                boxCountGroups: Object.values(tg.boxCountGroups)
            })),
            khatlis: Object.values(khatlis).map(tg => ({
                ...tg,
                boxCountGroups: Object.values(tg.boxCountGroups)
            }))
        };
    }, [selectedFactoryStock, debouncedSearchTerm]);

    const selectedFactoryName = factories.find(f => f._id === selectedFactory)?.name || 'Select Factory';

    const handleRefresh = async () => {
        setLoading(true);
        try {
            const { data: stockData } = await getFactoryStock(selectedFactory);
            setSelectedFactoryStock(stockData);

            const { data: summaryData } = await getFactoryStockSummary(selectedFactory);
            setSelectedFactorySummary(summaryData);

            const { data: allData } = await getAllFactoryStock();
            setAllFactoryStock(allData);
        } catch (err) {
            console.error('Failed to refresh:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text dark:text-dark-text">Factory Stock</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">Live inventory of QC-passed goods (Pallets & Khatlis).</p>
                </div>
            </div>

            {/* View Mode Toggle and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('summary')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            viewMode === 'summary'
                                ? 'bg-primary text-white'
                                : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'
                        }`}
                    >
                        <Grid size={18} /> Summary View
                    </button>
                    <button
                        onClick={() => setViewMode('detail')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            viewMode === 'detail'
                                ? 'bg-primary text-white'
                                : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'
                        }`}
                    >
                        <List size={18} /> Detail View
                    </button>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                    {viewMode === 'detail' && (
                        <select
                            value={selectedFactory}
                            onChange={(e) => setSelectedFactory(e.target.value)}
                            className="form-select flex-1 sm:flex-none sm:w-64"
                            disabled={factories.length === 0}
                        >
                            <option value="" disabled>Select a Factory</option>
                            {factories.map(factory => (
                                <option key={factory._id} value={factory._id}>{factory.name}</option>
                            ))}
                        </select>
                    )}

                    {viewMode === 'detail' && selectedFactory && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap"
                        >
                            <Plus size={18} /> Add Custom
                        </button>
                    )}
                </div>
            </div>

            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={20} />
                <input
                    type="text"
                    placeholder={viewMode === 'summary' ? 'Search by factory or tile name...' : 'Search by tile name...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full form-input pl-10"
                />
            </div>

            {/* Error Message */}
            {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                </div>
            )}

            {/* Content */}
            {viewMode === 'summary' ? (
                // SUMMARY VIEW
                <div className="space-y-6">
                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 size={40} className="animate-spin text-primary" />
                        </div>
                    ) : aggregatedAllStock.length === 0 ? (
                        <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-border dark:border-dark-border p-12 text-center">
                            <Warehouse size={48} className="mx-auto text-text-secondary mb-4 opacity-50" />
                            <p className="text-text-secondary dark:text-dark-text-secondary">No stock found across all factories.</p>
                        </div>
                    ) : (
                        aggregatedAllStock.map(factoryGroup => (
                            <div
                                key={factoryGroup.factory?._id}
                                className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                            >
                                {/* Factory Header */}
                                <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-dark-primary/20 dark:to-dark-primary/10 p-6 border-b border-border dark:border-dark-border">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-primary/20 dark:bg-dark-primary/30 p-3 rounded-lg">
                                                <Warehouse size={24} className="text-primary dark:text-dark-primary" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-text dark:text-dark-text">{factoryGroup.factory?.name}</h2>
                                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{factoryGroup.factory?.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Summary Stats */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        <div className="bg-white/50 dark:bg-dark-background/50 rounded-lg p-3">
                                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pallets</p>
                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{factoryGroup.totalPalletCount}</p>
                                        </div>
                                        <div className="bg-white/50 dark:bg-dark-background/50 rounded-lg p-3">
                                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Khatlis</p>
                                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{factoryGroup.totalKhatliCount}</p>
                                        </div>
                                        <div className="bg-white/50 dark:bg-dark-background/50 rounded-lg p-3">
                                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pallet Boxes</p>
                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{factoryGroup.totalPalletBoxes}</p>
                                        </div>
                                        <div className="bg-white/50 dark:bg-dark-background/50 rounded-lg p-3">
                                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Khatli Boxes</p>
                                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{factoryGroup.totalKhatliBoxes}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Stock Cards */}
                                <div className="p-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.values(factoryGroup.tiles).map(tileStock => (
                                            <div
                                                key={tileStock.tile?._id}
                                                className="bg-background dark:bg-dark-background rounded-lg p-5 border border-border dark:border-dark-border hover:shadow-md transition-shadow"
                                            >
                                                {/* Tile Header */}
                                                <div className="mb-4 pb-4 border-b border-border dark:border-dark-border">
                                                    <h4 className="font-semibold text-text dark:text-dark-text text-lg flex items-center gap-2 mb-2">
                                                        <Box size={18} className="text-primary" />
                                                        {tileStock.tile?.name}
                                                    </h4>
                                                    <div className="flex gap-4 text-xs">
                                                        <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                                                            <Ruler size={12} /> {tileStock.tile?.size}
                                                        </span>
                                                        <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                                                            <Layers size={12} /> {tileStock.tile?.surface}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Pallet and Khatli Info */}
                                                <div className="space-y-3">
                                                    {tileStock.pallets.count > 0 && (
                                                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded">
                                                                    <Box size={16} className="text-blue-600 dark:text-blue-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm">Pallets</p>
                                                                    <p className="text-xs text-blue-600 dark:text-blue-400">{tileStock.pallets.totalBoxes} boxes</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{tileStock.pallets.count}</p>
                                                        </div>
                                                    )}

                                                    {tileStock.khatlis.count > 0 && (
                                                        <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-900/50">
                                                            <div className="flex items-center gap-3">
                                                                <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded">
                                                                    <Boxes size={16} className="text-purple-600 dark:text-purple-400" />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-purple-700 dark:text-purple-300 text-sm">Khatlis</p>
                                                                    <p className="text-xs text-purple-600 dark:text-purple-400">{tileStock.khatlis.totalBoxes} boxes</p>
                                                                </div>
                                                            </div>
                                                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{tileStock.khatlis.count}</p>
                                                        </div>
                                                    )}

                                                    {tileStock.pallets.count === 0 && tileStock.khatlis.count === 0 && (
                                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary text-center py-2">No stock available</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            ) : (
                // DETAIL VIEW
                <div className="space-y-6">
                    {selectedFactory && selectedFactorySummary && (
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-blue-200 dark:border-blue-900/50 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Pallets</p>
                                        <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{selectedFactorySummary.byType.pallets.count}</p>
                                    </div>
                                    <Box size={32} className="text-blue-600/30 dark:text-blue-400/30" />
                                </div>
                            </div>
                            <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-purple-200 dark:border-purple-900/50 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Khatlis</p>
                                        <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mt-2">{selectedFactorySummary.byType.khatlis.count}</p>
                                    </div>
                                    <Boxes size={32} className="text-purple-600/30 dark:text-purple-400/30" />
                                </div>
                            </div>
                            <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-border dark:border-dark-border p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Pallet Boxes</p>
                                        <p className="text-3xl font-bold text-primary dark:text-dark-primary mt-2">{selectedFactorySummary.byType.pallets.totalBoxes}</p>
                                    </div>
                                    <Package size={32} className="text-primary/30 dark:text-dark-primary/30" />
                                </div>
                            </div>
                            <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-border dark:border-dark-border p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Khatli Boxes</p>
                                        <p className="text-3xl font-bold text-primary dark:text-dark-primary mt-2">{selectedFactorySummary.byType.khatlis.totalBoxes}</p>
                                    </div>
                                    <Package size={32} className="text-primary/30 dark:text-dark-primary/30" />
                                </div>
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center py-20">
                            <Loader2 size={40} className="animate-spin text-primary" />
                        </div>
                    ) : aggregatedSelectedFactory.pallets.length === 0 && aggregatedSelectedFactory.khatlis.length === 0 ? (
                        <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-border dark:border-dark-border p-12 text-center">
                            <Warehouse size={48} className="mx-auto text-text-secondary mb-4 opacity-50" />
                            <p className="text-text-secondary dark:text-dark-text-secondary">No stock found for {selectedFactoryName}.</p>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            {/* Pallets Section */}
                            {aggregatedSelectedFactory.pallets.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2">
                                        <Box size={24} /> Pallets
                                    </h2>
                                    <div className="space-y-4">
                                        {aggregatedSelectedFactory.pallets.map(tileGroup => (
                                            <div
                                                key={tileGroup.tile?._id}
                                                className="bg-foreground dark:bg-dark-foreground rounded-lg border border-blue-200 dark:border-blue-900/50 overflow-hidden hover:shadow-md transition-shadow"
                                            >
                                                <div className="bg-gradient-to-r from-blue-50 to-blue-25 dark:from-blue-900/20 dark:to-blue-900/10 p-4 border-b border-blue-200 dark:border-blue-900/50">
                                                    <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
                                                        <Box size={18} className="text-blue-600 dark:text-blue-400" />
                                                        {tileGroup.tile?.name}
                                                    </h3>
                                                    <div className="flex gap-4 mt-2 text-sm">
                                                        <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                                                            <Ruler size={14} /> {tileGroup.tile?.size}
                                                        </span>
                                                        <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                                                            <Layers size={14} /> {tileGroup.tile?.surface}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-4 space-y-3">
                                                    {tileGroup.boxCountGroups.map(boxGroup => (
                                                        <div
                                                            key={boxGroup.boxCount}
                                                            className="bg-background dark:bg-dark-background rounded-lg p-4 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-700 transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
                                                                    <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">{boxGroup.items.length}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-text dark:text-dark-text">{boxGroup.boxCount} boxes per pallet</p>
                                                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                                                                        Total: {boxGroup.items.length * boxGroup.boxCount} boxes
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-right">
                                                                    <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                                                                        {boxGroup.items.length} pallet{boxGroup.items.length !== 1 ? 's' : ''}
                                                                    </p>
                                                                </div>
                                                                {boxGroup.items.length === 1 && (
                                                                    <button
                                                                        onClick={() => setEditingPallet(boxGroup.items[0])}
                                                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        title="Edit pallet"
                                                                    >
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Khatlis Section */}
                            {aggregatedSelectedFactory.khatlis.length > 0 && (
                                <div>
                                    <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-6 flex items-center gap-2">
                                        <Boxes size={24} /> Khatlis
                                    </h2>
                                    <div className="space-y-4">
                                        {aggregatedSelectedFactory.khatlis.map(tileGroup => (
                                            <div
                                                key={tileGroup.tile?._id}
                                                className="bg-foreground dark:bg-dark-foreground rounded-lg border border-purple-200 dark:border-purple-900/50 overflow-hidden hover:shadow-md transition-shadow"
                                            >
                                                <div className="bg-gradient-to-r from-purple-50 to-purple-25 dark:from-purple-900/20 dark:to-purple-900/10 p-4 border-b border-purple-200 dark:border-purple-900/50">
                                                    <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
                                                        <Boxes size={18} className="text-purple-600 dark:text-purple-400" />
                                                        {tileGroup.tile?.name}
                                                    </h3>
                                                    <div className="flex gap-4 mt-2 text-sm">
                                                        <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                                                            <Ruler size={14} /> {tileGroup.tile?.size}
                                                        </span>
                                                        <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
                                                            <Layers size={14} /> {tileGroup.tile?.surface}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-4 space-y-3">
                                                    {tileGroup.boxCountGroups.map(boxGroup => (
                                                        <div
                                                            key={boxGroup.boxCount}
                                                            className="bg-background dark:bg-dark-background rounded-lg p-4 border border-purple-200 dark:border-purple-900/50 flex items-center justify-between hover:border-purple-400 dark:hover:border-purple-700 transition-colors group"
                                                        >
                                                            <div className="flex items-center gap-4">
                                                                <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-2 rounded-lg">
                                                                    <p className="font-bold text-purple-600 dark:text-purple-400 text-lg">{boxGroup.items.length}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="font-medium text-text dark:text-dark-text">{boxGroup.boxCount} boxes per khatli</p>
                                                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                                                                        Total: {boxGroup.items.length * boxGroup.boxCount} boxes
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <div className="text-right">
                                                                    <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                                                                        {boxGroup.items.length} khatli{boxGroup.items.length !== 1 ? 's' : ''}
                                                                    </p>
                                                                </div>
                                                                {boxGroup.items.length === 1 && (
                                                                    <button
                                                                        onClick={() => setEditingPallet(boxGroup.items[0])}
                                                                        className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                                        title="Edit khatli"
                                                                    >
                                                                        <Edit2 size={16} />
                                                                    </button>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Create Custom Pallet Modal */}
            {showCreateModal && selectedFactory && (
                <CreateCustomPalletModal
                    factory={factories.find(f => f._id === selectedFactory)}
                    tiles={tiles}
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        handleRefresh();
                    }}
                />
            )}

            {/* Edit Pallet Modal */}
            {editingPallet && (
                <EditPalletModal
                    pallet={editingPallet}
                    tile={editingPallet.tile}
                    onClose={() => setEditingPallet(null)}
                    onSuccess={() => {
                        setEditingPallet(null);
                        handleRefresh();
                    }}
                />
            )}
        </div>
    );
};

export default FactoryStockPage;
