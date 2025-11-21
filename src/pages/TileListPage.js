// import React, { useState, useEffect, useCallback } from 'react';
// import { getAllTiles, deleteTile, getTileById } from '../api/tileApi';
// import TileFormModal from '../components/tiles/TileFormModal';
// import { PlusCircle, Edit, Trash2, Layers, Search, ChevronLeft, ChevronRight, Factory } from 'lucide-react';
// import useDebounce from '../hooks/useDebounce';
// import Select from '../components/ui/Select';
// import { LazyLoadImage } from 'react-lazy-load-image-component';
// import 'react-lazy-load-image-component/src/effects/blur.css';

// const PAGE_LIMIT = 50;

// const ImageLightbox = ({ src, alt, onClose }) => (
//     <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100]" onClick={onClose}>
//         <img src={src} alt={alt} className="max-w-[90vw] max-h-[90vh] object-contain" onClick={(e) => e.stopPropagation()} />
//     </div>
// );

// const TileListPage = () => {
//     const [tiles, setTiles] = useState([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [editingTile, setEditingTile] = useState(null);
//     const [expandedImage, setExpandedImage] = useState(null);
//     const [searchTerm, setSearchTerm] = useState('');
//     const [sizeFilter, setSizeFilter] = useState('');
//     const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
//     const debouncedSearchTerm = useDebounce(searchTerm, 500);
//     const [allUniqueSizes, setAllUniqueSizes] = useState([]);

//     const fetchTiles = useCallback(async () => {
//         setLoading(true);
//         setError('');
//         try {
//             const params = { page: pagination.page, search: debouncedSearchTerm, size: sizeFilter, limit: PAGE_LIMIT };
//             const { data } = await getAllTiles(params);
//             setTiles(data.tiles);
//             setPagination({ page: data.page, pages: data.pages, total: data.total });
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to fetch tiles.');
//         } finally {
//             setLoading(false);
//         }
//     }, [pagination.page, debouncedSearchTerm, sizeFilter]);

//     useEffect(() => {
//         const fetchAllSizes = async () => {
//             try {
//                 const { data } = await getAllTiles({ limit: 1000 });
//                 const sizes = [...new Set(data.tiles.map(tile => tile.size))].sort();
//                 setAllUniqueSizes(sizes);
//             } catch (err) { console.error("Could not fetch tile sizes for filter."); }
//         };
//         fetchAllSizes();
//     }, []);

//     useEffect(() => { fetchTiles(); }, [fetchTiles]);

//     const handleAdd = () => { setEditingTile(null); setIsModalOpen(true); };
//     const handleEdit = async (id) => { const { data } = await getTileById(id); setEditingTile(data); setIsModalOpen(true); };
//     const handleDelete = async (id) => { if (window.confirm('Are you sure you want to archive this tile?')) { await deleteTile(id); fetchTiles(); } };
//     const handlePageChange = (newPage) => { setPagination(prev => ({ ...prev, page: newPage })); };

//     return (
//         <div className="p-4 sm:p-6 md:p-8">
//             {isModalOpen && <TileFormModal tile={editingTile} onClose={() => setIsModalOpen(false)} onSave={fetchTiles} />}
//             {expandedImage && <ImageLightbox src={expandedImage.src} alt={expandedImage.alt} onClose={() => setExpandedImage(null)} />}

//             <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
//                 <h1 className="text-3xl font-bold text-text dark:text-dark-text">Master Tile List</h1>
//                 <button onClick={handleAdd} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover shadow-sm w-full sm:w-auto">
//                     <PlusCircle size={20} className="mr-2" /> Add Tile
//                 </button>
//             </div>

//             <div className="flex flex-wrap items-center gap-4 mb-6">
//                 <div className="relative flex-grow min-w-[250px]"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={20} /><input type="text" placeholder="Search by name or number..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="form-input w-full pl-10" /></div>
//                 <Select value={sizeFilter} onChange={(e) => { setSizeFilter(e.target.value); setPagination(p => ({...p, page: 1})); }} className="w-full sm:w-auto"><option value="">All Sizes</option>{allUniqueSizes.map(size => <option key={size} value={size}>{size}</option>)}</Select>
//             </div>

//             {loading && <div className="text-center p-8">Loading...</div>}
//             {!loading && error && <div className="p-6 text-center text-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg"><h2 className="font-bold text-lg">An Error Occurred</h2><p>{error}</p></div>}
            
