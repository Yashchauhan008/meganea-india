// FILE: frontend/src/pages/DispatchListPage.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDispatches } from '../api/dispatchApi';
import DispatchDetailModal from '../components/dispatch/DispatchDetailModal';
import { 
    Loader2, Search, Package, Truck, Warehouse, Box, Calendar, RefreshCw, 
    Clock, CheckCircle2, XCircle, Layers, Boxes, MapPin, Plus, Send, FileText
} from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

const DispatchListPage = () => {
    const navigate = useNavigate();
    const [dispatches, setDispatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDispatchId, setSelectedDispatchId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Fetch dispatches
    const fetchDispatches = useCallback(async () => {
        setLoading(true); 
        setError('');
        try { 
            const response = await getAllDispatches(); 
            const data = response?.data || response || [];
            setDispatches(Array.isArray(data) ? data : []); 
        } catch (err) { 
            console.error('[DispatchListPage] Fetch error:', err);
            setError(typeof err === 'string' ? err : 'Failed to fetch dispatch orders.'); 
        } finally { 
            setLoading(false); 
        }
    }, []);

    useEffect(() => { 
        fetchDispatches(); 
    }, [fetchDispatches]);

    // Get selected dispatch object
    const selectedDispatch = useMemo(() => {
        if (!selectedDispatchId) return null;
        return dispatches.find(d => d._id === selectedDispatchId) || null;
    }, [selectedDispatchId, dispatches]);

    // Filter dispatches
    const filteredDispatches = useMemo(() => {
        return dispatches
            .filter(d => statusFilter === 'All' || d.status === statusFilter)
            .filter(d => {
                const search = debouncedSearchTerm.toLowerCase();
                if (!search) return true;
                return (
                    (d.dispatchNumber || '').toLowerCase().includes(search) || 
                    (d.invoiceNumber || '').toLowerCase().includes(search) || 
                    (d.destination || '').toLowerCase().includes(search)
                );
            });
    }, [dispatches, statusFilter, debouncedSearchTerm]);

    // Handle dispatch update from modal
    const handleDispatchUpdate = useCallback((updatedDispatch) => { 
        console.log('[DispatchListPage] Dispatch updated:', updatedDispatch);
        setDispatches(prev => prev.map(d => d._id === updatedDispatch._id ? updatedDispatch : d)); 
    }, []);

    // Handle dispatch delete from modal
    const handleDispatchDelete = useCallback((deletedId) => { 
        console.log('[DispatchListPage] Dispatch deleted:', deletedId);
        setDispatches(prev => prev.filter(d => d._id !== deletedId)); 
        setSelectedDispatchId(null); 
    }, []);

    // Close modal
    const handleCloseModal = useCallback(() => {
        setSelectedDispatchId(null);
    }, []);

    // Open modal
    const handleOpenModal = useCallback((dispatchId) => {
        console.log('[DispatchListPage] Opening modal for:', dispatchId);
        setSelectedDispatchId(dispatchId);
    }, []);

    // Status configuration
    const statusConfig = {
        'Pending': { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', icon: Clock },
        'Ready': { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: CheckCircle2 },
        'In Transit': { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300', icon: Truck },
        'Delivered': { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle2 },
        'Completed': { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
        'Cancelled': { color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
    };

    // Format date helper
    const formatDate = (date) => {
        if (!date) return 'N/A';
        try {
            return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        } catch {
            return 'N/A';
        }
    };

    // Get totals for a dispatch
    const getDispatchTotals = (dispatch) => {
        if (!dispatch) return { totalContainers: 0, totalPallets: 0, totalKhatlis: 0, totalBoxes: 0 };
        
        let totalPallets = 0;
        let totalKhatlis = 0;
        let totalBoxes = 0;
        
        if (dispatch.stockSummary) {
            totalPallets = Number(dispatch.stockSummary.totalPallets) || 0;
            totalKhatlis = Number(dispatch.stockSummary.totalKhatlis) || 0;
            totalBoxes = Number(dispatch.stockSummary.totalBoxes) || 0;
        } else if (dispatch.containers && Array.isArray(dispatch.containers)) {
            dispatch.containers.forEach(c => {
                if (c?.items && Array.isArray(c.items)) {
                    c.items.forEach(item => {
                        if (item?.itemType === 'Pallet') totalPallets++;
                        else if (item?.itemType === 'Khatli') totalKhatlis++;
                    });
                }
                totalBoxes += Number(c?.totalBoxes) || 0;
            });
        }
        
        return {
            totalContainers: dispatch.containers?.length || 0,
            totalPallets,
            totalKhatlis,
            totalBoxes,
        };
    };

    // Calculate status counts
    const statusCounts = useMemo(() => {
        const counts = { All: dispatches.length };
        dispatches.forEach(d => { 
            if (d.status) {
                counts[d.status] = (counts[d.status] || 0) + 1; 
            }
        });
        return counts;
    }, [dispatches]);

    // Calculate summary stats
    const summaryStats = useMemo(() => {
        const activeDispatches = dispatches.filter(d => !['Completed', 'Cancelled'].includes(d.status));
        return {
            total: dispatches.length,
            active: activeDispatches.length,
            pending: dispatches.filter(d => d.status === 'Pending').length,
            inTransit: dispatches.filter(d => d.status === 'In Transit').length,
        };
    }, [dispatches]);

    // Status filter options
    const STATUS_OPTIONS = ['All', 'Pending', 'Ready', 'In Transit', 'Delivered', 'Completed', 'Cancelled'];

    return (
        <>
            {/* Modal - render only when we have a selected dispatch */}
            {selectedDispatch && (
                <DispatchDetailModal 
                    key={`modal-${selectedDispatch._id}`}
                    dispatch={selectedDispatch} 
                    onClose={handleCloseModal} 
                    onUpdate={handleDispatchUpdate} 
                    onDelete={handleDispatchDelete} 
                />
            )}

            <div className="p-4 sm:p-6 md:p-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-text dark:text-dark-text">Dispatches</h1>
                        <p className="text-text-secondary dark:text-dark-text-secondary">
                            Manage and track all dispatch orders
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={fetchDispatches} 
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2.5 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors text-text dark:text-dark-text disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                        </button>
                        <button 
                            onClick={() => navigate('/dispatches/create')} 
                            className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
                        >
                            <Plus size={18} /> Add Dispatch
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Package size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.total}</p>
                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Total Dispatches</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <Truck size={20} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.active}</p>
                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Active</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                                <Clock size={20} className="text-yellow-600 dark:text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.pending}</p>
                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                                <Send size={20} className="text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.inTransit}</p>
                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">In Transit</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                    {/* Status Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {STATUS_OPTIONS.map((status) => (
                            <button 
                                key={`filter-${status}`}
                                onClick={() => setStatusFilter(status)} 
                                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    statusFilter === status 
                                        ? 'bg-primary text-white' 
                                        : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'
                                }`}
                            >
                                {status} ({statusCounts[status] || 0})
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full lg:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                        <input
                            type="text"
                            placeholder="Search dispatches..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
                        <XCircle size={20} />
                        <span className="flex-1">{error}</span>
                        <button onClick={fetchDispatches} className="underline hover:no-underline">Retry</button>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <Loader2 size={48} className="animate-spin text-primary" />
                    </div>
                )}

                {/* Dispatch List */}
                {!loading && !error && (
                    <>
                        {filteredDispatches.length === 0 ? (
                            <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl bg-foreground dark:bg-dark-foreground">
                                <Package size={48} className="mx-auto text-text-secondary/30 mb-4" />
                                <h3 className="text-xl font-semibold text-text dark:text-dark-text">No Dispatches Found</h3>
                                <p className="text-text-secondary dark:text-dark-text-secondary mt-2">
                                    {statusFilter !== 'All' ? `No dispatches with status "${statusFilter}"` : 'Create your first dispatch to get started.'}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {filteredDispatches.map((dispatch) => {
                                    const dispatchId = dispatch._id;
                                    const status = dispatch.status || 'Pending';
                                    const StatusIcon = statusConfig[status]?.icon || Clock;
                                    const { totalContainers, totalPallets, totalKhatlis, totalBoxes } = getDispatchTotals(dispatch);
                                    
                                    return (
                                        <div 
                                            key={`dispatch-card-${dispatchId}`}
                                            className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border p-5 hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer"
                                            onClick={() => handleOpenModal(dispatchId)}
                                        >
                                            {/* Header */}
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="font-mono text-primary dark:text-blue-400 text-sm font-semibold">
                                                        {dispatch.dispatchNumber || 'N/A'}
                                                    </p>
                                                    {dispatch.invoiceNumber && (
                                                        <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-0.5 flex items-center gap-1">
                                                            <FileText size={12} />
                                                            {dispatch.invoiceNumber}
                                                        </p>
                                                    )}
                                                </div>
                                                <span className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${statusConfig[status]?.color || 'bg-gray-100 text-gray-800'}`}>
                                                    <StatusIcon size={12} /> 
                                                    {status}
                                                </span>
                                            </div>

                                            {/* Info */}
                                            <div className="space-y-2 mb-4 text-sm text-text-secondary dark:text-dark-text-secondary">
                                                {dispatch.destination && (
                                                    <p className="flex items-center gap-2">
                                                        <MapPin size={14} />
                                                        {dispatch.destination}
                                                    </p>
                                                )}
                                                <p className="flex items-center gap-2">
                                                    <Calendar size={14} />
                                                    {formatDate(dispatch.dispatchDate)}
                                                </p>
                                            </div>

                                            {/* Stats */}
                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                    <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalContainers}</p>
                                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Containers</p>
                                                </div>
                                                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                    <p className="text-lg font-bold text-green-600 dark:text-green-400">{totalPallets}</p>
                                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pallets</p>
                                                </div>
                                                <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                                    <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{totalKhatlis}</p>
                                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Khatlis</p>
                                                </div>
                                                <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                    <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{totalBoxes}</p>
                                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Boxes</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </>
                )}
            </div>
        </>
    );
};

export default DispatchListPage;