// FILE LOCATION: src/components/tiles/TileDetailModal.js

import React, { useState, useEffect } from 'react';
import { getTileById } from '../../api/tileApi';
import { getAllFactories } from '../../api/factoryApi';
import { 
    X, Loader2, Layers, Ruler, Sparkles, Factory, Box, Package, 
    TrendingUp, AlertCircle, Calendar, User, Hash, Image, Edit,
    CheckCircle, XCircle, BarChart3
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const TileDetailModal = ({ tileId, onClose, onEdit }) => {
    const [tile, setTile] = useState(null);
    const [factories, setFactories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [imageExpanded, setImageExpanded] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!tileId) return;
            setLoading(true);
            setError('');
            try {
                // Fetch tile and all factories in parallel
                const [tileResponse, factoriesResponse] = await Promise.all([
                    getTileById(tileId),
                    getAllFactories()
                ]);
                
                const tileData = tileResponse?.data || tileResponse;
                const factoriesData = factoriesResponse?.data || factoriesResponse || [];
                
                setTile(tileData);
                setFactories(Array.isArray(factoriesData) ? factoriesData : []);
            } catch (err) {
                setError('Failed to load tile details.');
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [tileId]);

    // Helper to get factory name by ID
    const getFactoryName = (factoryRef) => {
        // If it's already a populated object with name
        if (typeof factoryRef === 'object' && factoryRef !== null && factoryRef.name) {
            return factoryRef.name;
        }
        
        // If it's just an ID, look it up in factories list
        const factoryId = typeof factoryRef === 'object' ? factoryRef._id : factoryRef;
        const factory = factories.find(f => f._id === factoryId);
        return factory?.name || 'Unknown Factory';
    };

    const getStockStatus = () => {
        if (!tile) return { label: 'Unknown', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' };
        const stock = tile.stockDetails || {};
        const totalStock = (stock.availableStock || 0) + (stock.bookedStock || 0) + (stock.inFactoryStock || 0);
        
        if (totalStock === 0) return { label: 'Out of Stock', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30', icon: XCircle };
        if ((stock.availableStock || 0) < (tile.restockThreshold || 10)) return { label: 'Low Stock', color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: AlertCircle };
        return { label: 'In Stock', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/30', icon: CheckCircle };
    };

    const stockStatus = getStockStatus();
    const StatusIcon = stockStatus.icon || CheckCircle;

    return (
        <>
            {/* Image Expanded View */}
            {imageExpanded && tile?.imageUrl && (
                <div 
                    className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4"
                    onClick={() => setImageExpanded(false)}
                >
                    <button 
                        className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        onClick={() => setImageExpanded(false)}
                    >
                        <X size={24} className="text-white" />
                    </button>
                    <img 
                        src={tile.imageUrl} 
                        alt={tile.name} 
                        className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}

            {/* Main Modal */}
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div 
                    className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Loading */}
                    {loading && (
                        <div className="flex items-center justify-center py-32">
                            <Loader2 size={48} className="animate-spin text-primary" />
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="p-6">
                            <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
                                <AlertCircle size={20} />
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Content */}
                    {!loading && tile && (
                        <>
                            {/* Header with Image */}
                            <div className="relative">
                                {/* Image Background */}
                                <div 
                                    className="h-64 bg-background dark:bg-dark-background cursor-pointer relative overflow-hidden"
                                    onClick={() => tile.imageUrl && setImageExpanded(true)}
                                >
                                    {tile.imageUrl ? (
                                        <>
                                            <img 
                                                src={tile.imageUrl} 
                                                alt={tile.name} 
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                        </>
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800">
                                            <Image size={64} className="text-text-secondary/30" />
                                        </div>
                                    )}
                                </div>

                                {/* Close Button */}
                                <button 
                                    onClick={onClose} 
                                    className="absolute top-4 right-4 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
                                >
                                    <X size={24} className="text-white" />
                                </button>

                                {/* Edit Button */}
                                {onEdit && (
                                    <button 
                                        onClick={() => { onClose(); onEdit(tile._id); }}
                                        className="absolute top-4 right-16 p-2 bg-primary/90 hover:bg-primary rounded-full transition-colors"
                                    >
                                        <Edit size={20} className="text-white" />
                                    </button>
                                )}

                                {/* Title Overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h1 className="text-3xl font-bold text-white mb-2">{tile.name}</h1>
                                            <div className="flex items-center gap-3 text-white/80">
                                                {tile.number && (
                                                    <span className="flex items-center gap-1">
                                                        <Hash size={14} /> {tile.number}
                                                    </span>
                                                )}
                                                <span className="flex items-center gap-1">
                                                    <Ruler size={14} /> {tile.size}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Sparkles size={14} /> {tile.surface}
                                                </span>
                                            </div>
                                        </div>
                                        <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${stockStatus.bg} ${stockStatus.color}`}>
                                            <StatusIcon size={14} /> {stockStatus.label}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Content Body */}
                            <div className="flex-grow overflow-y-auto p-6 space-y-6">
                                {/* Stock Overview */}
                                <div>
                                    <h2 className="text-lg font-bold text-text dark:text-dark-text mb-4 flex items-center gap-2">
                                        <BarChart3 size={20} /> Stock Overview
                                    </h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-green-100 dark:bg-green-900/40 rounded-lg">
                                                    <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
                                                </div>
                                                <span className="text-sm text-green-700 dark:text-green-300">Available</span>
                                            </div>
                                            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                                                {(tile.stockDetails?.availableStock || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                                                    <Package size={18} className="text-blue-600 dark:text-blue-400" />
                                                </div>
                                                <span className="text-sm text-blue-700 dark:text-blue-300">Booked</span>
                                            </div>
                                            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                                {(tile.stockDetails?.bookedStock || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-amber-100 dark:bg-amber-900/40 rounded-lg">
                                                    <TrendingUp size={18} className="text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <span className="text-sm text-amber-700 dark:text-amber-300">Restocking</span>
                                            </div>
                                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-400">
                                                {(tile.stockDetails?.restockingStock || 0).toLocaleString()}
                                            </p>
                                        </div>
                                        
                                        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                                                    <Factory size={18} className="text-purple-600 dark:text-purple-400" />
                                                </div>
                                                <span className="text-sm text-purple-700 dark:text-purple-300">In Factory</span>
                                            </div>
                                            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                                                {(tile.stockDetails?.inFactoryStock || 0).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Tile Details */}
                                    <div className="bg-background dark:bg-dark-background rounded-xl p-5">
                                        <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-4 flex items-center gap-2">
                                            <Layers size={14} /> Tile Details
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-border dark:border-dark-border">
                                                <span className="text-text-secondary dark:text-dark-text-secondary">Size</span>
                                                <span className="font-medium text-text dark:text-dark-text">{tile.size}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-border dark:border-dark-border">
                                                <span className="text-text-secondary dark:text-dark-text-secondary">Surface</span>
                                                <span className="font-medium text-text dark:text-dark-text">{tile.surface}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-border dark:border-dark-border">
                                                <span className="text-text-secondary dark:text-dark-text-secondary">Boxes per Sq.M.</span>
                                                <span className="font-medium text-text dark:text-dark-text">{tile.conversionFactor || 1.44}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-border dark:border-dark-border">
                                                <span className="text-text-secondary dark:text-dark-text-secondary">Restock Threshold</span>
                                                <span className="font-medium text-text dark:text-dark-text">{tile.restockThreshold || 0}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-text-secondary dark:text-dark-text-secondary">Status</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tile.isActive !== false ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}>
                                                    {tile.isActive !== false ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Meta Info */}
                                    <div className="bg-background dark:bg-dark-background rounded-xl p-5">
                                        <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-4 flex items-center gap-2">
                                            <Calendar size={14} /> Meta Information
                                        </h3>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center py-2 border-b border-border dark:border-dark-border">
                                                <span className="text-text-secondary dark:text-dark-text-secondary">Tile ID</span>
                                                <span className="font-mono text-sm text-text dark:text-dark-text">{tile.tileId}</span>
                                            </div>
                                            {tile.number && (
                                                <div className="flex justify-between items-center py-2 border-b border-border dark:border-dark-border">
                                                    <span className="text-text-secondary dark:text-dark-text-secondary">Tile Number</span>
                                                    <span className="font-medium text-text dark:text-dark-text">{tile.number}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between items-center py-2 border-b border-border dark:border-dark-border">
                                                <span className="text-text-secondary dark:text-dark-text-secondary">Created By</span>
                                                <span className="font-medium text-text dark:text-dark-text flex items-center gap-1">
                                                    <User size={14} /> {tile.createdBy?.username || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-2 border-b border-border dark:border-dark-border">
                                                <span className="text-text-secondary dark:text-dark-text-secondary">Created</span>
                                                <span className="font-medium text-text dark:text-dark-text">
                                                    {tile.createdAt ? format(parseISO(tile.createdAt), 'dd MMM yyyy') : 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between items-center py-2">
                                                <span className="text-text-secondary dark:text-dark-text-secondary">Last Updated</span>
                                                <span className="font-medium text-text dark:text-dark-text">
                                                    {tile.updatedAt ? format(parseISO(tile.updatedAt), 'dd MMM yyyy') : 'N/A'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Manufacturing Factories */}
                                <div className="bg-background dark:bg-dark-background rounded-xl p-5">
                                    <h3 className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary uppercase mb-4 flex items-center gap-2">
                                        <Factory size={14} /> Manufacturing Factories
                                    </h3>
                                    {tile.manufacturingFactories && tile.manufacturingFactories.length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                            {tile.manufacturingFactories.map((factory, index) => {
                                                const factoryId = typeof factory === 'object' ? factory._id : factory;
                                                const factoryName = getFactoryName(factory);
                                                
                                                return (
                                                    <span 
                                                        key={factoryId || index}
                                                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 dark:bg-primary/20 text-primary dark:text-blue-300 rounded-lg font-medium"
                                                    >
                                                        <Factory size={16} />
                                                        {factoryName}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-text-secondary dark:text-dark-text-secondary italic">
                                            No manufacturing factories assigned to this tile.
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-border dark:border-dark-border flex justify-end gap-3 flex-shrink-0">
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 border border-border dark:border-dark-border text-text dark:text-dark-text font-medium rounded-lg hover:bg-background dark:hover:bg-dark-background transition-colors"
                                >
                                    Close
                                </button>
                                {onEdit && (
                                    <button
                                        onClick={() => { onClose(); onEdit(tile._id); }}
                                        className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-hover transition-colors flex items-center gap-2"
                                    >
                                        <Edit size={16} /> Edit Tile
                                    </button>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default TileDetailModal;