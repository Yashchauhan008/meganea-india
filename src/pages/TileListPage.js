// // import React, { useState, useEffect, useCallback } from 'react';
// // import { getAllTiles, deleteTile, getTileById } from '../api/tileApi';
// // import TileFormModal from '../components/tiles/TileFormModal';
// // import { PlusCircle, Edit, Trash2, Layers, Search, ChevronLeft, ChevronRight, Factory } from 'lucide-react';
// // import useDebounce from '../hooks/useDebounce';
// // import Select from '../components/ui/Select';
// // import { LazyLoadImage } from 'react-lazy-load-image-component';
// // import 'react-lazy-load-image-component/src/effects/blur.css';

// // const PAGE_LIMIT = 50;

// // const ImageLightbox = ({ src, alt, onClose }) => (
// //     <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]" onClick={onClose}>
// //         <img src={src} alt={alt} className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
// //     </div>
// // );

// // const TileListPage = () => {
// //     const [tiles, setTiles] = useState([]);
// //     const [loading, setLoading] = useState(true);
// //     const [error, setError] = useState('');
// //     const [isModalOpen, setIsModalOpen] = useState(false);
// //     const [editingTile, setEditingTile] = useState(null);
// //     const [expandedImage, setExpandedImage] = useState(null);
// //     const [searchTerm, setSearchTerm] = useState('');
// //     const [sizeFilter, setSizeFilter] = useState('');
// //     const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
// //     const debouncedSearchTerm = useDebounce(searchTerm, 500);
// //     const [allUniqueSizes, setAllUniqueSizes] = useState([]);

// //     const fetchTiles = useCallback(async () => {
// //         setLoading(true);
// //         setError('');
// //         try {
// //             const params = { page: pagination.page, search: debouncedSearchTerm, size: sizeFilter, limit: PAGE_LIMIT };
// //             const { data } = await getAllTiles(params);
// //             setTiles(data.tiles);
// //             setPagination({ page: data.page, pages: data.pages, total: data.total });
// //         } catch (err) {
// //             setError(err.response?.data?.message || 'Failed to fetch tiles.');
// //         } finally {
// //             setLoading(false);
// //         }
// //     }, [pagination.page, debouncedSearchTerm, sizeFilter]);

// //     useEffect(() => {
// //         const fetchAllSizes = async () => {
// //             try {
// //                 const { data } = await getAllTiles({ limit: 1000 });
// //                 const sizes = [...new Set(data.tiles.map(tile => tile.size))].sort();
// //                 setAllUniqueSizes(sizes);
// //             } catch (err) { console.error("Could not fetch tile sizes for filter."); }
// //         };
// //         fetchAllSizes();
// //     }, []);

// //     useEffect(() => { fetchTiles(); }, [fetchTiles]);

// //     const handleAdd = () => { setEditingTile(null); setIsModalOpen(true); };
// //     const handleEdit = async (id) => { const { data } = await getTileById(id); setEditingTile(data); setIsModalOpen(true); };
// //     const handleDelete = async (id) => { if (window.confirm('Are you sure you want to archive this tile?')) { await deleteTile(id); fetchTiles(); } };
// //     const handlePageChange = (newPage) => { setPagination(prev => ({ ...prev, page: newPage })); };

// //     return (
// //         <div className="p-4 sm:p-6 md:p-8">
// //             {isModalOpen && <TileFormModal tile={editingTile} onClose={() => setIsModalOpen(false)} onSave={fetchTiles} />}
// //             {expandedImage && <ImageLightbox src={expandedImage.src} alt={expandedImage.alt} onClose={() => setExpandedImage(null)} />}

// //             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
// //                 <h1 className="text-3xl font-bold text-text dark:text-dark-text">Master Tile List</h1>
// //                 <button onClick={handleAdd} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover shadow-sm w-full sm:w-auto">
// //                     <PlusCircle size={20} className="mr-2" /> Add Tile
// //                 </button>
// //             </div>

// //             <div className="flex flex-wrap items-center gap-4 mb-6">
// //                 <div className="relative flex-grow min-w-[250px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={20} /><input type="text" placeholder="Search by name or number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full pl-10" /></div>
// //                 <Select value={sizeFilter} onChange={(e) => { setSizeFilter(e.target.value); setPagination(p => ({...p, page: 1})); }} className="w-full sm:w-auto"><option value="">All Sizes</option>{allUniqueSizes.map(size => <option key={size} value={size}>{size}</option>)}</Select>
// //             </div>

