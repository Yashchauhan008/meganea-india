// import React, { useState, useEffect, useMemo, useCallback } from 'react';
// import { getAllFactories } from '../api/factoryApi';
// import { getAllFactoryStock, getFactoryStock, getFactoryStockSummary } from '../api/palletApi';
// import { Loader2, Warehouse, Box, Layers, Ruler, Package, Grid, List, Search, AlertCircle, Boxes, Plus, Edit2, RefreshCw } from 'lucide-react';
// import useDebounce from '../hooks/useDebounce';
// import CreateCustomPalletModal from '../components/pallets/CreateCustomPalletModal';
// import EditPalletModal from '../components/pallets/EditPalletModal';

// const FactoryStockPage = () => {
//     // State management
//     const [factories, setFactories] = useState([]);
//     const [tiles, setTiles] = useState([]);
//     const [selectedFactory, setSelectedFactory] = useState('');
//     const [allFactoryStock, setAllFactoryStock] = useState([]);
//     const [selectedFactoryStock, setSelectedFactoryStock] = useState([]);
//     const [selectedFactorySummary, setSelectedFactorySummary] = useState(null);
//     const [loading, setLoading] = useState(true); // Start with loading true
//     const [initialLoading, setInitialLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [searchTerm, setSearchTerm] = useState('');
//     const [viewMode, setViewMode] = useState('summary'); // 'summary' or 'detail'
//     const [showCreateModal, setShowCreateModal] = useState(false);
//     const [editingPallet, setEditingPallet] = useState(null);
//     const debouncedSearchTerm = useDebounce(searchTerm, 300);

//     // Fetch factories and all stock on mount
//     useEffect(() => {
//         const fetchInitialData = async () => {
//             setInitialLoading(true);
//             setError('');
//             try {
//                 // Fetch factories
//                 const factoriesResponse = await getAllFactories();
//                 const factoriesData = factoriesResponse.data || factoriesResponse || [];
//                 setFactories(factoriesData);
                
//                 if (factoriesData.length > 0) {
//                     setSelectedFactory(factoriesData[0]._id);
//                 }

//                 // Fetch all factory stock
//                 const stockResponse = await getAllFactoryStock();
//                 const stockData = stockResponse.data || stockResponse || [];
//                 setAllFactoryStock(stockData);
                
//                 // Extract unique tiles from stock
//                 const uniqueTiles = {};
//                 stockData.forEach(item => {
//                     if (item.tile && item.tile._id && !uniqueTiles[item.tile._id]) {
//                         uniqueTiles[item.tile._id] = item.tile;
//                     }
//                 });
//                 setTiles(Object.values(uniqueTiles));
                
//             } catch (err) {
//                 console.error('Failed to fetch initial data:', err);
//                 setError('Failed to fetch factories and stock data. Please refresh the page.');
//             } finally {
//                 setInitialLoading(false);
//                 setLoading(false);
//             }
//         };
        
//         fetchInitialData();
//     }, []);

//     // Fetch stock for selected factory (detail view)
//     useEffect(() => {
//         if (!selectedFactory || viewMode !== 'detail') {
//             return;
//         }

//         const fetchFactoryData = async () => {
//             setLoading(true);
//             setError('');
//             try {
//                 const stockResponse = await getFactoryStock(selectedFactory);
//                 const stockData = stockResponse.data || stockResponse || [];
//                 setSelectedFactoryStock(stockData);

//                 const summaryResponse = await getFactoryStockSummary(selectedFactory);
//                 const summaryData = summaryResponse.data || summaryResponse || null;
//                 setSelectedFactorySummary(summaryData);
//             } catch (err) {
//                 console.error('Failed to fetch factory stock:', err);
//                 setError('Failed to fetch stock for the selected factory.');
//                 setSelectedFactoryStock([]);
//                 setSelectedFactorySummary(null);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchFactoryData();
//     }, [selectedFactory, viewMode]);

//     // Aggregate data for summary view
//     const aggregatedAllStock = useMemo(() => {
//         if (!allFactoryStock || allFactoryStock.length === 0) return [];
        
//         const filtered = allFactoryStock.filter(pallet =>
//             (pallet.tile?.name?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase()) ||
//             (pallet.factory?.name?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase())
//         );

//         const factoryGroups = {};
//         filtered.forEach(pallet => {
//             const factoryId = pallet.factory?._id || 'unknown';

//             if (!factoryGroups[factoryId]) {
//                 factoryGroups[factoryId] = {
//                     factory: pallet.factory,
//                     tiles: {},
//                     totalPalletCount: 0,
//                     totalKhatliCount: 0,
//                     totalPalletBoxes: 0,
//                     totalKhatliBoxes: 0
//                 };
//             }

//             const tileId = pallet.tile?._id || 'unknown';
//             const itemType = pallet.type;

//             if (!factoryGroups[factoryId].tiles[tileId]) {
//                 factoryGroups[factoryId].tiles[tileId] = {
//                     tile: pallet.tile,
//                     pallets: { count: 0, totalBoxes: 0 },
//                     khatlis: { count: 0, totalBoxes: 0 }
//                 };
//             }

//             if (itemType === 'Pallet') {
//                 factoryGroups[factoryId].tiles[tileId].pallets.count += 1;
//                 factoryGroups[factoryId].tiles[tileId].pallets.totalBoxes += pallet.boxCount || 0;
//                 factoryGroups[factoryId].totalPalletCount += 1;
//                 factoryGroups[factoryId].totalPalletBoxes += pallet.boxCount || 0;
//             } else if (itemType === 'Khatli') {
//                 factoryGroups[factoryId].tiles[tileId].khatlis.count += 1;
//                 factoryGroups[factoryId].tiles[tileId].khatlis.totalBoxes += pallet.boxCount || 0;
//                 factoryGroups[factoryId].totalKhatliCount += 1;
//                 factoryGroups[factoryId].totalKhatliBoxes += pallet.boxCount || 0;
//             }
//         });

//         return Object.values(factoryGroups);
//     }, [allFactoryStock, debouncedSearchTerm]);

//     // Aggregate data for detail view
//     const aggregatedSelectedFactory = useMemo(() => {
//         if (!selectedFactoryStock || selectedFactoryStock.length === 0) {
//             return { pallets: [], khatlis: [] };
//         }
        
//         const filtered = selectedFactoryStock.filter(pallet =>
//             (pallet.tile?.name?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase())
//         );

//         const pallets = {};
//         const khatlis = {};

//         filtered.forEach(pallet => {
//             const tileId = pallet.tile?._id || 'unknown';
//             const itemType = pallet.type;

//             if (itemType === 'Pallet') {
//                 if (!pallets[tileId]) {
//                     pallets[tileId] = {
//                         tile: pallet.tile,
//                         boxCountGroups: {}
//                     };
//                 }
//                 const boxCount = pallet.boxCount;
//                 if (!pallets[tileId].boxCountGroups[boxCount]) {
//                     pallets[tileId].boxCountGroups[boxCount] = {
//                         boxCount,
//                         items: []
//                     };
//                 }
//                 pallets[tileId].boxCountGroups[boxCount].items.push(pallet);
//             } else if (itemType === 'Khatli') {
//                 if (!khatlis[tileId]) {
//                     khatlis[tileId] = {
//                         tile: pallet.tile,
//                         boxCountGroups: {}
//                     };
//                 }
//                 const boxCount = pallet.boxCount;
//                 if (!khatlis[tileId].boxCountGroups[boxCount]) {
//                     khatlis[tileId].boxCountGroups[boxCount] = {
//                         boxCount,
//                         items: []
//                     };
//                 }
//                 khatlis[tileId].boxCountGroups[boxCount].items.push(pallet);
//             }
//         });

