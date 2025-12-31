// // FILE LOCATION: src/components/tiles/TileDetailModal.js

// import React, { useState, useEffect } from 'react';
// import { getTileStockDetails } from '../../api/tileApi';
// import { 
//     X, Loader2, AlertCircle, Ruler, Droplets, Box, Package, 
//     CheckCircle, TrendingUp, Factory, Calendar, User, Hash, 
//     Edit, ExternalLink, Truck, Boxes, ArrowRight
// } from 'lucide-react';
// import { format, parseISO } from 'date-fns';
// import { useNavigate } from 'react-router-dom';

// const TileDetailModal = ({ tileId, onClose, onEdit }) => {
//     const navigate = useNavigate();
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [tile, setTile] = useState(null);
//     const [factoryStock, setFactoryStock] = useState({ total: 0, byFactory: [] });
//     const [transitStock, setTransitStock] = useState({ total: 0, pallets: 0, khatlis: 0 });
//     const [loadedStock, setLoadedStock] = useState({ total: 0 });
//     const [lightboxOpen, setLightboxOpen] = useState(false);

//     useEffect(() => {
//         const fetchTileDetails = async () => {
//             if (!tileId) return;
//             setLoading(true);
//             setError('');
//             try {
//                 const response = await getTileStockDetails(tileId);
//                 const data = response?.data || response;
                
//                 setTile(data.tile);
//                 setFactoryStock(data.factoryStock || { total: 0, byFactory: [] });
//                 setTransitStock(data.transitStock || { total: 0, pallets: 0, khatlis: 0 });
//                 setLoadedStock(data.loadedStock || { total: 0 });
//             } catch (err) {
//                 console.error('Error fetching tile details:', err);
//                 setError('Failed to load tile details.');
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchTileDetails();
//     }, [tileId]);

//     const handleFactoryClick = (factoryId) => {
//         onClose();
//         navigate(`/factory-stock?factory=${factoryId}`);
//     };

//     const getStockStatus = () => {
//         if (!tile) return { label: 'Unknown', color: 'gray', icon: AlertCircle };
//         const available = tile.stockDetails?.availableStock || 0;
//         const threshold = tile.restockThreshold || 0;
        
//         if (available === 0) {
//             return { label: 'Out of Stock', color: 'red', icon: AlertCircle };
//         } else if (available < threshold) {
//             return { label: 'Low Stock', color: 'amber', icon: TrendingUp };
//         }
//         return { label: 'In Stock', color: 'green', icon: CheckCircle };
//     };

//     const stockStatus = getStockStatus();
//     const StatusIcon = stockStatus.icon;

//     if (!tileId) return null;

//     return (
//         <>
//             {/* Image Lightbox */}
//             {lightboxOpen && tile?.imageUrl && (
//                 <div 
//                     className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
//                     onClick={() => setLightboxOpen(false)}
//                 >
//                     <button 
//                         onClick={() => setLightboxOpen(false)}
//                         className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20"
//                     >
//                         <X size={24} className="text-white" />
//                     </button>
//                     <img 
//                         src={tile.imageUrl} 
//                         alt={tile.name}
//                         className="max-w-full max-h-full object-contain"
//                     />
//                 </div>
//             )}

//             {/* Main Modal */}
//             <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
//                 <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                    
//                     {/* Hero Image Header */}
//                     <div className="relative h-48 md:h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex-shrink-0">
//                         {tile?.imageUrl ? (
//                             <img 
//                                 src={tile.imageUrl} 
//                                 alt={tile.name}
//                                 className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
//                                 onClick={() => setLightboxOpen(true)}
//                             />
//                         ) : (
//                             <div className="w-full h-full flex items-center justify-center">
//                                 <Box size={64} className="text-gray-600" />
//                             </div>
//                         )}
                        
//                         {/* Gradient Overlay */}
//                         <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
//                         {/* Close & Edit Buttons */}
//                         <div className="absolute top-4 right-4 flex gap-2">
//                             {onEdit && (
//                                 <button 
//                                     onClick={() => { onClose(); onEdit(tile); }}
//                                     className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
//                                 >
//                                     <Edit size={20} className="text-white" />
//                                 </button>
//                             )}
//                             <button 
//                                 onClick={onClose}
//                                 className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
//                             >
//                                 <X size={20} className="text-white" />
//                             </button>
//                         </div>
                        
