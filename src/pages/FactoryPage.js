// FILE: frontend/src/pages/FactoryPage.js
// 
// Add to AppRoutes.js:
// import FactoryPage from '../pages/FactoryPage';
// <Route path="/factories" element={<FactoryPage />} />

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllFactories, deleteFactory } from '../api/factoryApi';
import { getAllFactoryStock } from '../api/palletApi';
import FactoryFormModal from '../components/factories/FactoryFormModal';
import { 
    PlusCircle, Edit, Trash2, MapPin, User, Building2, Loader2, Search, 
    RefreshCw, Package, Boxes, Box, Layers, ChevronRight, AlertCircle, 
    X, Phone, Mail, Calendar, ExternalLink, MoreVertical, Eye, Warehouse
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import useDebounce from '../hooks/useDebounce';

const FactoryPage = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const isAdmin = user?.role === 'Admin' || user?.role === 'admin';

    // State
    const [factories, setFactories] = useState([]);
    const [factoryStock, setFactoryStock] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFactory, setEditingFactory] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'grid' or 'list'
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch factories
    const fetchFactories = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAllFactories();
            const data = response?.data || response || [];
            setFactories(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('[FactoryPage] Fetch error:', err);
            setError(err?.response?.data?.message || 'Failed to fetch factories.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch stock data for all factories
    const fetchFactoryStock = useCallback(async () => {
        try {
            const response = await getAllFactoryStock();
            const stockData = response?.data || response || [];
            
            // Aggregate stock by factory
            const stockByFactory = {};
            stockData.forEach(item => {
                const factoryId = item.factory?._id || item.factory;
                if (!factoryId) return;
                
                if (!stockByFactory[factoryId]) {
                    stockByFactory[factoryId] = {
                        pallets: 0,
                        khatlis: 0,
                        totalBoxes: 0,
                        tileTypes: new Set()
                    };
                }
                
                const qty = 1;
                const boxes = Number(item.boxCount) || 0;
                
                if (item.type === 'Pallet') {
                    stockByFactory[factoryId].pallets += qty;
                } else if (item.type === 'Khatli') {
                    stockByFactory[factoryId].khatlis += qty;
                }
                stockByFactory[factoryId].totalBoxes += boxes;
                
                if (item.tile?._id) {
                    stockByFactory[factoryId].tileTypes.add(item.tile._id);
                }
            });
            
            // Convert Sets to counts
            Object.keys(stockByFactory).forEach(key => {
                stockByFactory[key].tileTypes = stockByFactory[key].tileTypes.size;
            });
            
            setFactoryStock(stockByFactory);
        } catch (err) {
            console.error('[FactoryPage] Stock fetch error:', err);
        }
    }, []);

    useEffect(() => {
        fetchFactories();
        fetchFactoryStock();
    }, [fetchFactories, fetchFactoryStock]);

    // Filter factories
    const filteredFactories = useMemo(() => {
        if (!debouncedSearchTerm) return factories;
        const search = debouncedSearchTerm.toLowerCase();
        return factories.filter(f => 
            (f.name || '').toLowerCase().includes(search) ||
            (f.address || '').toLowerCase().includes(search) ||
            (f.contactPerson || '').toLowerCase().includes(search)
        );
    }, [factories, debouncedSearchTerm]);

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        const totalStock = Object.values(factoryStock).reduce((acc, stock) => ({
            pallets: acc.pallets + (stock.pallets || 0),
            khatlis: acc.khatlis + (stock.khatlis || 0),
            totalBoxes: acc.totalBoxes + (stock.totalBoxes || 0)
        }), { pallets: 0, khatlis: 0, totalBoxes: 0 });

        return {
            totalFactories: factories.length,
            activeFactories: factories.filter(f => {
                const stock = factoryStock[f._id];
                return stock && (stock.pallets > 0 || stock.khatlis > 0);
            }).length,
            ...totalStock
        };
    }, [factories, factoryStock]);

    // Handlers
    const handleAdd = () => {
        setEditingFactory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (factory, e) => {
        e?.stopPropagation();
        setEditingFactory(factory);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (factory, e) => {
        e?.stopPropagation();
        setDeleteConfirm(factory);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm) return;
        setIsDeleting(true);
        try {
            await deleteFactory(deleteConfirm._id);
            setDeleteConfirm(null);
            fetchFactories();
            fetchFactoryStock();
        } catch (err) {
            setError(err?.response?.data?.message || 'Failed to delete factory.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleViewStock = (factory, e) => {
        e?.stopPropagation();
        navigate(`/factory-stock?factory=${factory._id}`);
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingFactory(null);
    };

    const handleModalSave = () => {
        handleModalClose();
        fetchFactories();
        fetchFactoryStock();
    };

    const handleRefresh = () => {
        fetchFactories();
        fetchFactoryStock();
    };

    // Get stock for a factory
    const getFactoryStockData = (factoryId) => {
        return factoryStock[factoryId] || { pallets: 0, khatlis: 0, totalBoxes: 0, tileTypes: 0 };
    };

    // Format date
    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            });
        } catch {
            return 'N/A';
        }
    };

    return (
        <>
            {/* Factory Form Modal */}
            {isModalOpen && (
                <FactoryFormModal 
                    factory={editingFactory} 
                    onClose={handleModalClose} 
                    onSave={handleModalSave} 
                />
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                                <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold text-text dark:text-dark-text">Delete Factory?</h3>
                        </div>
                        <p className="text-text-secondary dark:text-dark-text-secondary mb-2">
                            Are you sure you want to delete <strong className="text-text dark:text-dark-text">{deleteConfirm.name}</strong>?
                        </p>
                        <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                            This action cannot be undone. All associated data may be affected.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setDeleteConfirm(null)} 
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleDeleteConfirm} 
                                disabled={isDeleting}
                                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                            >
                                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                                Delete Factory
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4 sm:p-6 md:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text dark:text-dark-text flex items-center gap-3">
                            <Building2 className="text-primary" size={32} />
                            Factories
                        </h1>
                        <p className="text-text-secondary dark:text-dark-text-secondary mt-1">
                            Manage manufacturing facilities and track inventory
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={handleRefresh}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors text-text dark:text-dark-text disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                        <button 
                            onClick={handleAdd}
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold shadow-sm"
                        >
                            <PlusCircle size={18} />
                            Add Factory
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-200 dark:bg-blue-800 rounded-lg">
                                <Building2 size={20} className="text-blue-700 dark:text-blue-300" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">{summaryStats.totalFactories}</p>
                                <p className="text-xs text-blue-600 dark:text-blue-400">Total Factories</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-200 dark:bg-emerald-800 rounded-lg">
                                <Warehouse size={20} className="text-emerald-700 dark:text-emerald-300" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{summaryStats.activeFactories}</p>
                                <p className="text-xs text-emerald-600 dark:text-emerald-400">With Stock</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-200 dark:bg-green-800 rounded-lg">
                                <Layers size={20} className="text-green-700 dark:text-green-300" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{summaryStats.pallets}</p>
                                <p className="text-xs text-green-600 dark:text-green-400">Total Pallets</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-200 dark:bg-purple-800 rounded-lg">
                                <Boxes size={20} className="text-purple-700 dark:text-purple-300" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{summaryStats.khatlis}</p>
                                <p className="text-xs text-purple-600 dark:text-purple-400">Total Khatlis</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-200 dark:bg-orange-800 rounded-lg">
                                <Box size={20} className="text-orange-700 dark:text-orange-300" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">{summaryStats.totalBoxes.toLocaleString()}</p>
                                <p className="text-xs text-orange-600 dark:text-orange-400">Total Boxes</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    {/* Search */}
                    <div className="relative w-full sm:w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                        <input
                            type="text"
                            placeholder="Search factories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                        />
                        {searchTerm && (
                            <button 
                                onClick={() => setSearchTerm('')}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    {/* View Toggle */}
                    <div className="flex items-center gap-2 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'grid' 
                                    ? 'bg-primary text-white' 
                                    : 'text-text-secondary hover:text-text hover:bg-gray-100 dark:hover:bg-dark-border'
                            }`}
                            title="Grid View"
                        >
                            <Package size={18} />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'list' 
                                    ? 'bg-primary text-white' 
                                    : 'text-text-secondary hover:text-text hover:bg-gray-100 dark:hover:bg-dark-border'
                            }`}
                            title="List View"
                        >
                            <Layers size={18} />
                        </button>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError('')} className="p-1 hover:bg-red-200 dark:hover:bg-red-800 rounded">
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 size={48} className="animate-spin text-primary mb-4" />
                        <p className="text-text-secondary dark:text-dark-text-secondary">Loading factories...</p>
                    </div>
                )}

                {/* Content */}
                {!loading && !error && (
                    <>
                        {filteredFactories.length === 0 ? (
                            <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl bg-foreground dark:bg-dark-foreground">
                                <Building2 size={64} className="mx-auto text-text-secondary/30 mb-4" />
                                <h3 className="text-xl font-semibold text-text dark:text-dark-text">
                                    {searchTerm ? 'No Factories Found' : 'No Factories Yet'}
                                </h3>
                                <p className="text-text-secondary dark:text-dark-text-secondary mt-2 mb-6">
                                    {searchTerm 
                                        ? `No factories matching "${searchTerm}"`
                                        : 'Add your first factory to get started.'
                                    }
                                </p>
                                {!searchTerm && (
                                    <button 
                                        onClick={handleAdd}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
                                    >
                                        <PlusCircle size={20} />
                                        Add Factory
                                    </button>
                                )}
                            </div>
                        ) : viewMode === 'grid' ? (
                            /* Grid View */
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {filteredFactories.map((factory) => {
                                    const stock = getFactoryStockData(factory._id);
                                    const hasStock = stock.pallets > 0 || stock.khatlis > 0;
                                    
                                    return (
                                        <div 
                                            key={`factory-${factory._id}`}
                                            className="bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-xl shadow-sm hover:shadow-lg hover:border-primary/50 transition-all overflow-hidden group"
                                        >
                                            {/* Card Header */}
                                            <div className="p-5 border-b border-border dark:border-dark-border bg-gradient-to-r from-primary/5 to-transparent">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`p-3 rounded-xl ${hasStock ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                            <Building2 size={24} className={hasStock ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'} />
                                                        </div>
                                                        <div>
                                                            <h3 className="font-bold text-lg text-text dark:text-dark-text">{factory.name}</h3>
                                                            {hasStock && (
                                                                <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                                                                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                                    Active Stock
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Actions */}
                                                    {isAdmin && (
                                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={(e) => handleEdit(factory, e)}
                                                                className="p-2 text-text-secondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                                title="Edit Factory"
                                                            >
                                                                <Edit size={16} />
                                                            </button>
                                                            <button 
                                                                onClick={(e) => handleDeleteClick(factory, e)}
                                                                className="p-2 text-text-secondary hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                title="Delete Factory"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Card Body */}
                                            <div className="p-5 space-y-4">
                                                {/* Contact Info */}
                                                <div className="space-y-2">
                                                    {factory.contactPerson && (
                                                        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                                                            <User size={14} className="text-primary" />
                                                            <span>{factory.contactPerson}</span>
                                                        </div>
                                                    )}
                                                    {factory.address && (
                                                        <div className="flex items-start gap-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                                                            <MapPin size={14} className="text-primary mt-0.5 flex-shrink-0" />
                                                            <span className="line-clamp-2">{factory.address}</span>
                                                        </div>
                                                    )}
                                                    {factory.createdAt && (
                                                        <div className="flex items-center gap-2 text-xs text-text-secondary/70 dark:text-dark-text-secondary/70">
                                                            <Calendar size={12} />
                                                            <span>Added {formatDate(factory.createdAt)}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Stock Stats */}
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                        <p className="text-xl font-bold text-green-600 dark:text-green-400">{stock.pallets}</p>
                                                        <p className="text-xs text-green-700 dark:text-green-300">Pallets</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                                        <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{stock.khatlis}</p>
                                                        <p className="text-xs text-purple-700 dark:text-purple-300">Khatlis</p>
                                                    </div>
                                                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{stock.totalBoxes.toLocaleString()}</p>
                                                        <p className="text-xs text-orange-700 dark:text-orange-300">Boxes</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Card Footer */}
                                            <div className="px-5 py-3 bg-gray-50 dark:bg-gray-900/30 border-t border-border dark:border-dark-border">
                                                <button 
                                                    onClick={(e) => handleViewStock(factory, e)}
                                                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary hover:text-white rounded-lg transition-colors"
                                                >
                                                    <Eye size={16} />
                                                    View Stock Details
                                                    <ChevronRight size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            /* List View */
                            <div className="bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-xl overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-border dark:border-dark-border">
                                                <th className="text-left py-4 px-5 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">Factory</th>
                                                <th className="text-left py-4 px-5 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">Contact</th>
                                                <th className="text-left py-4 px-5 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">Address</th>
                                                <th className="text-center py-4 px-5 text-sm font-semibold text-green-600 dark:text-green-400">Pallets</th>
                                                <th className="text-center py-4 px-5 text-sm font-semibold text-purple-600 dark:text-purple-400">Khatlis</th>
                                                <th className="text-center py-4 px-5 text-sm font-semibold text-orange-600 dark:text-orange-400">Boxes</th>
                                                <th className="text-center py-4 px-5 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredFactories.map((factory, index) => {
                                                const stock = getFactoryStockData(factory._id);
                                                const hasStock = stock.pallets > 0 || stock.khatlis > 0;
                                                
                                                return (
                                                    <tr 
                                                        key={`factory-row-${factory._id}`}
                                                        className={`border-b border-border/50 dark:border-dark-border/50 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                                                            index % 2 === 0 ? '' : 'bg-gray-50/50 dark:bg-gray-900/20'
                                                        }`}
                                                    >
                                                        <td className="py-4 px-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`p-2 rounded-lg ${hasStock ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-800'}`}>
                                                                    <Building2 size={18} className={hasStock ? 'text-green-600 dark:text-green-400' : 'text-gray-500'} />
                                                                </div>
                                                                <div>
                                                                    <p className="font-semibold text-text dark:text-dark-text">{factory.name}</p>
                                                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">
                                                                        Added {formatDate(factory.createdAt)}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <div className="flex items-center gap-2 text-sm text-text dark:text-dark-text">
                                                                <User size={14} className="text-text-secondary" />
                                                                {factory.contactPerson || '-'}
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <div className="flex items-start gap-2 text-sm text-text-secondary dark:text-dark-text-secondary max-w-xs">
                                                                <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                                                                <span className="line-clamp-2">{factory.address || '-'}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-4 px-5 text-center">
                                                            <span className="inline-flex items-center justify-center min-w-[48px] px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-bold text-sm">
                                                                {stock.pallets}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-5 text-center">
                                                            <span className="inline-flex items-center justify-center min-w-[48px] px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-bold text-sm">
                                                                {stock.khatlis}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-5 text-center">
                                                            <span className="inline-flex items-center justify-center min-w-[64px] px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-bold text-sm">
                                                                {stock.totalBoxes.toLocaleString()}
                                                            </span>
                                                        </td>
                                                        <td className="py-4 px-5">
                                                            <div className="flex items-center justify-center gap-1">
                                                                <button 
                                                                    onClick={(e) => handleViewStock(factory, e)}
                                                                    className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                                    title="View Stock"
                                                                >
                                                                    <Eye size={16} />
                                                                </button>
                                                                {isAdmin && (
                                                                    <>
                                                                        <button 
                                                                            onClick={(e) => handleEdit(factory, e)}
                                                                            className="p-2 text-text-secondary hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                                                                            title="Edit"
                                                                        >
                                                                            <Edit size={16} />
                                                                        </button>
                                                                        <button 
                                                                            onClick={(e) => handleDeleteClick(factory, e)}
                                                                            className="p-2 text-text-secondary hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                                            title="Delete"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Results Count */}
                        {filteredFactories.length > 0 && (
                            <div className="text-center text-sm text-text-secondary dark:text-dark-text-secondary">
                                Showing {filteredFactories.length} of {factories.length} factories
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default FactoryPage;