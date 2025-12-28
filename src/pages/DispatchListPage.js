// FILE LOCATION: src/pages/DispatchListPage.js
// 
// Add to AppRoutes.js:
// import DispatchListPage from '../pages/DispatchListPage';
// <Route path="/dispatches" element={<DispatchListPage />} />

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllDispatches } from '../api/dispatchApi';
import { 
    Loader2, Search, Package, Truck, Warehouse, Box, Calendar, RefreshCw, 
    Clock, CheckCircle2, XCircle, Layers, Boxes, MapPin, Plus, Send 
} from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import DispatchDetailModal from '../components/dispatch/DispatchDetailModal';

const DispatchListPage = () => {
    const navigate = useNavigate();
    const [dispatches, setDispatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedDispatch, setSelectedDispatch] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => { fetchDispatches(); }, []);

    const fetchDispatches = async () => {
        setLoading(true); setError('');
        try { 
            const response = await getAllDispatches(); 
            setDispatches(response.data || response || []); 
        } catch (err) { 
            setError(typeof err === 'string' ? err : 'Failed to fetch dispatch orders.'); 
        } finally { 
            setLoading(false); 
        }
    };

    const filteredDispatches = useMemo(() => {
        return dispatches
            .filter(d => statusFilter === 'All' || d.status === statusFilter)
            .filter(d => {
                const search = debouncedSearchTerm.toLowerCase();
                if (!search) return true;
                return (
                    d.dispatchNumber?.toLowerCase().includes(search) || 
                    d.invoiceNumber?.toLowerCase().includes(search) || 
                    d.destination?.toLowerCase().includes(search)
                );
            });
    }, [dispatches, statusFilter, debouncedSearchTerm]);

    const handleDispatchUpdate = (updatedDispatch) => { 
        setDispatches(prev => prev.map(d => d._id === updatedDispatch._id ? updatedDispatch : d)); 
        setSelectedDispatch(updatedDispatch); 
    };

    const handleDispatchDelete = (deletedId) => { 
        setDispatches(prev => prev.filter(d => d._id !== deletedId)); 
        setSelectedDispatch(null); 
    };

    const statusConfig = {
        Pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', icon: Clock },
        Ready: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: CheckCircle2 },
        'In Transit': { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300', icon: Truck },
        Delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle2 },
        Completed: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
        Cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
    };

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';

    const getDispatchTotals = (dispatch) => ({
        totalContainers: dispatch.containers?.length || 0,
        totalPallets: dispatch.stockSummary?.totalPallets || dispatch.containers?.reduce((sum, c) => sum + (c.items?.filter(i => i.itemType === 'Pallet').length || 0), 0) || 0,
        totalKhatlis: dispatch.stockSummary?.totalKhatlis || dispatch.containers?.reduce((sum, c) => sum + (c.items?.filter(i => i.itemType === 'Khatli').length || 0), 0) || 0,
        totalBoxes: dispatch.stockSummary?.totalBoxes || dispatch.containers?.reduce((sum, c) => sum + (c.totalBoxes || 0), 0) || 0,
    });

    const statusCounts = useMemo(() => {
        const counts = { All: dispatches.length };
        dispatches.forEach(d => { counts[d.status] = (counts[d.status] || 0) + 1; });
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

    return (
        <>
            {selectedDispatch && (
                <DispatchDetailModal 
                    dispatch={selectedDispatch} 
                    onClose={() => setSelectedDispatch(null)} 
                    onUpdate={handleDispatchUpdate} 
                    onDelete={handleDispatchDelete} 
                />
            )}

            <div className="space-y-6">
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
                            className="flex items-center gap-2 px-4 py-2.5 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors disabled:opacity-50 text-text dark:text-dark-text"
                        >
                            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> 
                            Refresh
                        </button>
                        <button 
                            onClick={() => navigate('/dispatches/new')} 
                            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                            <Plus size={20} /> 
                            Create Dispatch
                        </button>
                    </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <Package size={20} className="text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.total}</p>
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Dispatches</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <CheckCircle2 size={20} className="text-green-600 dark:text-green-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.active}</p>
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Active</p>
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
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Pending</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                                <Truck size={20} className="text-cyan-600 dark:text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-text dark:text-dark-text">{summaryStats.inTransit}</p>
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">In Transit</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Status Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                    {['All', 'Pending', 'Ready', 'In Transit', 'Delivered', 'Completed', 'Cancelled'].map(status => (
                        <button 
                            key={status} 
                            onClick={() => setStatusFilter(status)} 
                            className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                statusFilter === status 
                                    ? 'bg-primary text-white' 
                                    : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'
                            }`}
                        >
                            {status} ({statusCounts[status] || 0})
                        </button>
                    ))}
                </div>

                {/* Search Bar */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={20} />
                    <input 
                        type="text" 
                        placeholder="Search by dispatch number, invoice, or destination..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="w-full pl-10 pr-4 py-3 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent" 
                    />
                </div>

                {/* Error */}
                {error && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg">
                        {error}
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex justify-center py-20">
                        <Loader2 size={48} className="animate-spin text-primary" />
                    </div>
                )}

                {/* Empty State */}
                {!loading && filteredDispatches.length === 0 && (
                    <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl bg-foreground dark:bg-dark-foreground">
                        <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
                            <Send size={48} className="text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-text dark:text-dark-text">
                            {dispatches.length === 0 ? 'No Dispatches Yet' : 'No Matching Dispatches'}
                        </h3>
                        <p className="text-text-secondary dark:text-dark-text-secondary mt-2 max-w-md mx-auto">
                            {dispatches.length === 0 
                                ? 'Create your first dispatch order to start tracking shipments from your factories.' 
                                : 'No dispatches match your current search or filter criteria.'}
                        </p>
                        {dispatches.length === 0 && (
                            <button 
                                onClick={() => navigate('/dispatches/new')} 
                                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                            >
                                <Plus size={20} /> 
                                Create First Dispatch
                            </button>
                        )}
                    </div>
                )}

                {/* Dispatch Cards */}
                {!loading && filteredDispatches.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredDispatches.map(dispatch => {
                            const { totalContainers, totalPallets, totalKhatlis, totalBoxes } = getDispatchTotals(dispatch);
                            const StatusIcon = statusConfig[dispatch.status]?.icon || Clock;
                            
                            return (
                                <div 
                                    key={dispatch._id} 
                                    className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-sm hover:shadow-lg hover:border-primary/50 transition-all cursor-pointer group" 
                                    onClick={() => setSelectedDispatch(dispatch)}
                                >
                                    {/* Card Header */}
                                    <div className="p-4 border-b border-border dark:border-dark-border">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-mono text-primary dark:text-dark-primary font-bold text-lg group-hover:underline">
                                                    {dispatch.dispatchNumber}
                                                </p>
                                                {dispatch.invoiceNumber && (
                                                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                                                        Invoice: {dispatch.invoiceNumber}
                                                    </p>
                                                )}
                                            </div>
                                            <span className={`px-2.5 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${statusConfig[dispatch.status]?.color}`}>
                                                <StatusIcon size={12} /> {dispatch.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-text-secondary dark:text-dark-text-secondary">
                                            <span className="flex items-center gap-1">
                                                <Calendar size={14} /> {formatDate(dispatch.dispatchDate)}
                                            </span>
                                            {dispatch.destination && (
                                                <span className="flex items-center gap-1">
                                                    <MapPin size={14} /> {dispatch.destination}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Card Body - Stats */}
                                    <div className="p-4">
                                        <div className="grid grid-cols-4 gap-2 text-center">
                                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                                <Package size={16} className="mx-auto text-blue-600 dark:text-blue-400 mb-1" />
                                                <p className="text-lg font-bold text-blue-600 dark:text-blue-400">{totalContainers}</p>
                                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Containers</p>
                                            </div>
                                            <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                <Layers size={16} className="mx-auto text-green-600 dark:text-green-400 mb-1" />
                                                <p className="text-lg font-bold text-green-600 dark:text-green-400">{totalPallets}</p>
                                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pallets</p>
                                            </div>
                                            <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                                <Boxes size={16} className="mx-auto text-purple-600 dark:text-purple-400 mb-1" />
                                                <p className="text-lg font-bold text-purple-600 dark:text-purple-400">{totalKhatlis}</p>
                                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Khatlis</p>
                                            </div>
                                            <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                                                <Box size={16} className="mx-auto text-orange-600 dark:text-orange-400 mb-1" />
                                                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{totalBoxes}</p>
                                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary">Boxes</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card Footer */}
                                    <div className="px-4 py-3 border-t border-border dark:border-dark-border bg-background/50 dark:bg-dark-background/50 rounded-b-xl">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                                                <Warehouse size={14} />
                                                <span className="truncate max-w-[150px]">
                                                    {dispatch.containers?.map(c => c.factoryName).filter((v, i, a) => a.indexOf(v) === i).join(', ') || 'N/A'}
                                                </span>
                                            </div>
                                            <span className="text-sm font-semibold text-primary dark:text-dark-primary group-hover:underline">
                                                View Details →
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </>
    );
};

export default DispatchListPage;