//                         {/* Title Overlay */}
//                         {tile && (
//                             <div className="absolute bottom-0 left-0 right-0 p-4">
//                                 <div className="flex items-end justify-between">
//                                     <div>
//                                         <h2 className="text-2xl md:text-3xl font-bold text-white">{tile.name}</h2>
//                                         <div className="flex flex-wrap items-center gap-3 mt-2 text-white/80 text-sm">
//                                             {tile.number && <span className="font-mono">#{tile.number}</span>}
//                                             <span className="flex items-center gap-1"><Ruler size={14} /> {tile.size}</span>
//                                             <span className="flex items-center gap-1"><Droplets size={14} /> {tile.surface}</span>
//                                         </div>
//                                     </div>
//                                     <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
//                                         stockStatus.color === 'green' ? 'bg-green-500/80 text-white' :
//                                         stockStatus.color === 'amber' ? 'bg-amber-500/80 text-white' :
//                                         'bg-red-500/80 text-white'
//                                     }`}>
//                                         <StatusIcon size={14} />
//                                         {stockStatus.label}
//                                     </span>
//                                 </div>
//                             </div>
//                         )}
//                     </div>

//                     {/* Content */}
//                     <div className="flex-grow overflow-y-auto p-6 space-y-6">
//                         {loading && (
//                             <div className="flex justify-center py-16">
//                                 <Loader2 size={48} className="animate-spin text-primary" />
//                             </div>
//                         )}
                        
//                         {error && (
//                             <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
//                                 <AlertCircle size={20} />
//                                 <span>{error}</span>
//                             </div>
//                         )}