//         return {
//             pallets: Object.values(pallets).map(tg => ({
//                 ...tg,
//                 boxCountGroups: Object.values(tg.boxCountGroups)
//             })),
//             khatlis: Object.values(khatlis).map(tg => ({
//                 ...tg,
//                 boxCountGroups: Object.values(tg.boxCountGroups)
//             }))
//         };
//     }, [selectedFactoryStock, debouncedSearchTerm]);

//     const selectedFactoryName = factories.find(f => f._id === selectedFactory)?.name || 'Select Factory';

//     const handleRefresh = useCallback(async () => {
//         setLoading(true);
//         setError('');
//         try {
//             // Refresh all stock
//             const allStockResponse = await getAllFactoryStock();
//             const allData = allStockResponse.data || allStockResponse || [];
//             setAllFactoryStock(allData);

//             // If in detail view, also refresh selected factory
//             if (viewMode === 'detail' && selectedFactory) {
//                 const stockResponse = await getFactoryStock(selectedFactory);
//                 const stockData = stockResponse.data || stockResponse || [];
//                 setSelectedFactoryStock(stockData);

//                 const summaryResponse = await getFactoryStockSummary(selectedFactory);
//                 const summaryData = summaryResponse.data || summaryResponse || null;
//                 setSelectedFactorySummary(summaryData);
//             }
//         } catch (err) {
//             console.error('Failed to refresh:', err);
//             setError('Failed to refresh stock data.');
//         } finally {
//             setLoading(false);
//         }
//     }, [selectedFactory, viewMode]);

//     // Initial loading screen
//     if (initialLoading) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[60vh]">
//                 <Loader2 size={48} className="animate-spin text-primary mb-4" />
//                 <p className="text-text-secondary dark:text-dark-text-secondary">Loading factory stock...</p>
//             </div>
//         );
//     }

//     return (
//         <div className="space-y-6">
//             {/* Header */}
//             <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
//                 <div>
//                     <h1 className="text-3xl font-bold text-text dark:text-dark-text">Factory Stock</h1>
//                     <p className="text-text-secondary dark:text-dark-text-secondary">Live inventory of QC-passed goods (Pallets & Khatlis).</p>
//                 </div>
//                 <button
//                     onClick={handleRefresh}
//                     disabled={loading}
//                     className="flex items-center gap-2 px-4 py-2 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors disabled:opacity-50"
//                 >
//                     <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
//                     Refresh
//                 </button>
//             </div>

//             {/* View Mode Toggle and Controls */}
//             <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
//                 <div className="flex gap-2">
//                     <button
//                         onClick={() => setViewMode('summary')}
//                         className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//                             viewMode === 'summary'
//                                 ? 'bg-primary text-white'
//                                 : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'
//                         }`}
//                     >
//                         <Grid size={18} /> Summary View
//                     </button>
//                     <button
//                         onClick={() => setViewMode('detail')}
//                         className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
//                             viewMode === 'detail'
//                                 ? 'bg-primary text-white'
//                                 : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'
//                         }`}
//                     >
//                         <List size={18} /> Detail View
//                     </button>
//                 </div>

//                 <div className="flex gap-2 w-full sm:w-auto">
//                     {viewMode === 'detail' && (
//                         <select
//                             value={selectedFactory}
//                             onChange={(e) => setSelectedFactory(e.target.value)}
//                             className="form-select flex-1 sm:flex-none sm:w-64"
//                             disabled={factories.length === 0}
//                         >
//                             <option value="" disabled>Select a Factory</option>
//                             {factories.map(factory => (
//                                 <option key={factory._id} value={factory._id}>{factory.name}</option>
//                             ))}
//                         </select>
//                     )}

//                     {viewMode === 'detail' && selectedFactory && (
//                         <button
//                             onClick={() => setShowCreateModal(true)}
//                             className="flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors whitespace-nowrap"
//                         >
//                             <Plus size={18} /> Add Custom
//                         </button>
//                     )}
//                 </div>
//             </div>

//             {/* Search Bar */}
//             <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={20} />
//                 <input
//                     type="text"
//                     placeholder={viewMode === 'summary' ? 'Search by factory or tile name...' : 'Search by tile name...'}
//                     value={searchTerm}
//                     onChange={(e) => setSearchTerm(e.target.value)}
//                     className="w-full form-input pl-10"
//                 />
//             </div>

//             {/* Error Message */}
//             {error && (
//                 <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 p-4 rounded-lg flex items-start gap-3">
//                     <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
//                     <div>
//                         <p className="font-medium">Error</p>
//                         <p className="text-sm">{error}</p>
//                     </div>
//                 </div>
//             )}

//             {/* Content */}
//             {viewMode === 'summary' ? (
//                 // SUMMARY VIEW
//                 <div className="space-y-6">
//                     {loading ? (
//                         <div className="flex justify-center items-center py-20">
//                             <Loader2 size={40} className="animate-spin text-primary" />
//                         </div>
//                     ) : aggregatedAllStock.length === 0 ? (
//                         <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-border dark:border-dark-border p-12 text-center">
//                             <Warehouse size={48} className="mx-auto text-text-secondary mb-4 opacity-50" />
//                             <p className="text-text-secondary dark:text-dark-text-secondary mb-2">No stock found across all factories.</p>
//                             <p className="text-sm text-text-secondary/70 dark:text-dark-text-secondary/70">
//                                 Stock is added when Purchase Orders pass QC inspection, or you can add custom pallets in Detail View.
//                             </p>
//                         </div>
//                     ) : (
//                         aggregatedAllStock.map(factoryGroup => (
//                             <div
//                                 key={factoryGroup.factory?._id || 'unknown'}
//                                 className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-sm overflow-hidden hover:shadow-md transition-shadow"
//                             >
//                                 {/* Factory Header */}
//                                 <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-dark-primary/20 dark:to-dark-primary/10 p-6 border-b border-border dark:border-dark-border">
//                                     <div className="flex items-start justify-between mb-4">
//                                         <div className="flex items-center gap-4">
//                                             <div className="bg-primary/20 dark:bg-dark-primary/30 p-3 rounded-lg">
//                                                 <Warehouse size={24} className="text-primary dark:text-dark-primary" />
//                                             </div>
//                                             <div>
//                                                 <h2 className="text-xl font-bold text-text dark:text-dark-text">{factoryGroup.factory?.name || 'Unknown Factory'}</h2>
//                                                 <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{factoryGroup.factory?.address || ''}</p>
//                                             </div>
//                                         </div>
//                                     </div>

