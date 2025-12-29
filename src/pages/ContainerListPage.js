// FILE LOCATION: src/pages/ContainerListPage.js

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { getAllContainers } from '../api/containerApi';
import ContainerDetailModal from '../components/containers/ContainerDetailModal';
import { 
    Loader2, Search, Package, Truck, Warehouse, FileText, RefreshCw,
    Inbox, ChevronLeft, ChevronRight, Boxes, CheckCircle, Clock,
    Ship, MapPin, Calendar, Eye
} from 'lucide-react';
import { format } from 'date-fns';
import useDebounce from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 12;

const ContainerListPage = () => {
    const [allContainers, setAllContainers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedContainer, setSelectedContainer] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchContainers = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAllContainers();
            const data = response?.data || response || [];
            setAllContainers(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch containers:', err);
            setError('Failed to fetch containers. Please try again.');
            setAllContainers([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchContainers();
    }, [fetchContainers]);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, statusFilter]);

    const handleUpdateContainer = (updatedContainer) => {
        setAllContainers(prev => prev.map(c => c._id === updatedContainer._id ? updatedContainer : c));
        setSelectedContainer(updatedContainer);
    };

    const handleCloseModal = () => {
        setSelectedContainer(null);
        fetchContainers(); // Refresh after modal close
    };

    // Status configuration
    const statusConfig = {
        'Empty': { 
            color: 'text-gray-600 dark:text-gray-400', 
            bg: 'bg-gray-100 dark:bg-gray-800',
            dot: 'bg-gray-400'
        },
        'Loading': { 
            color: 'text-yellow-600 dark:text-yellow-400', 
            bg: 'bg-yellow-100 dark:bg-yellow-900/40',
            dot: 'bg-yellow-500'
        },
        'Loaded': { 
            color: 'text-blue-600 dark:text-blue-400', 
            bg: 'bg-blue-100 dark:bg-blue-900/40',
            dot: 'bg-blue-500'
        },
        'Ready to Dispatch': { 
            color: 'text-purple-600 dark:text-purple-400', 
            bg: 'bg-purple-100 dark:bg-purple-900/40',
            dot: 'bg-purple-500'
        },
        'Dispatched': { 
            color: 'text-orange-600 dark:text-orange-400', 
            bg: 'bg-orange-100 dark:bg-orange-900/40',
            dot: 'bg-orange-500'
        },
        'In Transit': { 
            color: 'text-cyan-600 dark:text-cyan-400', 
            bg: 'bg-cyan-100 dark:bg-cyan-900/40',
            dot: 'bg-cyan-500'
        },
        'Delivered': { 
            color: 'text-green-600 dark:text-green-400', 
            bg: 'bg-green-100 dark:bg-green-900/40',
            dot: 'bg-green-500'
        },
    };

    const getStatusInfo = (status) => statusConfig[status] || statusConfig['Empty'];

    // Filter containers
    const filteredContainers = useMemo(() => {
        return allContainers
            .filter(c => statusFilter === 'All' || c.status === statusFilter)
            .filter(c => {
                const search = debouncedSearchTerm.toLowerCase();
                if (!search) return true;
                return (
                    c.containerId?.toLowerCase().includes(search) ||
                    c.containerNumber?.toLowerCase().includes(search) ||
                    c.truckNumber?.toLowerCase().includes(search) ||
                    c.factory?.name?.toLowerCase().includes(search) ||
                    c.loadingPlan?.loadingPlanId?.toLowerCase().includes(search)
                );
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [allContainers, statusFilter, debouncedSearchTerm]);

    // Pagination
    const totalPages = Math.ceil(filteredContainers.length / ITEMS_PER_PAGE);
    const paginatedContainers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredContainers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredContainers, currentPage]);

    // Status counts
    const statusCounts = useMemo(() => {
        const counts = { All: allContainers.length };
        allContainers.forEach(c => {
            counts[c.status] = (counts[c.status] || 0) + 1;
        });
        return counts;
    }, [allContainers]);

    // Summary stats
    const stats = useMemo(() => {
        let totalPallets = 0;
        let totalKhatlis = 0;
        let totalBoxes = 0;
        
        allContainers.forEach(c => {
            c.pallets?.forEach(p => {
                if (p.type === 'Khatli') {
                    totalKhatlis++;
                } else {
                    totalPallets++;
                }
                totalBoxes += p.boxCount || 0;
            });
        });

        return {
            total: allContainers.length,
            loaded: statusCounts['Loaded'] || 0,
            inTransit: statusCounts['In Transit'] || 0,
            delivered: statusCounts['Delivered'] || 0,
            totalPallets,
            totalKhatlis,
            totalBoxes
        };
    }, [allContainers, statusCounts]);

    // Available statuses for filter
    const availableStatuses = ['All', 'Empty', 'Loading', 'Loaded', 'Ready to Dispatch', 'Dispatched', 'In Transit', 'Delivered'];

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Modal */}
            {selectedContainer && (
                <ContainerDetailModal
                    container={selectedContainer}
                    onClose={handleCloseModal}
                    onUpdate={handleUpdateContainer}
                />
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text dark:text-dark-text">Container Management</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">
                        Track and manage all containers and their contents
                    </p>
                </div>
                <button 
                    onClick={fetchContainers} 
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2.5 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors disabled:opacity-50 text-text dark:text-dark-text"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Truck size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.total}</p>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Containers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Package size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.loaded}</p>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Loaded</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-cyan-100 dark:bg-cyan-900/30 rounded-lg">
                            <Ship size={20} className="text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.inTransit}</p>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">In Transit</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.delivered}</p>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Delivered</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                    <input
                        type="text"
                        placeholder="Search by ID, container, truck, factory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {availableStatuses.map(status => (
                        <button 
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                                statusFilter === status 
                                    ? 'bg-primary text-white' 
                                    : 'bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border'
                            }`}
                        >
                            {status} ({statusCounts[status] || 0})
                        </button>
                    ))}
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
                    <span>{error}</span>
                    <button onClick={fetchContainers} className="ml-auto underline hover:no-underline">Retry</button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 size={48} className="animate-spin text-primary" />
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredContainers.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl bg-foreground dark:bg-dark-foreground">
                    <Inbox size={48} className="mx-auto text-text-secondary/30" />
                    <h3 className="mt-4 text-xl font-semibold text-text dark:text-dark-text">
                        {allContainers.length === 0 ? 'No Containers Yet' : 'No Matching Containers'}
                    </h3>
                    <p className="text-text-secondary dark:text-dark-text-secondary mt-2">
                        {allContainers.length === 0 
                            ? 'Containers will appear here when created from loading plans.' 
                            : 'Try adjusting your search or filter criteria.'}
                    </p>
                </div>
            )}

            {/* Container Grid */}
            {!loading && !error && paginatedContainers.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedContainers.map(container => {
                        const statusInfo = getStatusInfo(container.status);
                        const totalPallets = container.pallets?.filter(p => p.type !== 'Khatli').length || 0;
                        const totalKhatlis = container.pallets?.filter(p => p.type === 'Khatli').length || 0;
                        const totalBoxes = container.pallets?.reduce((sum, p) => sum + (p.boxCount || 0), 0) || 0;
                        const factoryName = container.factory?.name || container.loadingPlan?.factory?.name || 'N/A';

                        return (
                            <div 
                                key={container._id} 
                                className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-sm flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                            >
                                {/* Header */}
                                <div className="p-4 border-b border-border dark:border-dark-border">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-mono text-sm text-primary dark:text-dark-primary font-bold">
                                                {container.containerId}
                                            </p>
                                            <h3 className="text-lg font-bold text-text dark:text-dark-text">
                                                {container.containerNumber}
                                            </h3>
                                        </div>
                                        <span className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                                            {container.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                                        <Calendar size={14} />
                                        {container.createdAt ? format(new Date(container.createdAt), 'dd MMM, yyyy') : 'N/A'}
                                    </div>
                                </div>

                                {/* Body */}
                                <div className="p-4 flex-grow space-y-3">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Truck size={16} className="text-text-secondary" />
                                        <span className="text-text-secondary dark:text-dark-text-secondary">Truck:</span>
                                        <span className="font-semibold text-text dark:text-dark-text">{container.truckNumber}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Warehouse size={16} className="text-text-secondary" />
                                        <span className="text-text-secondary dark:text-dark-text-secondary">Factory:</span>
                                        <span className="font-semibold text-text dark:text-dark-text">{factoryName}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <FileText size={16} className="text-text-secondary" />
                                        <span className="text-text-secondary dark:text-dark-text-secondary">Plan:</span>
                                        <span className="font-semibold text-text dark:text-dark-text font-mono">
                                            {container.loadingPlan?.loadingPlanId || 'N/A'}
                                        </span>
                                    </div>

                                    {/* Stats */}
                                    <div className="grid grid-cols-3 gap-2 pt-2">
                                        <div className="text-center p-2 bg-background dark:bg-dark-background rounded-lg">
                                            <p className="text-lg font-bold text-text dark:text-dark-text">{totalPallets}</p>
                                            <p className="text-xs text-text-secondary">Pallets</p>
                                        </div>
                                        <div className="text-center p-2 bg-background dark:bg-dark-background rounded-lg">
                                            <p className="text-lg font-bold text-text dark:text-dark-text">{totalKhatlis}</p>
                                            <p className="text-xs text-text-secondary">Khatlis</p>
                                        </div>
                                        <div className="text-center p-2 bg-background dark:bg-dark-background rounded-lg">
                                            <p className="text-lg font-bold text-text dark:text-dark-text">{totalBoxes.toLocaleString()}</p>
                                            <p className="text-xs text-text-secondary">Boxes</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="p-3 bg-background/50 dark:bg-dark-background/30 border-t border-border dark:border-dark-border">
                                    <button 
                                        onClick={() => setSelectedContainer(container)} 
                                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary dark:text-dark-primary hover:bg-primary/10 dark:hover:bg-dark-primary/10 py-2.5 rounded-lg transition-colors"
                                    >
                                        <Eye size={16} /> View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t border-border dark:border-dark-border">
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredContainers.length)} of {filteredContainers.length} containers
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronLeft size={18} className="text-text dark:text-dark-text" />
                        </button>
                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                let pageNum;
                                if (totalPages <= 5) { pageNum = i + 1; }
                                else if (currentPage <= 3) { pageNum = i + 1; }
                                else if (currentPage >= totalPages - 2) { pageNum = totalPages - 4 + i; }
                                else { pageNum = currentPage - 2 + i; }
                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                                            currentPage === pageNum
                                                ? 'bg-primary text-white'
                                                : 'border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border text-text dark:text-dark-text'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <ChevronRight size={18} className="text-text dark:text-dark-text" />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ContainerListPage;