//                         {tile && !loading && (
//                             <>
//                                 {/* Stock Overview - 5 Cards including Transit */}
//                                 <div>
//                                     <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
//                                         Stock Overview
//                                     </h3>
//                                     <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
//                                         <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-center">
//                                             <CheckCircle size={20} className="mx-auto text-green-600 dark:text-green-400 mb-1" />
//                                             <p className="text-xl font-bold text-green-600 dark:text-green-400">
//                                                 {tile.stockDetails?.availableStock || 0}
//                                             </p>
//                                             <p className="text-xs text-green-700 dark:text-green-300">Available</p>
//                                         </div>
//                                         <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
//                                             <Package size={20} className="mx-auto text-blue-600 dark:text-blue-400 mb-1" />
//                                             <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
//                                                 {tile.stockDetails?.bookedStock || 0}
//                                             </p>
//                                             <p className="text-xs text-blue-700 dark:text-blue-300">Booked</p>
//                                         </div>
//                                         <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
//                                             <TrendingUp size={20} className="mx-auto text-amber-600 dark:text-amber-400 mb-1" />
//                                             <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
//                                                 {tile.stockDetails?.restockingStock || 0}
//                                             </p>
//                                             <p className="text-xs text-amber-700 dark:text-amber-300">Restocking</p>
//                                         </div>
//                                         <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 text-center">
//                                             <Factory size={20} className="mx-auto text-purple-600 dark:text-purple-400 mb-1" />
//                                             <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
//                                                 {factoryStock.total}
//                                             </p>
//                                             <p className="text-xs text-purple-700 dark:text-purple-300">In Factory</p>
//                                         </div>
//                                         <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800 text-center">
//                                             <Truck size={20} className="mx-auto text-cyan-600 dark:text-cyan-400 mb-1" />
//                                             <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
//                                                 {transitStock.total}
//                                             </p>
//                                             <p className="text-xs text-cyan-700 dark:text-cyan-300">In Transit</p>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Factory Stock Breakdown */}
//                                 {factoryStock.byFactory && factoryStock.byFactory.length > 0 && (
//                                     <div>
//                                         <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
//                                             Factory Stock Breakdown ({factoryStock.total} boxes total)
//                                         </h3>
//                                         <div className="space-y-2">
//                                             {factoryStock.byFactory.map((factory) => (
//                                                 <div 
//                                                     key={factory.factoryId}
//                                                     onClick={() => handleFactoryClick(factory.factoryId)}
//                                                     className="flex items-center justify-between p-3 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border hover:border-primary dark:hover:border-primary cursor-pointer transition-colors group"
//                                                 >
//                                                     <div className="flex items-center gap-3">
//                                                         <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
//                                                             <Factory size={18} className="text-purple-600 dark:text-purple-400" />
//                                                         </div>
//                                                         <div>
//                                                             <p className="font-semibold text-text dark:text-dark-text group-hover:text-primary transition-colors">
//                                                                 {factory.factoryName}
//                                                             </p>
//                                                             <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
//                                                                 {factory.palletCount} pallets • {factory.khatliCount} khatlis
//                                                             </p>
//                                                         </div>
//                                                     </div>
//                                                     <div className="flex items-center gap-3">
//                                                         <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
//                                                             {factory.totalBoxes} boxes
//                                                         </span>
//                                                         <ExternalLink size={16} className="text-text-secondary group-hover:text-primary transition-colors" />
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Transit Stock Details */}
//                                 {transitStock.total > 0 && (
//                                     <div>
//                                         <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
//                                             In Transit Details
//                                         </h3>
//                                         <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
//                                             <div className="flex items-center gap-4">
//                                                 <div className="p-3 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
//                                                     <Truck size={24} className="text-cyan-600 dark:text-cyan-400" />
//                                                 </div>
//                                                 <div className="flex-1">
//                                                     <p className="font-bold text-cyan-700 dark:text-cyan-300">
//                                                         {transitStock.total} boxes in transit
//                                                     </p>
//                                                     <p className="text-sm text-cyan-600 dark:text-cyan-400">
//                                                         {transitStock.pallets} pallets • {transitStock.khatlis} khatlis
//                                                     </p>
//                                                 </div>
//                                                 <ArrowRight size={20} className="text-cyan-500" />
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Loaded Stock (in containers but not dispatched) */}
//                                 {loadedStock.total > 0 && (
//                                     <div>
//                                         <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
//                                             Loaded in Containers (Not Dispatched)
//                                         </h3>
//                                         <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
//                                             <div className="flex items-center gap-4">
//                                                 <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
//                                                     <Boxes size={24} className="text-orange-600 dark:text-orange-400" />
//                                                 </div>
//                                                 <div>
//                                                     <p className="font-bold text-orange-700 dark:text-orange-300">
//                                                         {loadedStock.total} boxes loaded
//                                                     </p>
//                                                     <p className="text-sm text-orange-600 dark:text-orange-400">
//                                                         In containers, awaiting dispatch
//                                                     </p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Tile Details */}
//                                 <div>
//                                     <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
//                                         Tile Details
//                                     </h3>
//                                     <div className="bg-background dark:bg-dark-background rounded-xl border border-border dark:border-dark-border divide-y divide-border dark:divide-dark-border">
//                                         <div className="flex justify-between p-3">
//                                             <span className="text-text-secondary dark:text-dark-text-secondary">Size</span>
//                                             <span className="font-medium text-text dark:text-dark-text">{tile.size}</span>
//                                         </div>
//                                         <div className="flex justify-between p-3">
//                                             <span className="text-text-secondary dark:text-dark-text-secondary">Surface</span>
//                                             <span className="font-medium text-text dark:text-dark-text">{tile.surface}</span>
//                                         </div>
//                                         <div className="flex justify-between p-3">
//                                             <span className="text-text-secondary dark:text-dark-text-secondary">Boxes per Sq.M.</span>
//                                             <span className="font-medium text-text dark:text-dark-text">{tile.conversionFactor || 1}</span>
//                                         </div>
//                                         <div className="flex justify-between p-3">
//                                             <span className="text-text-secondary dark:text-dark-text-secondary">Restock Threshold</span>
//                                             <span className="font-medium text-text dark:text-dark-text">{tile.restockThreshold || 0}</span>
//                                         </div>
//                                     </div>
//                                 </div>

//                                 {/* Manufacturing Factories (Clickable) */}
//                                 {tile.manufacturingFactories && tile.manufacturingFactories.length > 0 && (
//                                     <div>
//                                         <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
//                                             Manufacturing Factories ({tile.manufacturingFactories.length})
//                                         </h3>
//                                         <div className="flex flex-wrap gap-2">
//                                             {tile.manufacturingFactories.map((factory) => {
//                                                 const factoryId = typeof factory === 'object' ? factory._id : factory;
//                                                 const factoryName = typeof factory === 'object' ? factory.name : 'Unknown';
                                                