//             {!loading && !error && (
//                 <>
//                     <div className="space-y-5">
//                         {tiles.map((tile) => (
//                             <div key={tile._id} className="flex flex-col md:flex-row bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg">
//                                 <div className="w-full md:w-56 flex-shrink-0 h-56 cursor-pointer" onClick={() => setExpandedImage({ src: tile.imageUrl, alt: tile.name })}>
//                                     <LazyLoadImage alt={tile.name} src={tile.imageUrl} effect="blur" className="w-full h-full object-cover" wrapperClassName="w-full h-full" placeholder={<div className="w-full h-full flex items-center justify-center bg-background dark:bg-dark-background"><Layers size={48} className="text-text-secondary/50" /></div>} />
//                                 </div>
//                                 <div className="flex-grow p-5 flex flex-col justify-between">
//                                     <div>
//                                         <div className="flex justify-between items-start mb-4">
//                                             <div>
//                                                 <h3 className="font-bold text-xl text-text dark:text-dark-text">{tile.name}{tile.number && <span className="ml-2 font-light text-text-secondary dark:text-dark-text-secondary">({tile.number})</span>}</h3>
//                                                 <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{tile.size} • {tile.surface}</p>
//                                             </div>
//                                             <div className="flex space-x-2"><button onClick={() => handleEdit(tile._id)} className="p-2 text-text-secondary/70 hover:text-primary"><Edit size={18} /></button><button onClick={() => handleDelete(tile._id)} className="p-2 text-text-secondary/70 hover:text-red-500"><Trash2 size={18} /></button></div>
//                                         </div>
                                        
//                                         {/* --- CORRECTED DISPLAY: SHOW FACTORIES, NOT STOCK --- */}
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
//                                         {/* --- END OF CORRECTION --- */}

//                                     </div>
//                                     <div className="text-xs text-text-secondary dark:text-dark-text-secondary mt-4">Created by: {tile.createdBy?.username || 'N/A'}</div>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
                    
//                     <div className="flex justify-between items-center mt-8">
//                         <span className="text-sm text-text-secondary dark:text-dark-text-secondary">Page {pagination.page} of {pagination.pages || 1} (Total: {pagination.total} tiles)</span>
//                         <div className="flex gap-2"><button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background"><ChevronLeft size={20} /></button><button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background"><ChevronRight size={20} /></button></div>
//                     </div>
//                 </>
//             )}
//         </div>
//     );
// };

// export default TileListPage;
import React, { useState, useEffect, useCallback } from 'react';
import { getAllTiles, deleteTile, getTileById } from '../api/tileApi';
import BulkUploadModal from '../components/tiles/BulkUploadModal';
import TileFormModal from '../components/tiles/TileFormModal';
import ImageLightbox from '../components/ui/ImageLightbox';
import { PlusCircle, Edit, Trash2, Layers, Search, ChevronLeft, ChevronRight, Factory, Upload } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import Select from '../components/ui/Select';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const PAGE_LIMIT = 50;