//                                     {/* Summary Stats */}
//                                     <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
//                                         <div className="bg-white/50 dark:bg-dark-background/50 rounded-lg p-3">
//                                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pallets</p>
//                                             <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{factoryGroup.totalPalletCount}</p>
//                                         </div>
//                                         <div className="bg-white/50 dark:bg-dark-background/50 rounded-lg p-3">
//                                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Khatlis</p>
//                                             <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{factoryGroup.totalKhatliCount}</p>
//                                         </div>
//                                         <div className="bg-white/50 dark:bg-dark-background/50 rounded-lg p-3">
//                                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pallet Boxes</p>
//                                             <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{factoryGroup.totalPalletBoxes.toLocaleString()}</p>
//                                         </div>
//                                         <div className="bg-white/50 dark:bg-dark-background/50 rounded-lg p-3">
//                                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Khatli Boxes</p>
//                                             <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{factoryGroup.totalKhatliBoxes.toLocaleString()}</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Stock Cards */}
//                                 <div className="p-6">
//                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                                         {Object.values(factoryGroup.tiles).map(tileStock => (
//                                             <div
//                                                 key={tileStock.tile?._id || Math.random()}
//                                                 className="bg-background dark:bg-dark-background rounded-lg p-5 border border-border dark:border-dark-border hover:shadow-md transition-shadow"
//                                             >
//                                                 {/* Tile Header */}
//                                                 <div className="mb-4 pb-4 border-b border-border dark:border-dark-border">
//                                                     <h4 className="font-semibold text-text dark:text-dark-text text-lg flex items-center gap-2 mb-2">
//                                                         <Box size={18} className="text-primary" />
//                                                         {tileStock.tile?.name || 'Unknown Tile'}
//                                                     </h4>
//                                                     <div className="flex gap-4 text-xs">
//                                                         <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
//                                                             <Ruler size={12} /> {tileStock.tile?.size || 'N/A'}
//                                                         </span>
//                                                         <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
//                                                             <Layers size={12} /> {tileStock.tile?.surface || 'N/A'}
//                                                         </span>
//                                                     </div>
//                                                 </div>

//                                                 {/* Pallet and Khatli Info */}
//                                                 <div className="space-y-3">
//                                                     {tileStock.pallets.count > 0 && (
//                                                         <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-900/50">
//                                                             <div className="flex items-center gap-3">
//                                                                 <div className="bg-blue-100 dark:bg-blue-900/40 p-2 rounded">
//                                                                     <Box size={16} className="text-blue-600 dark:text-blue-400" />
//                                                                 </div>
//                                                                 <div>
//                                                                     <p className="font-semibold text-blue-700 dark:text-blue-300 text-sm">Pallets</p>
//                                                                     <p className="text-xs text-blue-600 dark:text-blue-400">{tileStock.pallets.totalBoxes.toLocaleString()} boxes</p>
//                                                                 </div>
//                                                             </div>
//                                                             <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{tileStock.pallets.count}</p>
//                                                         </div>
//                                                     )}

//                                                     {tileStock.khatlis.count > 0 && (
//                                                         <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-900/50">
//                                                             <div className="flex items-center gap-3">
//                                                                 <div className="bg-purple-100 dark:bg-purple-900/40 p-2 rounded">
//                                                                     <Boxes size={16} className="text-purple-600 dark:text-purple-400" />
//                                                                 </div>
//                                                                 <div>
//                                                                     <p className="font-semibold text-purple-700 dark:text-purple-300 text-sm">Khatlis</p>
//                                                                     <p className="text-xs text-purple-600 dark:text-purple-400">{tileStock.khatlis.totalBoxes.toLocaleString()} boxes</p>
//                                                                 </div>
//                                                             </div>
//                                                             <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{tileStock.khatlis.count}</p>
//                                                         </div>
//                                                     )}

//                                                     {tileStock.pallets.count === 0 && tileStock.khatlis.count === 0 && (
//                                                         <p className="text-xs text-text-secondary dark:text-dark-text-secondary text-center py-2">No stock available</p>
//                                                     )}
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             </div>
//                         ))
//                     )}
//                 </div>
//             ) : (
//                 // DETAIL VIEW
//                 <div className="space-y-6">
//                     {!selectedFactory ? (
//                         <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-border dark:border-dark-border p-12 text-center">
//                             <Warehouse size={48} className="mx-auto text-text-secondary mb-4 opacity-50" />
//                             <p className="text-text-secondary dark:text-dark-text-secondary">Please select a factory to view detailed stock.</p>
//                         </div>
//                     ) : loading ? (
//                         <div className="flex justify-center items-center py-20">
//                             <Loader2 size={40} className="animate-spin text-primary" />
//                         </div>
//                     ) : (
//                         <>
//                             {/* Factory Summary Cards */}
//                             {selectedFactorySummary && (
//                                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
//                                     <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-blue-200 dark:border-blue-900/50 p-6">
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Pallets</p>
//                                                 <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{selectedFactorySummary.byType?.pallets?.count || 0}</p>
//                                             </div>
//                                             <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-lg">
//                                                 <Package size={24} className="text-blue-600 dark:text-blue-400" />
//                                             </div>
//                                         </div>
//                                         <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">
//                                             {(selectedFactorySummary.byType?.pallets?.totalBoxes || 0).toLocaleString()} boxes
//                                         </p>
//                                     </div>

//                                     <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-purple-200 dark:border-purple-900/50 p-6">
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Khatlis</p>
//                                                 <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{selectedFactorySummary.byType?.khatlis?.count || 0}</p>
//                                             </div>
//                                             <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
//                                                 <Boxes size={24} className="text-purple-600 dark:text-purple-400" />
//                                             </div>
//                                         </div>
//                                         <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">
//                                             {(selectedFactorySummary.byType?.khatlis?.totalBoxes || 0).toLocaleString()} boxes
//                                         </p>
//                                     </div>

//                                     <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-green-200 dark:border-green-900/50 p-6">
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Items</p>
//                                                 <p className="text-3xl font-bold text-green-600 dark:text-green-400">{selectedFactorySummary.totalItems || 0}</p>
//                                             </div>
//                                             <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-lg">
//                                                 <Layers size={24} className="text-green-600 dark:text-green-400" />
//                                             </div>
//                                         </div>
//                                         <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">Pallets + Khatlis</p>
//                                     </div>

//                                     <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-orange-200 dark:border-orange-900/50 p-6">
//                                         <div className="flex items-center justify-between">
//                                             <div>
//                                                 <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Boxes</p>
//                                                 <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">{(selectedFactorySummary.totalBoxes || 0).toLocaleString()}</p>
//                                             </div>
//                                             <div className="bg-orange-100 dark:bg-orange-900/30 p-3 rounded-lg">
//                                                 <Box size={24} className="text-orange-600 dark:text-orange-400" />
//                                             </div>
//                                         </div>
//                                         <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">Across all items</p>
//                                     </div>
//                                 </div>
//                             )}