// //             {loading && <div className="text-center p-8">Loading...</div>}
// //             {!loading && error && <div className="p-6 text-center text-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg"><h2 className="font-bold text-lg">An Error Occurred</h2><p>{error}</p></div>}
            
// //             {!loading && !error && (
// //                 <>
// //                     <div className="space-y-5">
// //                         {tiles.map((tile) => (
// //                             <div key={tile._id} className="flex flex-col md:flex-row bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg">
// //                                 <div className="w-full md:w-56 flex-shrink-0 h-56 cursor-pointer" onClick={() => setExpandedImage({ src: tile.imageUrl, alt: tile.name })}>
// //                                     <LazyLoadImage alt={tile.name} src={tile.imageUrl} effect="blur" className="w-full h-full object-cover" wrapperClassName="w-full h-full" placeholder={<div className="w-full h-full flex items-center justify-center bg-background dark:bg-dark-background"><Layers size={48} className="text-text-secondary/50" /></div>} />
// //                                 </div>
// //                                 <div className="flex-grow p-5 flex flex-col justify-between">
// //                                     <div>
// //                                         <div className="flex justify-between items-start mb-4">
// //                                             <div>
// //                                                 <h3 className="font-bold text-xl text-text dark:text-dark-text">{tile.name}{tile.number && <span className="ml-2 font-light text-text-secondary dark:text-dark-text-secondary">({tile.number})</span>}</h3>
// //                                                 <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{tile.size} • {tile.surface}</p>
// //                                             </div>
// //                                             <div className="flex space-x-2"><button onClick={() => handleEdit(tile._id)} className="p-2 text-text-secondary/70 hover:text-primary"><Edit size={18} /></button><button onClick={() => handleDelete(tile._id)} className="p-2 text-text-secondary/70 hover:text-red-500"><Trash2 size={18} /></button></div>
// //                                         </div>
                                        
// //                                         {/* --- CORRECTED DISPLAY: SHOW FACTORIES, NOT STOCK --- */}
// //                                         {tile.manufacturingFactories && tile.manufacturingFactories.length > 0 ? (
// //                                             <div className="mb-4">
// //                                                 <h4 className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-2 flex items-center gap-2"><Factory size={14}/> Manufacturing Factories</h4>
// //                                                 <div className="flex flex-wrap gap-2">
// //                                                     {tile.manufacturingFactories.map(factory => (
// //                                                         <span key={factory._id} className="bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary text-xs font-medium px-2 py-1 rounded-full">
// //                                                             {factory.name}
// //                                                         </span>
// //                                                     ))}
// //                                                 </div>
// //                                             </div>
// //                                         ) : (
// //                                             <div className="mb-4 p-3 rounded-lg bg-background dark:bg-dark-background text-center text-sm text-text-secondary">
// //                                                 No manufacturing factories assigned.
// //                                             </div>
// //                                         )}
// //                                         {/* --- END OF CORRECTION --- */}

// //                                     </div>
// //                                     <div className="text-xs text-text-secondary dark:text-dark-text-secondary mt-4">Created by: {tile.createdBy?.username || 'N/A'}</div>
// //                                 </div>
// //                             </div>
// //                         ))}
// //                     </div>
                    
// //                     <div className="flex justify-between items-center mt-8">
// //                         <span className="text-sm text-text-secondary dark:text-dark-text-secondary">Page {pagination.page} of {pagination.pages || 1} (Total: {pagination.total} tiles)</span>
// //                         <div className="flex gap-2"><button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background"><ChevronLeft size={20} /></button><button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background"><ChevronRight size={20} /></button></div>
// //                     </div>
// //                 </>
// //             )}
// //         </div>
// //     );
// // };

// // export default TileListPage;
// import React, { useState, useEffect, useCallback } from 'react';
// import { getAllTiles, deleteTile, getTileById } from '../api/tileApi';
// import BulkUploadModal from '../components/tiles/BulkUploadModal';
// import TileFormModal from '../components/tiles/TileFormModal';
// import ImageLightbox from '../components/ui/ImageLightbox';
// import { PlusCircle, Edit, Trash2, Layers, Search, ChevronLeft, ChevronRight, Factory, Upload } from 'lucide-react';
// import useDebounce from '../hooks/useDebounce';
// import Select from '../components/ui/Select';
// import { LazyLoadImage } from 'react-lazy-load-image-component';
// import 'react-lazy-load-image-component/src/effects/blur.css';

// const PAGE_LIMIT = 50;