const TileListPage = () => {
    // State for data and UI control
    const [tiles, setTiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // State for modals
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);
    const [editingTile, setEditingTile] = useState(null);
    const [expandedImage, setExpandedImage] = useState(null);

    // State for filtering and pagination
    const [searchTerm, setSearchTerm] = useState('');
    const [sizeFilter, setSizeFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [allUniqueSizes, setAllUniqueSizes] = useState([]);

    // Main data fetching function
    const fetchTiles = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const params = {
                page: pagination.page,
                search: debouncedSearchTerm,
                size: sizeFilter,
                limit: PAGE_LIMIT
            };
            const { data } = await getAllTiles(params);
            setTiles(data.tiles);
            setPagination({ page: data.page, pages: data.pages, total: data.total });
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch tiles.');
        } finally {
            setLoading(false);
        }
    }, [pagination.page, debouncedSearchTerm, sizeFilter]);

    // Effect to fetch all unique sizes for the filter dropdown once
    useEffect(() => {
        const fetchAllSizes = async () => {
            try {
                // Fetch a large number to get all possible sizes, assuming less than 1000 unique sizes
                const { data } = await getAllTiles({ limit: 1000 });
                const sizes = [...new Set(data.tiles.map(tile => tile.size))].sort();
                setAllUniqueSizes(sizes);
            } catch (err) {
                console.error("Could not fetch tile sizes for filter.");
            }
        };
        fetchAllSizes();
    }, []);

    // Effect to refetch tiles when dependencies change
    useEffect(() => {
        fetchTiles();
    }, [fetchTiles]);

    // Handlers for CRUD operations and UI interactions
    const handleAdd = () => {
        setEditingTile(null);
        setIsFormModalOpen(true);
    };

    const handleEdit = async (id) => {
        try {
            const { data } = await getTileById(id);
            setEditingTile(data);
            setIsFormModalOpen(true);
        } catch (err) {
            setError('Failed to fetch tile details for editing.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to archive this tile? This action cannot be undone.')) {
            try {
                await deleteTile(id);
                fetchTiles(); // Refresh the list
            } catch (err) {
                setError('Failed to delete tile.');
            }
        }
    };

    const handlePageChange = (newPage) => {
        setPagination(prev => ({ ...prev, page: newPage }));
    };

    const handleBulkSave = () => {
        setIsBulkUploadModalOpen(false);
        fetchTiles(); // Refresh the list after successful import
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            {/* Modals */}
            {isFormModalOpen && <TileFormModal tile={editingTile} onClose={() => setIsFormModalOpen(false)} onSave={fetchTiles} />}
            {isBulkUploadModalOpen && <BulkUploadModal onClose={() => setIsBulkUploadModalOpen(false)} onSave={handleBulkSave} />}
            {expandedImage && <ImageLightbox src={expandedImage.src} alt={expandedImage.alt} onClose={() => setExpandedImage(null)} />}

            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text dark:text-dark-text">Master Tile List</h1>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button onClick={() => setIsBulkUploadModalOpen(true)} className="flex items-center justify-center bg-dark-foreground text-white px-4 py-2 text-nowrap rounded-md hover:bg-secondary-hover shadow-sm w-full">
                        <Upload size={20} className="mr-2" /> Bulk Upload
                    </button>
                    <button onClick={handleAdd} className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover shadow-sm w-full">
                        <PlusCircle size={20} className="mr-2" /> Add Tile
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="relative flex-grow min-w-[250px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={20} />
                    <input
                        type="text"
                        placeholder="Search by name or number..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input w-full pl-10"
                    />
                </div>
                <Select
                    value={sizeFilter}
                    onChange={(e) => { setSizeFilter(e.target.value); setPagination(p => ({...p, page: 1})); }}
                    className="w-full sm:w-auto"
                >
                    <option value="">All Sizes</option>
                    {allUniqueSizes.map(size => <option key={size} value={size}>{size}</option>)}
                </Select>
            </div>

            {/* Content Area */}
            {loading && <div className="text-center p-8 text-text dark:text-dark-text">Loading...</div>}
            {!loading && error && (
                <div className="p-6 text-center text-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg">
                    <h2 className="font-bold text-lg">An Error Occurred</h2>
                    <p>{error}</p>
                </div>
            )}
            
            {!loading && !error && (
                <>
                    <div className="space-y-5">
                        {tiles.map((tile) => (
                            <div key={tile._id} className="flex flex-col md:flex-row bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-xl shadow-md overflow-hidden transition-shadow hover:shadow-lg">
                                <div className="w-full md:w-56 flex-shrink-0 h-56 bg-background dark:bg-dark-background cursor-pointer" onClick={() => setExpandedImage({ src: tile.imageUrl, alt: tile.name })}>
                                    <LazyLoadImage
                                        alt={tile.name}
                                        src={tile.imageUrl}
                                        effect="blur"
                                        className="w-full h-full object-cover"
                                        wrapperClassName="w-full h-full"
                                        placeholder={<div className="w-full h-full flex items-center justify-center"><Layers size={48} className="text-text-secondary/50" /></div>}
                                    />
                                </div>
                                <div className="flex-grow p-5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="font-bold text-xl text-text dark:text-dark-text">{tile.name}{tile.number && <span className="ml-2 font-light text-text-secondary dark:text-dark-text-secondary">({tile.number})</span>}</h3>
                                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{tile.size} • {tile.surface}</p>
                                            </div>
                                            <div className="flex space-x-2">
                                                <button onClick={() => handleEdit(tile._id)} className="p-2 text-text-secondary/70 hover:text-primary dark:hover:text-dark-primary"><Edit size={18} /></button>
                                                <button onClick={() => handleDelete(tile._id)} className="p-2 text-text-secondary/70 hover:text-red-500"><Trash2 size={18} /></button>
                                            </div>
                                        </div>
                                        
                                        {tile.manufacturingFactories && tile.manufacturingFactories.length > 0 ? (
                                            <div className="mb-4">
                                                <h4 className="text-xs font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-2 flex items-center gap-2"><Factory size={14}/> Manufacturing Factories</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {tile.manufacturingFactories.map(factory => (
                                                        <span key={factory._id} className="bg-primary/10 dark:bg-dark-primary/20 text-primary dark:text-dark-primary text-xs font-medium px-2 py-1 rounded-full">
                                                            {factory.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="mb-4 p-3 rounded-lg bg-background dark:bg-dark-background text-center text-sm text-text-secondary">
                                                No manufacturing factories assigned.
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-text-secondary dark:text-dark-text-secondary mt-4">Created by: {tile.createdBy?.username || 'N/A'}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Pagination Controls */}
                    <div className="flex justify-between items-center mt-8">
                        <span className="text-sm text-text-secondary dark:text-dark-text-secondary">Page {pagination.page} of {pagination.pages || 1} (Total: {pagination.total} tiles)</span>
                        <div className="flex gap-2">
                            <button onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page <= 1} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background">
                                <ChevronLeft size={20} />
                            </button>
                            <button onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page >= pagination.pages} className="p-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed border border-border dark:border-dark-border hover:bg-background dark:hover:bg-dark-background">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default TileListPage;