//                                                 const factoryStockInfo = factoryStock.byFactory?.find(
//                                                     f => f.factoryId.toString() === factoryId.toString()
//                                                 );
                                                
//                                                 return (
//                                                     <button
//                                                         key={factoryId}
//                                                         onClick={() => handleFactoryClick(factoryId)}
//                                                         className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors group"
//                                                     >
//                                                         <Factory size={16} />
//                                                         <span className="font-medium">{factoryName}</span>
//                                                         {factoryStockInfo && (
//                                                             <span className="px-1.5 py-0.5 bg-indigo-200 dark:bg-indigo-800 rounded text-xs font-bold">
//                                                                 {factoryStockInfo.totalBoxes}
//                                                             </span>
//                                                         )}
//                                                         <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
//                                                     </button>
//                                                 );
//                                             })}
//                                         </div>
//                                     </div>
//                                 )}

//                                 {/* Meta Information */}
//                                 <div>
//                                     <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
//                                         Information
//                                     </h3>
//                                     <div className="bg-background dark:bg-dark-background rounded-xl border border-border dark:border-dark-border divide-y divide-border dark:divide-dark-border text-sm">
//                                         <div className="flex justify-between p-3">
//                                             <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
//                                                 <Hash size={14} /> Tile ID
//                                             </span>
//                                             <span className="font-mono text-text dark:text-dark-text">{tile.tileId}</span>
//                                         </div>
//                                         {tile.number && (
//                                             <div className="flex justify-between p-3">
//                                                 <span className="text-text-secondary dark:text-dark-text-secondary">Tile Number</span>
//                                                 <span className="font-medium text-text dark:text-dark-text">{tile.number}</span>
//                                             </div>
//                                         )}
//                                         {tile.createdBy && (
//                                             <div className="flex justify-between p-3">
//                                                 <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
//                                                     <User size={14} /> Created By
//                                                 </span>
//                                                 <span className="text-text dark:text-dark-text">
//                                                     {typeof tile.createdBy === 'object' ? tile.createdBy.username : tile.createdBy}
//                                                 </span>
//                                             </div>
//                                         )}
//                                         {tile.createdAt && (
//                                             <div className="flex justify-between p-3">
//                                                 <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
//                                                     <Calendar size={14} /> Created
//                                                 </span>
//                                                 <span className="text-text dark:text-dark-text">
//                                                     {format(parseISO(tile.createdAt), 'dd MMM yyyy')}
//                                                 </span>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </div>
//                             </>
//                         )}
//                     </div>

//                     {/* Footer */}
//                     <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-between flex-shrink-0">
//                         <button 
//                             onClick={onClose}
//                             className="px-4 py-2 text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text transition-colors"
//                         >
//                             Close
//                         </button>
//                         {onEdit && tile && (
//                             <button 
//                                 onClick={() => { onClose(); onEdit(tile); }}
//                                 className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
//                             >
//                                 <Edit size={16} />
//                                 Edit Tile
//                             </button>
//                         )}
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default TileDetailModal;

// FILE LOCATION: src/components/tiles/TileDetailModal.js