// const TileListPage = () => {
//     // State for data and UI control
//     const [tiles, setTiles] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');

//     // State for modals
//     const [isFormModalOpen, setIsFormModalOpen] = useState(false);
//     const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
//     const [editingTile, setEditingTile] = useState(null);
//     const [expandedImage, setExpandedImage] = useState(null);

//     // State for filtering and pagination
//     const [searchTerm, setSearchTerm] = useState('');
//     const [sizeFilter, setSizeFilter] = useState('');
//     const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
//     const debouncedSearchTerm = useDebounce(searchTerm, 500);
//     const [allUniqueSizes, setAllUniqueSizes] = useState([]);

//     // Main data fetching function
//     const fetchTiles = useCallback(async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const params = {
//                 page: pagination.page,
//                 search: debouncedSearchTerm,
//                 size: sizeFilter,
//                 limit: PAGE_LIMIT
//             };
//             const { data } = await getAllTiles(params);
//             setTiles(data.tiles);
//             setPagination({ page: data.page, pages: data.pages, total: data.total });
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to fetch tiles.');
//         } finally {
//             setLoading(false);
//         }
//     }, [pagination.page, debouncedSearchTerm, sizeFilter]);

//     // Effect to fetch all unique sizes for the filter dropdown once
//     useEffect(() => {
//         const fetchAllSizes = async () => {
//             try {
//                 // Fetch a large number to get all possible sizes, assuming less than 1000 unique sizes
//                 const { data } = await getAllTiles({ limit: 1000 });
//                 const sizes = [...new Set(data.tiles.map(tile => tile.size))].sort();
//                 setAllUniqueSizes(sizes);
//             } catch (err) {
//                 console.error("Could not fetch tile sizes for filter.");
//             }
//         };
//         fetchAllSizes();
//     }, []);

//     // Effect to refetch tiles when dependencies change
//     useEffect(() => {
//         fetchTiles();
//     }, [fetchTiles]);

//     // Handlers for CRUD operations and UI interactions
//     const handleAdd = () => {
//         setEditingTile(null);
//         setIsFormModalOpen(true);
//     };

//     const handleEdit = async (id) => {
//         try {
//             const { data } = await getTileById(id);
//             setEditingTile(data);
//             setIsFormModalOpen(true);
//         } catch (err) {
//             setError('Failed to fetch tile details for editing.');
//         }
//     };

//     const handleDelete = async (id) => {
//         if (window.confirm('Are you sure you want to archive this tile? This action cannot be undone.')) {
//             try {
//                 await deleteTile(id);
//                 fetchTiles(); // Refresh the list
//             } catch (err) {
//                 setError('Failed to delete tile.');
//             }
//         }
//     };

//     const handlePageChange = (newPage) => {
//         setPagination(prev => ({ ...prev, page: newPage }));
//     };

//     const handleBulkSave = () => {
//         setIsBulkUploadModalOpen(false);
//         fetchTiles(); // Refresh the list after successful import
//     };

//     return (
//         <div className="p-4 sm:p-6 md:p-8">
//             {/* Modals */}
//             {isFormModalOpen && <TileFormModal tile={editingTile} onClose={() => setIsFormModalOpen(false)} onSave={fetchTiles} />}
//             {isBulkUploadModalOpen && <BulkUploadModal onClose={() => setIsBulkUploadModalOpen(false)} onSave={handleBulkSave} />}
//             {expandedImage && <ImageLightbox src={expandedImage.src} alt={expandedImage.alt} onClose={() => setExpandedImage(null)} />}

//             {/* Header */}
//             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
//                 <h1 className="text-3xl font-bold text-text dark:text-dark-text">Master Tile List</h1>
//                 <div className="flex items-center gap-2 w-full sm:w-auto">
//                     <button onClick={() => setIsBulkUploadModalOpen(true)} className="flex items-center justify-center bg-dark-foreground text-white px-4 py-2 text-nowrap rounded-md hover:bg-secondary-hover shadow-sm w-full">
//                         <Upload size={20} className="mr-2" /> Bulk Upload
//                     </button>
//                     <button onClick={handleAdd} className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover shadow-sm w-full">
//                         <PlusCircle size={20} className="mr-2" /> Add Tile
//                     </button>
//                 </div>
//             </div>