//                             {/* No Stock Message */}
//                             {aggregatedSelectedFactory.pallets.length === 0 && aggregatedSelectedFactory.khatlis.length === 0 && (
//                                 <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-border dark:border-dark-border p-12 text-center">
//                                     <Warehouse size={48} className="mx-auto text-text-secondary mb-4 opacity-50" />
//                                     <p className="text-text-secondary dark:text-dark-text-secondary mb-2">No stock found for {selectedFactoryName}.</p>
//                                     <p className="text-sm text-text-secondary/70 dark:text-dark-text-secondary/70 mb-4">
//                                         Click "Add Custom" to manually add pallets or khatlis.
//                                     </p>
//                                     <button
//                                         onClick={() => setShowCreateModal(true)}
//                                         className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors"
//                                     >
//                                         <Plus size={18} /> Add Custom Pallet/Khatli
//                                     </button>
//                                 </div>
//                             )}

//                             {/* Pallets Section */}
//                             {aggregatedSelectedFactory.pallets.length > 0 && (
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2">
//                                         <Package size={24} /> Pallets
//                                     </h2>
//                                     <div className="space-y-4">
//                                         {aggregatedSelectedFactory.pallets.map(tileGroup => (
//                                             <div
//                                                 key={tileGroup.tile?._id || Math.random()}
//                                                 className="bg-foreground dark:bg-dark-foreground rounded-lg border border-blue-200 dark:border-blue-900/50 overflow-hidden hover:shadow-md transition-shadow"
//                                             >
//                                                 <div className="bg-gradient-to-r from-blue-50 to-blue-25 dark:from-blue-900/20 dark:to-blue-900/10 p-4 border-b border-blue-200 dark:border-blue-900/50">
//                                                     <h3 className="text-lg font-bold text-blue-700 dark:text-blue-300 flex items-center gap-2">
//                                                         <Package size={18} className="text-blue-600 dark:text-blue-400" />
//                                                         {tileGroup.tile?.name || 'Unknown Tile'}
//                                                     </h3>
//                                                     <div className="flex gap-4 mt-2 text-sm">
//                                                         <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
//                                                             <Ruler size={14} /> {tileGroup.tile?.size || 'N/A'}
//                                                         </span>
//                                                         <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
//                                                             <Layers size={14} /> {tileGroup.tile?.surface || 'N/A'}
//                                                         </span>
//                                                     </div>
//                                                 </div>

//                                                 <div className="p-4 space-y-3">
//                                                     {tileGroup.boxCountGroups.map(boxGroup => (
//                                                         <div
//                                                             key={boxGroup.boxCount}
//                                                             className="bg-background dark:bg-dark-background rounded-lg p-4 border border-blue-200 dark:border-blue-900/50 flex items-center justify-between hover:border-blue-400 dark:hover:border-blue-700 transition-colors group"
//                                                         >
//                                                             <div className="flex items-center gap-4">
//                                                                 <div className="bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded-lg">
//                                                                     <p className="font-bold text-blue-600 dark:text-blue-400 text-lg">{boxGroup.items.length}</p>
//                                                                 </div>
//                                                                 <div>
//                                                                     <p className="font-medium text-text dark:text-dark-text">{boxGroup.boxCount} boxes per pallet</p>
//                                                                     <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
//                                                                         Total: {(boxGroup.items.length * boxGroup.boxCount).toLocaleString()} boxes
//                                                                     </p>
//                                                                 </div>
//                                                             </div>
//                                                             <div className="flex items-center gap-3">
//                                                                 <div className="text-right">
//                                                                     <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
//                                                                         {boxGroup.items.length} pallet{boxGroup.items.length !== 1 ? 's' : ''}
//                                                                     </p>
//                                                                 </div>
//                                                                 {boxGroup.items.length === 1 && (
//                                                                     <button
//                                                                         onClick={() => setEditingPallet(boxGroup.items[0])}
//                                                                         className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
//                                                                         title="Edit pallet"
//                                                                     >
//                                                                         <Edit2 size={16} />
//                                                                     </button>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}

//                             {/* Khatlis Section */}
//                             {aggregatedSelectedFactory.khatlis.length > 0 && (
//                                 <div>
//                                     <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-6 flex items-center gap-2">
//                                         <Boxes size={24} /> Khatlis
//                                     </h2>
//                                     <div className="space-y-4">
//                                         {aggregatedSelectedFactory.khatlis.map(tileGroup => (
//                                             <div
//                                                 key={tileGroup.tile?._id || Math.random()}
//                                                 className="bg-foreground dark:bg-dark-foreground rounded-lg border border-purple-200 dark:border-purple-900/50 overflow-hidden hover:shadow-md transition-shadow"
//                                             >
//                                                 <div className="bg-gradient-to-r from-purple-50 to-purple-25 dark:from-purple-900/20 dark:to-purple-900/10 p-4 border-b border-purple-200 dark:border-purple-900/50">
//                                                     <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300 flex items-center gap-2">
//                                                         <Boxes size={18} className="text-purple-600 dark:text-purple-400" />
//                                                         {tileGroup.tile?.name || 'Unknown Tile'}
//                                                     </h3>
//                                                     <div className="flex gap-4 mt-2 text-sm">
//                                                         <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
//                                                             <Ruler size={14} /> {tileGroup.tile?.size || 'N/A'}
//                                                         </span>
//                                                         <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-1">
//                                                             <Layers size={14} /> {tileGroup.tile?.surface || 'N/A'}
//                                                         </span>
//                                                     </div>
//                                                 </div>

//                                                 <div className="p-4 space-y-3">
//                                                     {tileGroup.boxCountGroups.map(boxGroup => (
//                                                         <div
//                                                             key={boxGroup.boxCount}
//                                                             className="bg-background dark:bg-dark-background rounded-lg p-4 border border-purple-200 dark:border-purple-900/50 flex items-center justify-between hover:border-purple-400 dark:hover:border-purple-700 transition-colors group"
//                                                         >
//                                                             <div className="flex items-center gap-4">
//                                                                 <div className="bg-purple-100 dark:bg-purple-900/30 px-3 py-2 rounded-lg">
//                                                                     <p className="font-bold text-purple-600 dark:text-purple-400 text-lg">{boxGroup.items.length}</p>
//                                                                 </div>
//                                                                 <div>
//                                                                     <p className="font-medium text-text dark:text-dark-text">{boxGroup.boxCount} boxes per khatli</p>
//                                                                     <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
//                                                                         Total: {(boxGroup.items.length * boxGroup.boxCount).toLocaleString()} boxes
//                                                                     </p>
//                                                                 </div>
//                                                             </div>
//                                                             <div className="flex items-center gap-3">
//                                                                 <div className="text-right">
//                                                                     <p className="text-sm font-semibold text-purple-600 dark:text-purple-400">
//                                                                         {boxGroup.items.length} khatli{boxGroup.items.length !== 1 ? 's' : ''}
//                                                                     </p>
//                                                                 </div>
//                                                                 {boxGroup.items.length === 1 && (
//                                                                     <button
//                                                                         onClick={() => setEditingPallet(boxGroup.items[0])}
//                                                                         className="p-2 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
//                                                                         title="Edit khatli"
//                                                                     >
//                                                                         <Edit2 size={16} />
//                                                                     </button>
//                                                                 )}
//                                                             </div>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         ))}
//                                     </div>
//                                 </div>
//                             )}
//                         </>
//                     )}
//                 </div>
//             )}