import React, { useState, useEffect } from 'react';
import { getTileStockDetails } from '../../api/tileApi';
import { 
    X, Loader2, AlertCircle, Ruler, Droplets, Box, Package, 
    CheckCircle, TrendingUp, Factory, Calendar, User, Hash, 
    Edit, ExternalLink, Truck, Boxes, ArrowRight, FileText, FileSpreadsheet
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { generatePDFReport, generateExcelReport } from '../../utils/reportGenerator';
import ReportExportButtons from '../common/ReportExportButtons';

const TileDetailModal = ({ tileId, onClose, onEdit }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tile, setTile] = useState(null);
    const [factoryStock, setFactoryStock] = useState({ total: 0, byFactory: [] });
    const [transitStock, setTransitStock] = useState({ total: 0, pallets: 0, khatlis: 0 });
    const [loadedStock, setLoadedStock] = useState({ total: 0 });
    const [lightboxOpen, setLightboxOpen] = useState(false);

    useEffect(() => {
        const fetchTileDetails = async () => {
            if (!tileId) return;
            setLoading(true);
            setError('');
            try {
                const response = await getTileStockDetails(tileId);
                const data = response?.data || response;
                
                setTile(data.tile);
                setFactoryStock(data.factoryStock || { total: 0, byFactory: [] });
                setTransitStock(data.transitStock || { total: 0, pallets: 0, khatlis: 0 });
                setLoadedStock(data.loadedStock || { total: 0 });
            } catch (err) {
                console.error('Error fetching tile details:', err);
                setError('Failed to load tile details.');
            } finally {
                setLoading(false);
            }
        };

        fetchTileDetails();
    }, [tileId]);

    const handleFactoryClick = (factoryId) => {
        onClose();
        navigate(`/factory-stock?factory=${factoryId}`);
    };

    const getStockStatus = () => {
        if (!tile) return { label: 'Unknown', color: 'gray', icon: AlertCircle };
        const available = tile.stockDetails?.availableStock || 0;
        const threshold = tile.restockThreshold || 0;
        
        if (available === 0) {
            return { label: 'Out of Stock', color: 'red', icon: AlertCircle };
        } else if (available < threshold) {
            return { label: 'Low Stock', color: 'amber', icon: TrendingUp };
        }
        return { label: 'In Stock', color: 'green', icon: CheckCircle };
    };

    const stockStatus = getStockStatus();
    const StatusIcon = stockStatus.icon;

    // ===== EXPORT HANDLERS =====
    const handleExportPDF = async () => {
        if (!tile) return;
        
        // Build subtitle safely - only include values that exist
        const subtitleParts = [];
        if (tile.tileNumber) subtitleParts.push(tile.tileNumber);
        if (tile.size) subtitleParts.push(tile.size);
        if (tile.surface) subtitleParts.push(tile.surface);
        const subtitle = subtitleParts.length > 0 ? subtitleParts.join(' | ') : '';
        
        await generatePDFReport({
            title: `Tile - ${tile.name}`,
            subtitle: subtitle,
            headerInfo: [
                { label: 'Tile Number', value: tile.tileNumber || '-' },
                { label: 'Name', value: tile.name || '-' },
                { label: 'Size', value: tile.size || '-' },
                { label: 'Surface', value: tile.surface || '-' },
                { label: 'Boxes per Sq.M', value: tile.boxesPerSqMeter || 'N/A' },
                { label: 'Restock Threshold', value: tile.restockThreshold || 0 },
                { label: 'Status', value: tile.status || 'Active' },
                { label: 'Stock Status', value: stockStatus.label },
            ],
            summaryData: [
                { label: 'Available', value: tile.stockDetails?.availableStock || 0, color: 'green' },
                { label: 'Booked', value: tile.stockDetails?.bookedStock || 0, color: 'blue' },
                { label: 'Restocking', value: tile.stockDetails?.restockingStock || 0, color: 'orange' },
                { label: 'In Factory', value: factoryStock.total || 0, color: 'purple' },
                { label: 'In Transit', value: transitStock.total || 0, color: 'cyan' },
            ],
            tableColumns: [
                { key: 'sNo', header: 'S.No', width: 15 },
                { key: 'factory', header: 'Factory', width: 50 },
                { key: 'pallets', header: 'Pallets', width: 30, align: 'center' },
                { key: 'khatlis', header: 'Khatlis', width: 30, align: 'center' },
                { key: 'boxes', header: 'Total Boxes', width: 35, align: 'right' },
            ],
            tableData: (factoryStock.byFactory || []).map((f, idx) => ({
                sNo: idx + 1,
                factory: f.factoryName || 'Unknown',
                pallets: f.pallets || 0,
                khatlis: f.khatlis || 0,
                boxes: f.boxes || 0,
            })),
            fileName: `Tile_${tile.tileNumber || tile.name || 'details'}`,
            orientation: 'portrait',
        });
    };

    const handleExportExcel = async () => {
        if (!tile) return;
        
        await generateExcelReport({
            title: `Tile - ${tile.name}`,
            headerInfo: [
                { label: 'Tile Number', value: tile.tileNumber || '-' },
                { label: 'Name', value: tile.name || '-' },
                { label: 'Size', value: tile.size || '-' },
                { label: 'Surface', value: tile.surface || '-' },
            ],
            summaryData: [
                { label: 'Available Stock', value: tile.stockDetails?.availableStock || 0 },
                { label: 'Booked Stock', value: tile.stockDetails?.bookedStock || 0 },
                { label: 'In Factory', value: factoryStock.total || 0 },
                { label: 'In Transit', value: transitStock.total || 0 },
            ],
            tableColumns: [
                { key: 'sNo', header: 'S.No' },
                { key: 'factory', header: 'Factory' },
                { key: 'pallets', header: 'Pallets' },
                { key: 'khatlis', header: 'Khatlis' },
                { key: 'boxes', header: 'Total Boxes' },
            ],
            tableData: (factoryStock.byFactory || []).map((f, idx) => ({
                sNo: idx + 1,
                factory: f.factoryName || 'Unknown',
                pallets: f.pallets || 0,
                khatlis: f.khatlis || 0,
                boxes: f.boxes || 0,
            })),
            fileName: `Tile_${tile.tileNumber || tile.name || 'details'}`,
            sheetName: 'Tile Details',
        });
    };

    if (!tileId) return null;

    return (
        <>
            {/* Image Lightbox */}
            {lightboxOpen && tile?.imageUrl && (
                <div 
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
                    onClick={() => setLightboxOpen(false)}
                >
                    <button 
                        onClick={() => setLightboxOpen(false)}
                        className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20"
                    >
                        <X size={24} className="text-white" />
                    </button>
                    <img 
                        src={tile.imageUrl} 
                        alt={tile.name}
                        className="max-w-full max-h-full object-contain"
                    />
                </div>
            )}

            {/* Main Modal */}
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
                    
                    {/* Hero Image Header */}
                    <div className="relative h-48 md:h-64 bg-gradient-to-br from-gray-800 to-gray-900 flex-shrink-0">
                        {tile?.imageUrl ? (
                            <img 
                                src={tile.imageUrl} 
                                alt={tile.name}
                                className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                onClick={() => setLightboxOpen(true)}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <Box size={64} className="text-gray-600" />
                            </div>
                        )}
                        
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                        
                        {/* Close & Edit Buttons */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            {tile && (
                                <>
                                    <button 
                                        onClick={handleExportPDF}
                                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                                        title="Export PDF"
                                    >
                                        <FileText size={20} className="text-white" />
                                    </button>
                                    <button 
                                        onClick={handleExportExcel}
                                        className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                                        title="Export Excel"
                                    >
                                        <FileSpreadsheet size={20} className="text-white" />
                                    </button>
                                </>
                            )}
                            {onEdit && (
                                <button 
                                    onClick={() => { onClose(); onEdit(tile); }}
                                    className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                                >
                                    <Edit size={20} className="text-white" />
                                </button>
                            )}
                            <button 
                                onClick={onClose}
                                className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                            >
                                <X size={20} className="text-white" />
                            </button>
                        </div>
                        
                        {/* Title Overlay */}
                        {tile && (
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <h2 className="text-2xl md:text-3xl font-bold text-white">{tile.name}</h2>
                                        <div className="flex flex-wrap items-center gap-3 mt-2 text-white/80 text-sm">
                                            {tile.number && <span className="font-mono">#{tile.number}</span>}
                                            <span className="flex items-center gap-1"><Ruler size={14} /> {tile.size}</span>
                                            <span className="flex items-center gap-1"><Droplets size={14} /> {tile.surface}</span>
                                        </div>
                                    </div>
                                    <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold ${
                                        stockStatus.color === 'green' ? 'bg-green-500/80 text-white' :
                                        stockStatus.color === 'amber' ? 'bg-amber-500/80 text-white' :
                                        'bg-red-500/80 text-white'
                                    }`}>
                                        <StatusIcon size={14} />
                                        {stockStatus.label}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-grow overflow-y-auto p-6 space-y-6">
                        {loading && (
                            <div className="flex justify-center py-16">
                                <Loader2 size={48} className="animate-spin text-primary" />
                            </div>
                        )}
                        
                        {error && (
                            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        )}

                        {tile && !loading && (
                            <>
                                {/* Stock Overview - 5 Cards including Transit */}
                                <div>
                                    <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
                                        Stock Overview
                                    </h3>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800 text-center">
                                            <CheckCircle size={20} className="mx-auto text-green-600 dark:text-green-400 mb-1" />
                                            <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                                {tile.stockDetails?.availableStock || 0}
                                            </p>
                                            <p className="text-xs text-green-700 dark:text-green-300">Available</p>
                                        </div>
                                        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800 text-center">
                                            <Package size={20} className="mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                                            <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                                {tile.stockDetails?.bookedStock || 0}
                                            </p>
                                            <p className="text-xs text-blue-700 dark:text-blue-300">Booked</p>
                                        </div>
                                        <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800 text-center">
                                            <TrendingUp size={20} className="mx-auto text-amber-600 dark:text-amber-400 mb-1" />
                                            <p className="text-xl font-bold text-amber-600 dark:text-amber-400">
                                                {tile.stockDetails?.restockingStock || 0}
                                            </p>
                                            <p className="text-xs text-amber-700 dark:text-amber-300">Restocking</p>
                                        </div>
                                        <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl border border-purple-200 dark:border-purple-800 text-center">
                                            <Factory size={20} className="mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                                            <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                                {factoryStock.total}
                                            </p>
                                            <p className="text-xs text-purple-700 dark:text-purple-300">In Factory</p>
                                        </div>
                                        <div className="p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800 text-center">
                                            <Truck size={20} className="mx-auto text-cyan-600 dark:text-cyan-400 mb-1" />
                                            <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400">
                                                {transitStock.total}
                                            </p>
                                            <p className="text-xs text-cyan-700 dark:text-cyan-300">In Transit</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Factory Stock Breakdown */}
                                {factoryStock.byFactory && factoryStock.byFactory.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
                                            Factory Stock Breakdown ({factoryStock.total} boxes total)
                                        </h3>
                                        <div className="space-y-2">
                                            {factoryStock.byFactory.map((factory) => (
                                                <div 
                                                    key={factory.factoryId}
                                                    onClick={() => handleFactoryClick(factory.factoryId)}
                                                    className="flex items-center justify-between p-3 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border hover:border-primary dark:hover:border-primary cursor-pointer transition-colors group"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                                            <Factory size={18} className="text-purple-600 dark:text-purple-400" />
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold text-text dark:text-dark-text group-hover:text-primary transition-colors">
                                                                {factory.factoryName}
                                                            </p>
                                                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                                                                {factory.palletCount} pallets • {factory.khatliCount} khatlis
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                                                            {factory.totalBoxes} boxes
                                                        </span>
                                                        <ExternalLink size={16} className="text-text-secondary group-hover:text-primary transition-colors" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Transit Stock Details */}
                                {transitStock.total > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
                                            In Transit Details
                                        </h3>
                                        <div className="p-4 bg-cyan-50 dark:bg-cyan-900/20 rounded-xl border border-cyan-200 dark:border-cyan-800">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-cyan-100 dark:bg-cyan-900/40 rounded-lg">
                                                    <Truck size={24} className="text-cyan-600 dark:text-cyan-400" />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-bold text-cyan-700 dark:text-cyan-300">
                                                        {transitStock.total} boxes in transit
                                                    </p>
                                                    <p className="text-sm text-cyan-600 dark:text-cyan-400">
                                                        {transitStock.pallets} pallets • {transitStock.khatlis} khatlis
                                                    </p>
                                                </div>
                                                <ArrowRight size={20} className="text-cyan-500" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Loaded Stock (in containers but not dispatched) */}
                                {loadedStock.total > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
                                            Loaded in Containers (Not Dispatched)
                                        </h3>
                                        <div className="p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl border border-orange-200 dark:border-orange-800">
                                            <div className="flex items-center gap-4">
                                                <div className="p-3 bg-orange-100 dark:bg-orange-900/40 rounded-lg">
                                                    <Boxes size={24} className="text-orange-600 dark:text-orange-400" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-orange-700 dark:text-orange-300">
                                                        {loadedStock.total} boxes loaded
                                                    </p>
                                                    <p className="text-sm text-orange-600 dark:text-orange-400">
                                                        In containers, awaiting dispatch
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Tile Details */}
                                <div>
                                    <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
                                        Tile Details
                                    </h3>
                                    <div className="bg-background dark:bg-dark-background rounded-xl border border-border dark:border-dark-border divide-y divide-border dark:divide-dark-border">
                                        <div className="flex justify-between p-3">
                                            <span className="text-text-secondary dark:text-dark-text-secondary">Size</span>
                                            <span className="font-medium text-text dark:text-dark-text">{tile.size}</span>
                                        </div>
                                        <div className="flex justify-between p-3">
                                            <span className="text-text-secondary dark:text-dark-text-secondary">Surface</span>
                                            <span className="font-medium text-text dark:text-dark-text">{tile.surface}</span>
                                        </div>
                                        <div className="flex justify-between p-3">
                                            <span className="text-text-secondary dark:text-dark-text-secondary">Boxes per Sq.M.</span>
                                            <span className="font-medium text-text dark:text-dark-text">{tile.conversionFactor || 1}</span>
                                        </div>
                                        <div className="flex justify-between p-3">
                                            <span className="text-text-secondary dark:text-dark-text-secondary">Restock Threshold</span>
                                            <span className="font-medium text-text dark:text-dark-text">{tile.restockThreshold || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Manufacturing Factories (Clickable) */}
                                {tile.manufacturingFactories && tile.manufacturingFactories.length > 0 && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
                                            Manufacturing Factories ({tile.manufacturingFactories.length})
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {tile.manufacturingFactories.map((factory) => {
                                                const factoryId = typeof factory === 'object' ? factory._id : factory;
                                                const factoryName = typeof factory === 'object' ? factory.name : 'Unknown';
                                                
                                                const factoryStockInfo = factoryStock.byFactory?.find(
                                                    f => f.factoryId.toString() === factoryId.toString()
                                                );
                                                
                                                return (
                                                    <button
                                                        key={factoryId}
                                                        onClick={() => handleFactoryClick(factoryId)}
                                                        className="flex items-center gap-2 px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors group"
                                                    >
                                                        <Factory size={16} />
                                                        <span className="font-medium">{factoryName}</span>
                                                        {factoryStockInfo && (
                                                            <span className="px-1.5 py-0.5 bg-indigo-200 dark:bg-indigo-800 rounded text-xs font-bold">
                                                                {factoryStockInfo.totalBoxes}
                                                            </span>
                                                        )}
                                                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Meta Information */}
                                <div>
                                    <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-3">
                                        Information
                                    </h3>
                                    <div className="bg-background dark:bg-dark-background rounded-xl border border-border dark:border-dark-border divide-y divide-border dark:divide-dark-border text-sm">
                                        <div className="flex justify-between p-3">
                                            <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                                                <Hash size={14} /> Tile ID
                                            </span>
                                            <span className="font-mono text-text dark:text-dark-text">{tile.tileId}</span>
                                        </div>
                                        {tile.number && (
                                            <div className="flex justify-between p-3">
                                                <span className="text-text-secondary dark:text-dark-text-secondary">Tile Number</span>
                                                <span className="font-medium text-text dark:text-dark-text">{tile.number}</span>
                                            </div>
                                        )}
                                        {tile.createdBy && (
                                            <div className="flex justify-between p-3">
                                                <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                                                    <User size={14} /> Created By
                                                </span>
                                                <span className="text-text dark:text-dark-text">
                                                    {typeof tile.createdBy === 'object' ? tile.createdBy.username : tile.createdBy}
                                                </span>
                                            </div>
                                        )}
                                        {tile.createdAt && (
                                            <div className="flex justify-between p-3">
                                                <span className="text-text-secondary dark:text-dark-text-secondary flex items-center gap-2">
                                                    <Calendar size={14} /> Created
                                                </span>
                                                <span className="text-text dark:text-dark-text">
                                                    {format(parseISO(tile.createdAt), 'dd MMM yyyy')}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-between flex-shrink-0">
                        <button 
                            onClick={onClose}
                            className="px-4 py-2 text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text transition-colors"
                        >
                            Close
                        </button>
                        {onEdit && tile && (
                            <button 
                                onClick={() => { onClose(); onEdit(tile); }}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                            >
                                <Edit size={16} />
                                Edit Tile
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default TileDetailModal;