//             {/* Filters */}
//             <div className="flex flex-wrap items-center gap-4 mb-6">
//                 <div className="relative flex-grow min-w-[250px]">
//                     <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={20} />
//                     <input
//                         type="text"
//                         placeholder="Search by name or number..."
//                         value={searchTerm}
//                         onChange={(e) => setSearchTerm(e.target.value)}
//                         className="form-input w-full pl-10"
//                     />
//                 </div>
//                 <Select
//                     value={sizeFilter}
//                     onChange={(e) => { setSizeFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}
//                     className="w-full sm:w-auto"
//                 >
//                     <option value="">All Sizes</option>
//                     {allUniqueSizes.map(size => <option key={size} value={size}>{size}</option>)}
//                 </Select>
//             </div>

//             {/* Content Area */}
//             {loading && <div className="text-center p-8 text-text dark:text-dark-text">Loading...</div>}
//             {!loading && error && (
//                 <div className="p-6 text-center text-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg">
//                     <h2 className="font-bold text-lg">An Error Occurred</h2>
//                     <p>{error}</p>
//                 </div>
//             )}
            
//             {!loading && !error && (
//                 <>
//                     <div className="space-y-5">
//                         {tiles.map((tile) => (
//                             <div key={tile._id} className="flex flex-col md:flex-row bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg">
//                                 <div className="w-full md:w-56 flex-shrink-0 h-56 bg-background dark:bg-dark-background cursor-pointer" onClick={() => setExpandedImage({ src: tile.imageUrl, alt: tile.name })}>
//                                     <LazyLoadImage
//                                         alt={tile.name}
//                                         src={tile.imageUrl}
//                                         effect="blur"
//                                         className="w-full h-full object-cover"
//                                         wrapperClassName="w-full h-full"
//                                         placeholder={<div className="w-full h-full flex items-center justify-center"><Layers size={48} className="text-text-secondary/50" /></div>}
//                                     />
//                                 </div>
//                                 <div className="flex-grow p-5 flex flex-col justify-between">
//                                     <div>
//                                         <div className="flex justify-between items-start mb-4">
//                                             <div>
//                                                 <h3 className="font-bold text-xl text-text dark:text-dark-text">{tile.name}{tile.number && <span className="ml-2 font-light text-text-secondary dark:text-dark-text-secondary">({tile.number})</span>}</h3>
//                                                 <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{tile.size} • {tile.surface}</p>
//                                             </div>
//                                             <div className="flex space-x-2">
//                                                 <button onClick={() => handleEdit(tile._id)} className="p-2 text-text-secondary/70 hover:text-primary dark:hover:text-dark-primary"><Edit size={18} /></button>
//                                                 <button onClick={() => handleDelete(tile._id)} className="p-2 text-text-secondary/70 hover:text-red-500"><Trash2 size={18} /></button>
//                                             </div>
//                                         </div>
                                        
//                                         {tile.manufacturingFactories && tile.manufacturingFactories.length > 0 ? (
//                                             <div className="mb-4">
//                                                 <h4 className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-2 flex items-center gap-2"><Factory size={14}/> Manufacturing Factories</h4>
//                                                 <div className="flex flex-wrap gap-2">
//                                                     {tile.manufacturingFactories.map(factory => (
//                                                         <span key={factory._id} className="bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary text-xs font-medium px-2 py-1 rounded-full">
//                                                             {factory.name}
//                                                         </span>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                         ) : (
//                                             <div className="mb-4 p-3 rounded-lg bg-background dark:bg-dark-background text-center text-sm text-text-secondary">
//                                                 No manufacturing factories assigned.
//                                             </div>
//                                         )}
//                                     </div>
//                                     <div className="text-xs text-text-secondary dark:text-dark-text-secondary mt-4">Created by: {tile.createdBy?.username || 'N/A'}</div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
                    
//                     {/* Pagination Controls */}
//                     <div className="flex justify-between items-center mt-8">
//                         <span className="text-sm text-text-secondary dark:text-dark-text-secondary">Page {pagination.page} of {pagination.pages || 1} (Total: {pagination.total} tiles)</span>
//                         <div className="flex gap-2">
//                             <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background">
//                                 <ChevronLeft size={20} />
//                             </button>
//                             <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background">
//                                 <ChevronRight size={20} />
//                             </button>
//                         </div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default TileListPage;
// FILE LOCATION: src/pages/TileListPage.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllTiles, deleteTile, getUniqueSizes } from '../api/tileApi';
import TileFormModal from '../components/tiles/TileFormModal';
import TileDetailModal from '../components/tiles/TileDetailModal';
import BulkUploadModal from '../components/tiles/BulkUploadModal';
import { 
    PlusCircle, Edit, Trash2, Layers, Search, ChevronLeft, ChevronRight, 
    Factory, Upload, Loader2, Grid, List, Eye, Ruler, 
    Box, Package, AlertCircle, X, Sparkles, Truck,
    TrendingUp, CheckCircle, Image
} from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const PAGE_LIMIT = 12;