//             {/* Create Custom Pallet Modal */}
//             {showCreateModal && selectedFactory && (
//                 <CreateCustomPalletModal
//                     factory={factories.find(f => f._id === selectedFactory)}
//                     tiles={tiles}
//                     onClose={() => setShowCreateModal(false)}
//                     onSuccess={() => {
//                         setShowCreateModal(false);
//                         handleRefresh();
//                     }}
//                 />
//             )}

//             {/* Edit Pallet Modal */}
//             {editingPallet && (
//                 <EditPalletModal
//                     pallet={editingPallet}
//                     tile={editingPallet.tile}
//                     onClose={() => setEditingPallet(null)}
//                     onSuccess={() => {
//                         setEditingPallet(null);
//                         handleRefresh();
//                     }}
//                 />
//             )}
//         </div>
//     );
// };

// export default FactoryStockPage;



// FILE LOCATION: src/pages/FactoryStockPage.js

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getAllFactories } from '../api/factoryApi';
import { getAllFactoryStock, getFactoryStock, getFactoryStockSummary } from '../api/palletApi';
import { 
    Loader2, Warehouse, Box, Layers, Ruler, Package, Grid, List, Search, 
    AlertCircle, Boxes, Plus, Edit2, RefreshCw, ChevronDown, ChevronUp, BarChart3, X, Check
} from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import CreateCustomPalletModal from '../components/pallets/CreateCustomPalletModal';
import EditPalletModal from '../components/pallets/EditPalletModal';