// Image Lightbox Component
const ImageLightbox = ({ src, alt, onClose }) => (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4" onClick={onClose}>
        <button 
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
            onClick={onClose}
        >
            <X size={24} className="text-white" />
        </button>
        <img 
            src={src} 
            alt={alt} 
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl" 
            onClick={(e) => e.stopPropagation()} 
        />
    </div>
);

// Tile Card Component
const TileCard = ({ tile, onView, onEdit, onDelete, onImageClick, viewMode }) => {
    const stockDetails = tile.stockDetails || {};
    const availableStock = stockDetails.availableStock || 0;
    const bookedStock = stockDetails.bookedStock || 0;
    const restockingStock = stockDetails.restockingStock || 0;
    const inFactoryStock = stockDetails.inFactoryStock || 0;
    const transitStock = stockDetails.transitStock || 0;
    const totalStock = availableStock + bookedStock + inFactoryStock;

    const getStockStatus = () => {
        if (totalStock === 0) return { label: 'Out of Stock', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' };
        if (availableStock < (tile.restockThreshold || 10)) return { label: 'Low Stock', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30' };
        return { label: 'In Stock', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30' };
    };
    
    const stockStatus = getStockStatus();

    if (viewMode === 'list') {
        return (
            <div 
                className="flex flex-col md:flex-row bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all group cursor-pointer"
                onClick={() => onView(tile._id)}
            >
                {/* Image */}
                <div 
                    className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 bg-background dark:bg-dark-background relative overflow-hidden"
                    onClick={(e) => { e.stopPropagation(); onImageClick({ src: tile.imageUrl, alt: tile.name }); }}
                >
                    {tile.imageUrl ? (
                        <LazyLoadImage
                            alt={tile.name}
                            src={tile.imageUrl}
                            effect="blur"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            wrapperClassName="w-full h-full"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <Image size={48} className="text-text-secondary/30" />
                        </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Eye size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-grow p-5 flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-xl text-text dark:text-dark-text">{tile.name}</h3>
                                {tile.number && (
                                    <span className="text-sm text-text-secondary dark:text-dark-text-secondary">({tile.number})</span>
                                )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-text-secondary dark:text-dark-text-secondary">
                                <span className="flex items-center gap-1"><Ruler size={14} /> {tile.size}</span>
                                <span className="flex items-center gap-1">
                                    <Sparkles size={14} /> {tile.surface}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                                    {stockStatus.label}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            <button 
                                onClick={() => onView(tile._id)} 
                                className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="View Details"
                            >
                                <Eye size={18} />
                            </button>
                            <button 
                                onClick={() => onEdit(tile)} 
                                className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Edit Tile"
                            >
                                <Edit size={18} />
                            </button>
                            <button 
                                onClick={() => onDelete(tile._id)} 
                                className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Archive Tile"
                            >
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Stock Info - 5 columns with actual values */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                            <p className="text-lg font-bold text-green-600 dark:text-green-400">{availableStock}</p>
                            <p className="text-xs text-green-700 dark:text-green-300">Available</p>
                        </div>
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-center">
                            <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{bookedStock}</p>
                            <p className="text-xs text-blue-700 dark:text-blue-300">Booked</p>
                        </div>
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-center">
                            <p className="text-lg font-bold text-amber-600 dark:text-amber-400">{restockingStock}</p>
                            <p className="text-xs text-amber-700 dark:text-amber-300">Restocking</p>
                        </div>
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                            <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{inFactoryStock}</p>
                            <p className="text-xs text-purple-700 dark:text-purple-300">In Factory</p>
                        </div>
                        <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg text-center">
                            <p className="text-lg font-bold text-cyan-600 dark:text-cyan-400">{transitStock}</p>
                            <p className="text-xs text-cyan-700 dark:text-cyan-300">In Transit</p>
                        </div>
                    </div>

                    {/* Factories */}
                    {tile.manufacturingFactories && tile.manufacturingFactories.length > 0 ? (
                        <div>
                            <p className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-2 flex items-center gap-1">
                                <Factory size={12} /> Factories
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {tile.manufacturingFactories.map(factory => (
                                    <span 
                                        key={factory._id} 
                                        className="bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300 text-xs font-medium px-2.5 py-1 rounded-full"
                                    >
                                        {factory.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-text-secondary italic">No factories assigned</p>
                    )}
                </div>
            </div>
        );
    }

    // Grid View
    return (
        <div 
            className="bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-xl shadow-sm overflow-hidden hover:shadow-lg hover:border-primary/50 transition-all group cursor-pointer"
            onClick={() => onView(tile._id)}
        >
            {/* Image */}
            <div 
                className="relative h-48 bg-background dark:bg-dark-background overflow-hidden"
                onClick={(e) => { e.stopPropagation(); onImageClick({ src: tile.imageUrl, alt: tile.name }); }}
            >
                {tile.imageUrl ? (
                    <LazyLoadImage
                        alt={tile.name}
                        src={tile.imageUrl}
                        effect="blur"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        wrapperClassName="w-full h-full"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Image size={48} className="text-text-secondary/30" />
                    </div>
                )}
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                {/* Status Badge */}
                <span className={`absolute top-3 left-3 px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                    {stockStatus.label}
                </span>

                {/* Actions */}
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                    <button 
                        onClick={() => onView(tile._id)} 
                        className="p-1.5 bg-white/90 dark:bg-dark-foreground/90 rounded-lg hover:bg-white dark:hover:bg-dark-foreground transition-colors"
                        title="View"
                    >
                        <Eye size={14} className="text-primary" />
                    </button>
                    <button 
                        onClick={() => onEdit(tile)} 
                        className="p-1.5 bg-white/90 dark:bg-dark-foreground/90 rounded-lg hover:bg-white dark:hover:bg-dark-foreground transition-colors"
                        title="Edit"
                    >
                        <Edit size={14} className="text-primary" />
                    </button>
                    <button 
                        onClick={() => onDelete(tile._id)} 
                        className="p-1.5 bg-white/90 dark:bg-dark-foreground/90 rounded-lg hover:bg-white dark:hover:bg-dark-foreground transition-colors"
                        title="Archive"
                    >
                        <Trash2 size={14} className="text-red-500" />
                    </button>
                </div>

                {/* Surface Badge */}
                <span className="absolute bottom-3 right-3 px-2 py-1 bg-black/50 text-white text-xs rounded-full">
                    {tile.surface}
                </span>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="mb-3">
                    <h3 className="font-bold text-lg text-text dark:text-dark-text truncate" title={tile.name}>
                        {tile.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                        <span className="flex items-center gap-1"><Ruler size={12} /> {tile.size}</span>
                        {tile.number && <span>• #{tile.number}</span>}
                    </div>
                </div>

                {/* Quick Stats - 3 columns with actual values */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                        <p className="text-sm font-bold text-green-600 dark:text-green-400">{availableStock}</p>
                        <p className="text-xs text-green-700 dark:text-green-300">Available</p>
                    </div>
                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-center">
                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400">{inFactoryStock}</p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">Factory</p>
                    </div>
                    <div className="p-2 bg-cyan-50 dark:bg-cyan-900/20 rounded-lg text-center">
                        <p className="text-sm font-bold text-cyan-600 dark:text-cyan-400">{transitStock}</p>
                        <p className="text-xs text-cyan-700 dark:text-cyan-300">Transit</p>
                    </div>
                </div>

                {/* Factories */}
                {tile.manufacturingFactories && tile.manufacturingFactories.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                        {tile.manufacturingFactories.slice(0, 2).map(factory => (
                            <span 
                                key={factory._id} 
                                className="bg-gray-100 dark:bg-gray-800 text-text-secondary dark:text-dark-text-secondary text-xs px-2 py-0.5 rounded"
                            >
                                {factory.name}
                            </span>
                        ))}
                        {tile.manufacturingFactories.length > 2 && (
                            <span className="text-xs text-text-secondary">+{tile.manufacturingFactories.length - 2} more</span>
                        )}
                    </div>
                ) : (
                    <p className="text-xs text-text-secondary italic">No factories</p>
                )}
            </div>
        </div>
    );
};

const TileListPage = () => {
    const [tiles, setTiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
    const [editingTile, setEditingTile] = useState(null);
    const [viewingTileId, setViewingTileId] = useState(null);
    const [expandedImage, setExpandedImage] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sizeFilter, setSizeFilter] = useState('');
    const [surfaceFilter, setSurfaceFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [viewMode, setViewMode] = useState('grid');
    const [allUniqueSizes, setAllUniqueSizes] = useState([]);
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    // Fetch tiles
    const fetchTiles = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = { 
                page: pagination.page, 
                search: debouncedSearchTerm, 
                size: sizeFilter,
                surface: surfaceFilter,
                limit: PAGE_LIMIT 
            };
            const response = await getAllTiles(params);
            const data = response?.data || response;
            setTiles(data.tiles || []);
            setPagination({ 
                page: data.page || 1, 
                pages: data.pages || 1, 
                total: data.total || 0 
            });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch tiles.');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, debouncedSearchTerm, sizeFilter, surfaceFilter]);

    // Fetch unique sizes for filter
    useEffect(() => {
        const fetchSizes = async () => {
            try {
                const response = await getUniqueSizes();
                const sizes = response?.data || response || [];
                setAllUniqueSizes(Array.isArray(sizes) ? sizes : []);
            } catch (err) {
                console.error('Could not fetch tile sizes');
            }
        };
        fetchSizes();
    }, []);

    useEffect(() => { 
        fetchTiles(); 
    }, [fetchTiles]);

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        let totalAvailable = 0, totalBooked = 0, totalRestocking = 0, totalInFactory = 0, totalTransit = 0;
        
        tiles.forEach(tile => {
            const stock = tile.stockDetails || {};
            totalAvailable += stock.availableStock || 0;
            totalBooked += stock.bookedStock || 0;
            totalRestocking += stock.restockingStock || 0;
            totalInFactory += stock.inFactoryStock || 0;
            totalTransit += stock.transitStock || 0;
        });

        return {
            totalTiles: pagination.total,
            totalAvailable,
            totalBooked,
            totalRestocking,
            totalInFactory,
            totalTransit,
            lowStockCount: tiles.filter(t => (t.stockDetails?.availableStock || 0) < (t.restockThreshold || 10)).length
        };
    }, [tiles, pagination.total]);

    const handleAdd = () => { setEditingTile(null); setIsFormModalOpen(true); };
    
    const handleView = (tileId) => {
        setViewingTileId(tileId);
    };

    const handleEdit = (tile) => {
        setViewingTileId(null); // Close detail modal if open
        setEditingTile(tile);
        setIsFormModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to archive this tile?')) {
            try {
                await deleteTile(id);
                fetchTiles();
            } catch (err) {
                console.error('Failed to delete tile:', err);
            }
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSizeFilter('');
        setSurfaceFilter('');
        setPagination(prev => ({ ...prev, page: 1 }));
    };

    // Generate page numbers
    const getPageNumbers = () => {
        const pages = [];
        const { page, pages: totalPages } = pagination;
        
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (page <= 3) {
                pages.push(1, 2, 3, 4, '...', totalPages);
            } else if (page >= totalPages - 2) {
                pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
            } else {
                pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
            }
        }
        return pages;
    };

    const hasFilters = searchTerm || sizeFilter || surfaceFilter;

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Modals */}
            {isFormModalOpen && (
                <TileFormModal 
                    tile={editingTile} 
                    onClose={() => setIsFormModalOpen(false)} 
                    onSave={fetchTiles} 
                />
            )}
            {isBulkUploadOpen && (
                <BulkUploadModal 
                    onClose={() => setIsBulkUploadOpen(false)} 
                    onSave={fetchTiles} 
                />
            )}
            {viewingTileId && (
                <TileDetailModal
                    tileId={viewingTileId}
                    onClose={() => setViewingTileId(null)}
                    onEdit={handleEdit}
                />
            )}
            {expandedImage && (
                <ImageLightbox 
                    src={expandedImage.src} 
                    alt={expandedImage.alt} 
                    onClose={() => setExpandedImage(null)} 
                />
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text dark:text-dark-text">Tile Master List</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">
                        Manage all tile designs and their stock levels
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => setIsBulkUploadOpen(true)} 
                        className="flex items-center gap-2 px-4 py-2.5 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors text-text dark:text-dark-text"
                    >
                        <Upload size={18} /> Bulk Upload
                    </button>
                    <button 
                        onClick={handleAdd} 
                        className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
                    >
                        <PlusCircle size={18} /> Add Tile
                    </button>
                </div>
            </div>

            {/* Summary Cards - 7 cards including Transit */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Layers size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.totalTiles}</p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Total Tiles</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.totalAvailable.toLocaleString()}</p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Available</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                            <Package size={20} className="text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.totalBooked.toLocaleString()}</p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Booked</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            <TrendingUp size={20} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.totalRestocking.toLocaleString()}</p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Restocking</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Factory size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.totalInFactory.toLocaleString()}</p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">In Factory</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                            <Truck size={20} className="text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.totalTransit.toLocaleString()}</p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">In Transit</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                            <AlertCircle size={20} className="text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.lowStockCount}</p>
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Low Stock</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters & Controls */}
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                {/* View Toggle */}
                <div className="flex gap-2">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                            viewMode === 'grid'
                                ? 'bg-primary text-white'
                                : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'
                        }`}
                    >
                        <Grid size={18} /> Grid
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                            viewMode === 'list'
                                ? 'bg-primary text-white'
                                : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'
                        }`}
                    >
                        <List size={18} /> List
                    </button>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                    {/* Search */}
                    <div className="relative flex-1 lg:flex-none lg:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                        <input
                            type="text"
                            placeholder="Search tiles..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setPagination(p => ({...p, page: 1})); }}
                            className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text focus:ring-2 focus:ring-primary"
                        />
                    </div>

                    {/* Size Filter */}
                    <select
                        value={sizeFilter}
                        onChange={(e) => { setSizeFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}
                        className="px-4 py-2.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text focus:ring-2 focus:ring-primary min-w-[140px]"
                    >
                        <option value="">All Sizes</option>
                        {allUniqueSizes.map(size => (
                            <option key={size} value={size}>{size}</option>
                        ))}
                    </select>

                    {/* Surface Filter */}
                    <select
                        value={surfaceFilter}
                        onChange={(e) => { setSurfaceFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}
                        className="px-4 py-2.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text focus:ring-2 focus:ring-primary min-w-[140px]"
                    >
                        <option value="">All Surfaces</option>
                        <option value="Glossy">Glossy</option>
                        <option value="Matt">Matt</option>
                    </select>

                    {/* Clear Filters */}
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="flex items-center gap-2 px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <X size={16} /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={fetchTiles} className="ml-auto underline hover:no-underline">Retry</button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 size={48} className="animate-spin text-primary" />
                </div>
            )}

            {/* Content */}
            {!loading && !error && (
                <>
                    {tiles.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl bg-foreground dark:bg-dark-foreground">
                            <Layers size={48} className="mx-auto text-text-secondary/30 mb-4" />
                            <h3 className="text-xl font-semibold text-text dark:text-dark-text">No Tiles Found</h3>
                            <p className="text-text-secondary dark:text-dark-text-secondary mt-2">
                                {hasFilters ? 'Try adjusting your filters.' : 'Add your first tile to get started.'}
                            </p>
                            {!hasFilters && (
                                <button
                                    onClick={handleAdd}
                                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
                                >
                                    <PlusCircle size={16} /> Add First Tile
                                </button>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Grid/List View */}
                            {viewMode === 'grid' ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                    {tiles.map(tile => (
                                        <TileCard
                                            key={tile._id}
                                            tile={tile}
                                            onView={handleView}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onImageClick={setExpandedImage}
                                            viewMode="grid"
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {tiles.map(tile => (
                                        <TileCard
                                            key={tile._id}
                                            tile={tile}
                                            onView={handleView}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                            onImageClick={setExpandedImage}
                                            viewMode="list"
                                        />
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-border dark:border-dark-border">
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                                    Showing {((pagination.page - 1) * PAGE_LIMIT) + 1} - {Math.min(pagination.page * PAGE_LIMIT, pagination.total)} of {pagination.total} tiles
                                </p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => handlePageChange(pagination.page - 1)}
                                        disabled={pagination.page <= 1}
                                        className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background transition-colors text-text dark:text-dark-text"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    
                                    {getPageNumbers().map((pageNum, idx) => (
                                        pageNum === '...' ? (
                                            <span key={`ellipsis-${idx}`} className="px-2 text-text-secondary">...</span>
                                        ) : (
                                            <button
                                                key={pageNum}
                                                onClick={() => handlePageChange(pageNum)}
                                                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                                                    pagination.page === pageNum
                                                        ? 'bg-primary text-white'
                                                        : 'border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background text-text dark:text-dark-text'
                                                }`}
                                            >
                                                {pageNum}
                                            </button>
                                        )
                                    ))}
                                    
                                    <button
                                        onClick={() => handlePageChange(pagination.page + 1)}
                                        disabled={pagination.page >= pagination.pages}
                                        className="p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background transition-colors text-text dark:text-dark-text"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
        </div>
    );
};

export default TileListPage;