const FactoryStockPage = () => {
    const [factories, setFactories] = useState([]);
    const [tiles, setTiles] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState('');
    const [allFactoryStock, setAllFactoryStock] = useState([]);
    const [selectedFactoryStock, setSelectedFactoryStock] = useState([]);
    const [selectedFactorySummary, setSelectedFactorySummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('summary');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPallet, setEditingPallet] = useState(null);
    const [expandedFactories, setExpandedFactories] = useState({});
    const [expandedTiles, setExpandedTiles] = useState({});
    const [sortBy, setSortBy] = useState('name');
    
    // Factory search state
    const [factorySearchTerm, setFactorySearchTerm] = useState('');
    const [showFactoryDropdown, setShowFactoryDropdown] = useState(false);
    const factorySearchRef = useRef(null);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (factorySearchRef.current && !factorySearchRef.current.contains(event.target)) {
                setShowFactoryDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const factoriesResponse = await getAllFactories();
                const factoriesData = factoriesResponse?.data || factoriesResponse || [];
                setFactories(Array.isArray(factoriesData) ? factoriesData : []);
                if (factoriesData.length > 0) {
                    setSelectedFactory(factoriesData[0]._id);
                    setFactorySearchTerm(factoriesData[0].name);
                    setExpandedFactories({ [factoriesData[0]._id]: true });
                }
                const stockResponse = await getAllFactoryStock();
                const stockData = stockResponse?.data || stockResponse || [];
                setAllFactoryStock(Array.isArray(stockData) ? stockData : []);
                const uniqueTiles = {};
                stockData.forEach(item => {
                    if (item?.tile && !uniqueTiles[item.tile._id]) uniqueTiles[item.tile._id] = item.tile;
                });
                setTiles(Object.values(uniqueTiles));
            } catch (err) {
                console.error('Failed to fetch initial data:', err);
                setError('Failed to load factory data.');
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, []);

    useEffect(() => {
        if (!selectedFactory || viewMode !== 'detail') return;
        const fetchFactoryData = async () => {
            setLoading(true);
            try {
                const [stockResponse, summaryResponse] = await Promise.all([
                    getFactoryStock(selectedFactory),
                    getFactoryStockSummary(selectedFactory)
                ]);
                setSelectedFactoryStock(stockResponse?.data || stockResponse || []);
                setSelectedFactorySummary(summaryResponse?.data || summaryResponse || null);
            } catch (err) {
                setError('Failed to fetch stock.');
                setSelectedFactoryStock([]);
                setSelectedFactorySummary(null);
            } finally {
                setLoading(false);
            }
        };
        fetchFactoryData();
    }, [selectedFactory, viewMode]);

    const handleRefresh = useCallback(async () => {
        setLoading(true);
        try {
            const stockResponse = await getAllFactoryStock();
            const stockData = stockResponse?.data || stockResponse || [];
            setAllFactoryStock(Array.isArray(stockData) ? stockData : []);
            if (selectedFactory && viewMode === 'detail') {
                const [factoryStockRes, summaryRes] = await Promise.all([
                    getFactoryStock(selectedFactory),
                    getFactoryStockSummary(selectedFactory)
                ]);
                setSelectedFactoryStock(factoryStockRes?.data || factoryStockRes || []);
                setSelectedFactorySummary(summaryRes?.data || summaryRes || null);
            }
            const uniqueTiles = {};
            stockData.forEach(item => {
                if (item?.tile && !uniqueTiles[item.tile._id]) uniqueTiles[item.tile._id] = item.tile;
            });
            setTiles(Object.values(uniqueTiles));
        } catch (err) {
            setError('Failed to refresh.');
        } finally {
            setLoading(false);
        }
    }, [selectedFactory, viewMode]);

    const handleSelectFactory = (factory) => {
        setSelectedFactory(factory._id);
        setFactorySearchTerm(factory.name);
        setShowFactoryDropdown(false);
    };

    const filteredFactories = useMemo(() => {
        if (!factorySearchTerm) return factories;
        return factories.filter(f => 
            f.name.toLowerCase().includes(factorySearchTerm.toLowerCase())
        );
    }, [factories, factorySearchTerm]);

    const toggleFactory = (factoryId) => setExpandedFactories(prev => ({ ...prev, [factoryId]: !prev[factoryId] }));
    const toggleTile = (tileId) => setExpandedTiles(prev => ({ ...prev, [tileId]: !prev[tileId] }));

    const globalStats = useMemo(() => {
        let totalPallets = 0, totalKhatlis = 0, totalBoxes = 0;
        const totalTiles = new Set(), totalFactories = new Set();
        allFactoryStock.forEach(item => {
            if (item?.type === 'Pallet') totalPallets++;
            else if (item?.type === 'Khatli') totalKhatlis++;
            totalBoxes += item?.boxCount || 0;
            if (item?.tile?._id) totalTiles.add(item.tile._id);
            if (item?.factory?._id) totalFactories.add(item.factory._id);
        });
        return { totalPallets, totalKhatlis, totalItems: totalPallets + totalKhatlis, totalBoxes, uniqueTiles: totalTiles.size, activeFactories: totalFactories.size };
    }, [allFactoryStock]);

    const aggregatedByFactory = useMemo(() => {
        const filtered = allFactoryStock.filter(pallet => {
            if (!debouncedSearchTerm) return true;
            const search = debouncedSearchTerm.toLowerCase();
            return (pallet?.tile?.name?.toLowerCase() || '').includes(search) || (pallet?.factory?.name?.toLowerCase() || '').includes(search);
        });
        const factoryGroups = {};
        filtered.forEach(pallet => {
            if (!pallet) return;
            const factoryId = pallet.factory?._id || 'unknown';
            if (!factoryGroups[factoryId]) {
                factoryGroups[factoryId] = { factory: pallet.factory, factoryName: pallet.factory?.name || 'Unknown', tiles: {}, totalPallets: 0, totalKhatlis: 0, totalBoxes: 0 };
            }
            const tileId = pallet.tile?._id || 'unknown';
            if (!factoryGroups[factoryId].tiles[tileId]) {
                factoryGroups[factoryId].tiles[tileId] = { tile: pallet.tile, tileName: pallet.tile?.name || 'Unknown', tileSize: pallet.tile?.size || 'N/A', tileSurface: pallet.tile?.surface || 'N/A', pallets: { count: 0, boxes: 0, items: [] }, khatlis: { count: 0, boxes: 0, items: [] } };
            }
            if (pallet.type === 'Pallet') {
                factoryGroups[factoryId].tiles[tileId].pallets.count++;
                factoryGroups[factoryId].tiles[tileId].pallets.boxes += pallet.boxCount || 0;
                factoryGroups[factoryId].tiles[tileId].pallets.items.push(pallet);
                factoryGroups[factoryId].totalPallets++;
            } else {
                factoryGroups[factoryId].tiles[tileId].khatlis.count++;
                factoryGroups[factoryId].tiles[tileId].khatlis.boxes += pallet.boxCount || 0;
                factoryGroups[factoryId].tiles[tileId].khatlis.items.push(pallet);
                factoryGroups[factoryId].totalKhatlis++;
            }
            factoryGroups[factoryId].totalBoxes += pallet.boxCount || 0;
        });
        let result = Object.entries(factoryGroups).map(([id, data]) => ({ ...data, factoryId: id, tiles: Object.values(data.tiles).sort((a, b) => a.tileName.localeCompare(b.tileName)) }));
        if (sortBy === 'pallets') result.sort((a, b) => (b.totalPallets + b.totalKhatlis) - (a.totalPallets + a.totalKhatlis));
        else if (sortBy === 'boxes') result.sort((a, b) => b.totalBoxes - a.totalBoxes);
        else result.sort((a, b) => a.factoryName.localeCompare(b.factoryName));
        return result;
    }, [allFactoryStock, debouncedSearchTerm, sortBy]);

    const aggregatedSelectedFactory = useMemo(() => {
        const filtered = selectedFactoryStock.filter(pallet => {
            if (!debouncedSearchTerm) return true;
            return (pallet?.tile?.name?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase());
        });
        const palletsByTile = {}, khatlisByTile = {};
        filtered.forEach(pallet => {
            if (!pallet) return;
            const tileId = pallet.tile?._id || 'unknown';
            const targetGroup = pallet.type === 'Pallet' ? palletsByTile : khatlisByTile;
            if (!targetGroup[tileId]) targetGroup[tileId] = { tile: pallet.tile, boxCountGroups: {} };
            const boxCount = pallet.boxCount || 0;
            if (!targetGroup[tileId].boxCountGroups[boxCount]) targetGroup[tileId].boxCountGroups[boxCount] = { boxCount, items: [] };
            targetGroup[tileId].boxCountGroups[boxCount].items.push(pallet);
        });
        const formatGroups = (groups) => Object.values(groups).map(tg => ({ ...tg, boxCountGroups: Object.values(tg.boxCountGroups).sort((a, b) => b.boxCount - a.boxCount), totalCount: Object.values(tg.boxCountGroups).reduce((sum, g) => sum + g.items.length, 0), totalBoxes: Object.values(tg.boxCountGroups).reduce((sum, g) => sum + (g.items.length * g.boxCount), 0) })).sort((a, b) => (a.tile?.name || '').localeCompare(b.tile?.name || ''));
        return { pallets: formatGroups(palletsByTile), khatlis: formatGroups(khatlisByTile) };
    }, [selectedFactoryStock, debouncedSearchTerm]);

    const selectedFactoryName = factories.find(f => f._id === selectedFactory)?.name || 'Select Factory';
    const groupByBoxCount = (items) => {
        const groups = {};
        items.forEach(item => {
            const bc = item.boxCount || 0;
            if (!groups[bc]) groups[bc] = { boxCount: bc, count: 0 };
            groups[bc].count++;
        });
        return Object.values(groups).sort((a, b) => b.boxCount - a.boxCount);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text dark:text-dark-text">Factory Stock</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">Live inventory of QC-passed goods</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={handleRefresh} disabled={loading} className="flex items-center gap-2 px-4 py-2.5 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors disabled:opacity-50 text-text dark:text-dark-text">
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                    {viewMode === 'detail' && selectedFactory && (
                        <button onClick={() => setShowCreateModal(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold">
                            <Plus size={18} /> Add Stock
                        </button>
                    )}
                </div>
            </div>

            {/* Global Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Warehouse size={20} className="text-blue-600 dark:text-blue-400" /></div>
                        <div><p className="text-2xl font-bold text-text dark:text-dark-text">{globalStats.activeFactories}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Factories</p></div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg"><Layers size={20} className="text-green-600 dark:text-green-400" /></div>
                        <div><p className="text-2xl font-bold text-text dark:text-dark-text">{globalStats.uniqueTiles}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Tile Types</p></div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg"><Package size={20} className="text-indigo-600 dark:text-indigo-400" /></div>
                        <div><p className="text-2xl font-bold text-text dark:text-dark-text">{globalStats.totalPallets.toLocaleString()}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pallets</p></div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"><Boxes size={20} className="text-purple-600 dark:text-purple-400" /></div>
                        <div><p className="text-2xl font-bold text-text dark:text-dark-text">{globalStats.totalKhatlis.toLocaleString()}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Khatlis</p></div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg"><BarChart3 size={20} className="text-cyan-600 dark:text-cyan-400" /></div>
                        <div><p className="text-2xl font-bold text-text dark:text-dark-text">{globalStats.totalItems.toLocaleString()}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Total Items</p></div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg"><Box size={20} className="text-orange-600 dark:text-orange-400" /></div>
                        <div><p className="text-2xl font-bold text-text dark:text-dark-text">{globalStats.totalBoxes.toLocaleString()}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Total Boxes</p></div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                <div className="flex gap-2">
                    <button onClick={() => setViewMode('summary')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${viewMode === 'summary' ? 'bg-primary text-white' : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'}`}>
                        <Grid size={18} /> All Factories
                    </button>
                    <button onClick={() => setViewMode('detail')} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${viewMode === 'detail' ? 'bg-primary text-white' : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'}`}>
                        <List size={18} /> Factory Detail
                    </button>
                </div>
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    <div className="relative flex-1 lg:flex-none lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                        <input type="text" placeholder="Search tiles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text focus:ring-2 focus:ring-primary" />
                    </div>
                    
                    {/* Factory Search Dropdown for Detail View */}
                    {viewMode === 'detail' && (
                        <div className="relative min-w-[220px]" ref={factorySearchRef}>
                            <div className="relative">
                                <Warehouse className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                                <input 
                                    type="text" 
                                    placeholder="Search factory..." 
                                    value={factorySearchTerm} 
                                    onChange={(e) => { setFactorySearchTerm(e.target.value); setShowFactoryDropdown(true); }}
                                    onFocus={() => setShowFactoryDropdown(true)}
                                    className="w-full pl-10 pr-10 py-2.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text focus:ring-2 focus:ring-primary" 
                                />
                                {factorySearchTerm && (
                                    <button 
                                        onClick={() => { setFactorySearchTerm(''); setShowFactoryDropdown(true); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                            {showFactoryDropdown && (
                                <div className="absolute z-50 w-full mt-1 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                    {filteredFactories.length === 0 ? (
                                        <div className="p-3 text-center text-text-secondary">No factories found</div>
                                    ) : (
                                        filteredFactories.map(factory => (
                                            <button
                                                key={factory._id}
                                                onClick={() => handleSelectFactory(factory)}
                                                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-100 dark:hover:bg-dark-border transition-colors text-left ${selectedFactory === factory._id ? 'bg-primary/10' : ''}`}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Warehouse size={16} className="text-text-secondary" />
                                                    <span className="text-text dark:text-dark-text font-medium">{factory.name}</span>
                                                </div>
                                                {selectedFactory === factory._id && (
                                                    <Check size={16} className="text-primary" />
                                                )}
                                            </button>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {viewMode === 'summary' && (
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="px-4 py-2.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text">
                            <option value="name">Sort by Name</option>
                            <option value="pallets">Sort by Items</option>
                            <option value="boxes">Sort by Boxes</option>
                        </select>
                    )}
                </div>
            </div>

            {error && <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3"><AlertCircle size={20} /><span>{error}</span><button onClick={handleRefresh} className="ml-auto underline">Retry</button></div>}
            {loading && <div className="flex justify-center py-20"><Loader2 size={48} className="animate-spin text-primary" /></div>}

            {/* Summary View */}
            {!loading && viewMode === 'summary' && (
                <div className="space-y-4">
                    {aggregatedByFactory.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl bg-foreground dark:bg-dark-foreground">
                            <Package size={48} className="mx-auto text-text-secondary/30" />
                            <h3 className="mt-4 text-xl font-semibold text-text dark:text-dark-text">No Stock Found</h3>
                        </div>
                    ) : aggregatedByFactory.map(factoryGroup => {
                        const isExpanded = expandedFactories[factoryGroup.factoryId];
                        return (
                            <div key={factoryGroup.factoryId} className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border overflow-hidden shadow-sm">
                                <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors" onClick={() => toggleFactory(factoryGroup.factoryId)}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl"><Warehouse size={24} className="text-white" /></div>
                                            <div>
                                                <h2 className="text-xl font-bold text-text dark:text-dark-text">{factoryGroup.factoryName}</h2>
                                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">{factoryGroup.tiles.length} tile types</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="hidden md:flex items-center gap-6">
                                                <div className="text-center"><p className="text-xl font-bold text-blue-600 dark:text-blue-400">{factoryGroup.totalPallets}</p><p className="text-xs text-text-secondary">Pallets</p></div>
                                                <div className="text-center"><p className="text-xl font-bold text-purple-600 dark:text-purple-400">{factoryGroup.totalKhatlis}</p><p className="text-xs text-text-secondary">Khatlis</p></div>
                                                <div className="text-center"><p className="text-xl font-bold text-green-600 dark:text-green-400">{factoryGroup.totalBoxes.toLocaleString()}</p><p className="text-xs text-text-secondary">Boxes</p></div>
                                            </div>
                                            <button className="p-2 text-text-secondary">{isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</button>
                                        </div>
                                    </div>
                                </div>
                                {isExpanded && (
                                    <div className="border-t border-border dark:border-dark-border p-4 space-y-3">
                                        {factoryGroup.tiles.map(tileData => {
                                            const totalBoxes = tileData.pallets.boxes + tileData.khatlis.boxes;
                                            const isTileExpanded = expandedTiles[`${factoryGroup.factoryId}-${tileData.tile?._id}`];
                                            const palletGroups = groupByBoxCount(tileData.pallets.items);
                                            const khatliGroups = groupByBoxCount(tileData.khatlis.items);
                                            return (
                                                <div key={tileData.tile?._id} className="bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border overflow-hidden">
                                                    <div className="p-4 cursor-pointer hover:bg-foreground dark:hover:bg-dark-foreground transition-colors" onClick={() => toggleTile(`${factoryGroup.factoryId}-${tileData.tile?._id}`)}>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-3">
                                                                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"><Layers size={20} className="text-gray-600 dark:text-gray-400" /></div>
                                                                <div>
                                                                    <h3 className="font-semibold text-text dark:text-dark-text">{tileData.tileName}</h3>
                                                                    <div className="flex items-center gap-3 text-xs text-text-secondary"><span className="flex items-center gap-1"><Ruler size={12} /> {tileData.tileSize}</span><span className="flex items-center gap-1"><Layers size={12} /> {tileData.tileSurface}</span></div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-2">
                                                                    {tileData.pallets.count > 0 && <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold">{tileData.pallets.count} P</span>}
                                                                    {tileData.khatlis.count > 0 && <span className="px-2.5 py-1 bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold">{tileData.khatlis.count} K</span>}
                                                                    <span className="px-2.5 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold">{totalBoxes.toLocaleString()} boxes</span>
                                                                </div>
                                                                <button className="p-1 text-text-secondary">{isTileExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    {isTileExpanded && (
                                                        <div className="border-t border-border dark:border-dark-border p-4 bg-foreground dark:bg-dark-foreground">
                                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                {tileData.pallets.count > 0 && (
                                                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                                                        <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-3 flex items-center gap-2"><Package size={16} /> Pallets ({tileData.pallets.count})</h4>
                                                                        <div className="space-y-2">
                                                                            {palletGroups.map(g => (
                                                                                <div key={g.boxCount} className="flex justify-between p-2 bg-white dark:bg-dark-background rounded border border-blue-100 dark:border-blue-900/50">
                                                                                    <span className="text-sm text-text dark:text-dark-text"><strong className="text-blue-600 dark:text-blue-400">{g.boxCount}</strong> boxes/pallet</span>
                                                                                    <span className="font-bold text-blue-600 dark:text-blue-400">×{g.count}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800 text-right text-sm text-blue-700 dark:text-blue-300">Total: <strong>{tileData.pallets.boxes.toLocaleString()}</strong> boxes</div>
                                                                    </div>
                                                                )}
                                                                {tileData.khatlis.count > 0 && (
                                                                    <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                                                                        <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-3 flex items-center gap-2"><Boxes size={16} /> Khatlis ({tileData.khatlis.count})</h4>
                                                                        <div className="space-y-2">
                                                                            {khatliGroups.map(g => (
                                                                                <div key={g.boxCount} className="flex justify-between p-2 bg-white dark:bg-dark-background rounded border border-purple-100 dark:border-purple-900/50">
                                                                                    <span className="text-sm text-text dark:text-dark-text"><strong className="text-purple-600 dark:text-purple-400">{g.boxCount}</strong> boxes/khatli</span>
                                                                                    <span className="font-bold text-purple-600 dark:text-purple-400">×{g.count}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                        <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800 text-right text-sm text-purple-700 dark:text-purple-300">Total: <strong>{tileData.khatlis.boxes.toLocaleString()}</strong> boxes</div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Detail View */}
            {!loading && viewMode === 'detail' && (
                <div className="space-y-6">
                    {selectedFactorySummary && (
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 bg-white/20 rounded-xl"><Warehouse size={28} /></div>
                                <div><h2 className="text-2xl font-bold">{selectedFactoryName}</h2><p className="text-blue-100">Detailed Stock Overview</p></div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="bg-white/10 rounded-lg p-4"><p className="text-3xl font-bold">{selectedFactorySummary.byType?.pallets?.count || 0}</p><p className="text-blue-100 text-sm">Pallets</p></div>
                                <div className="bg-white/10 rounded-lg p-4"><p className="text-3xl font-bold">{selectedFactorySummary.byType?.khatlis?.count || 0}</p><p className="text-blue-100 text-sm">Khatlis</p></div>
                                <div className="bg-white/10 rounded-lg p-4"><p className="text-3xl font-bold">{(selectedFactorySummary.totalBoxes || 0).toLocaleString()}</p><p className="text-blue-100 text-sm">Total Boxes</p></div>
                                <div className="bg-white/10 rounded-lg p-4"><p className="text-3xl font-bold">{selectedFactorySummary.detailedSummary?.length || aggregatedSelectedFactory.pallets.length + aggregatedSelectedFactory.khatlis.length}</p><p className="text-blue-100 text-sm">Tile Types</p></div>
                            </div>
                        </div>
                    )}
                    {aggregatedSelectedFactory.pallets.length === 0 && aggregatedSelectedFactory.khatlis.length === 0 && (
                        <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl bg-foreground dark:bg-dark-foreground">
                            <Package size={48} className="mx-auto text-text-secondary/30" />
                            <h3 className="mt-4 text-xl font-semibold text-text dark:text-dark-text">No Stock Found</h3>
                            <button onClick={() => setShowCreateModal(true)} className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold"><Plus size={16} /> Add Stock</button>
                        </div>
                    )}
                    {aggregatedSelectedFactory.pallets.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2"><Package size={24} /> Pallets</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {aggregatedSelectedFactory.pallets.map(tileGroup => (
                                    <div key={tileGroup.tile?._id} className="bg-foreground dark:bg-dark-foreground rounded-xl border border-blue-200 dark:border-blue-900/50 overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="bg-gradient-to-r from-blue-50 to-blue-100/50 dark:from-blue-900/30 dark:to-blue-900/10 p-4 border-b border-blue-200 dark:border-blue-900/50">
                                            <div className="flex justify-between items-start">
                                                <div><h3 className="text-lg font-bold text-blue-700 dark:text-blue-300">{tileGroup.tile?.name}</h3><div className="flex gap-4 mt-1 text-sm text-text-secondary dark:text-dark-text-secondary"><span className="flex items-center gap-1"><Ruler size={14} /> {tileGroup.tile?.size}</span><span className="flex items-center gap-1"><Layers size={14} /> {tileGroup.tile?.surface}</span></div></div>
                                                <div className="text-right"><p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{tileGroup.totalCount}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">pallets</p></div>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {tileGroup.boxCountGroups.map(boxGroup => (
                                                <div key={boxGroup.boxCount} className="flex items-center justify-between p-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg border border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center"><span className="font-bold text-blue-600 dark:text-blue-400">{boxGroup.items.length}</span></div>
                                                        <div><p className="font-medium text-text dark:text-dark-text"><span className="text-blue-600 dark:text-blue-400 font-bold">{boxGroup.boxCount}</span> boxes/pallet</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Total: {(boxGroup.items.length * boxGroup.boxCount).toLocaleString()} boxes</p></div>
                                                    </div>
                                                    {boxGroup.items.length === 1 && <button onClick={() => setEditingPallet(boxGroup.items[0])} className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={16} /></button>}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-t border-blue-200 dark:border-blue-900/50"><div className="flex justify-between text-sm"><span className="text-text-secondary dark:text-dark-text-secondary">Total Boxes</span><span className="font-bold text-blue-600 dark:text-blue-400">{tileGroup.totalBoxes.toLocaleString()}</span></div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {aggregatedSelectedFactory.khatlis.length > 0 && (
                        <div>
                            <h2 className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-4 flex items-center gap-2"><Boxes size={24} /> Khatlis</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {aggregatedSelectedFactory.khatlis.map(tileGroup => (
                                    <div key={tileGroup.tile?._id} className="bg-foreground dark:bg-dark-foreground rounded-xl border border-purple-200 dark:border-purple-900/50 overflow-hidden hover:shadow-lg transition-shadow">
                                        <div className="bg-gradient-to-r from-purple-50 to-purple-100/50 dark:from-purple-900/30 dark:to-purple-900/10 p-4 border-b border-purple-200 dark:border-purple-900/50">
                                            <div className="flex justify-between items-start">
                                                <div><h3 className="text-lg font-bold text-purple-700 dark:text-purple-300">{tileGroup.tile?.name}</h3><div className="flex gap-4 mt-1 text-sm text-text-secondary dark:text-dark-text-secondary"><span className="flex items-center gap-1"><Ruler size={14} /> {tileGroup.tile?.size}</span><span className="flex items-center gap-1"><Layers size={14} /> {tileGroup.tile?.surface}</span></div></div>
                                                <div className="text-right"><p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{tileGroup.totalCount}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">khatlis</p></div>
                                            </div>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {tileGroup.boxCountGroups.map(boxGroup => (
                                                <div key={boxGroup.boxCount} className="flex items-center justify-between p-3 bg-purple-50/50 dark:bg-purple-900/10 rounded-lg border border-purple-100 dark:border-purple-900/30 hover:border-purple-300 dark:hover:border-purple-700 transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center"><span className="font-bold text-purple-600 dark:text-purple-400">{boxGroup.items.length}</span></div>
                                                        <div><p className="font-medium text-text dark:text-dark-text"><span className="text-purple-600 dark:text-purple-400 font-bold">{boxGroup.boxCount}</span> boxes/khatli</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Total: {(boxGroup.items.length * boxGroup.boxCount).toLocaleString()} boxes</p></div>
                                                    </div>
                                                    {boxGroup.items.length === 1 && <button onClick={() => setEditingPallet(boxGroup.items[0])} className="p-2 text-purple-600 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={16} /></button>}
                                                </div>
                                            ))}
                                        </div>
                                        <div className="px-4 py-3 bg-purple-50 dark:bg-purple-900/20 border-t border-purple-200 dark:border-purple-900/50"><div className="flex justify-between text-sm"><span className="text-text-secondary dark:text-dark-text-secondary">Total Boxes</span><span className="font-bold text-purple-600 dark:text-purple-400">{tileGroup.totalBoxes.toLocaleString()}</span></div></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showCreateModal && selectedFactory && <CreateCustomPalletModal factory={factories.find(f => f._id === selectedFactory)} tiles={tiles} onClose={() => setShowCreateModal(false)} onSuccess={() => { setShowCreateModal(false); handleRefresh(); }} />}
            {editingPallet && <EditPalletModal pallet={editingPallet} tile={editingPallet.tile} onClose={() => setEditingPallet(null)} onSuccess={() => { setEditingPallet(null); handleRefresh(); }} />}
        </div>
    );
};

export default FactoryStockPage;