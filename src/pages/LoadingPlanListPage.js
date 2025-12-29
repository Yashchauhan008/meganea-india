// FILE LOCATION: src/pages/LoadingPlanListPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getLoadingPlans } from '../api/loadingPlanApi';
import LoadingPlanDetailModal from '../components/loading-plans/LoadingPlanDetailModal';
import { 
    Loader2, PlusCircle, Search, Eye, Warehouse, Truck, Package, Calendar,
    RefreshCw, Inbox, ChevronLeft, ChevronRight, Boxes, CheckCircle, Clock
} from 'lucide-react';
import { format } from 'date-fns';
import useDebounce from '../hooks/useDebounce';

const ITEMS_PER_PAGE = 12;

const LoadingPlanListPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [currentPage, setCurrentPage] = useState(1);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchPlans = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getLoadingPlans();
            const data = response?.data || response || [];
            setPlans(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch loading plans:', err);
            setError('Failed to fetch loading plans. Please try again.');
            setPlans([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    // Reset page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchTerm, statusFilter]);

    const handleViewDetails = (planId) => {
        setSelectedPlanId(planId);
        setIsModalOpen(true);
    };
    
    const handleCloseModalAndRefresh = () => {
        setIsModalOpen(false);
        setSelectedPlanId(null);
        fetchPlans();
    };

    // Filter and search plans
    const filteredPlans = useMemo(() => {
        if (!plans || !Array.isArray(plans)) return [];
        return plans.filter(plan => {
            const matchesSearch = !debouncedSearchTerm || 
                (plan.loadingPlanId?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase()) ||
                (plan.factory?.name?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'All' || plan.status === statusFilter;
            return matchesSearch && matchesStatus;
        }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [plans, debouncedSearchTerm, statusFilter]);

    // Pagination
    const totalPages = Math.ceil(filteredPlans.length / ITEMS_PER_PAGE);
    const paginatedPlans = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredPlans.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredPlans, currentPage]);

    // Status counts
    const statusCounts = useMemo(() => {
        const counts = { All: plans.length };
        plans.forEach(plan => {
            counts[plan.status] = (counts[plan.status] || 0) + 1;
        });
        return counts;
    }, [plans]);

    // Calculate summary stats
    const stats = useMemo(() => {
        let totalContainers = 0;
        let totalPallets = 0;
        plans.forEach(plan => {
            totalContainers += plan.containers?.length || 0;
            plan.containers?.forEach(c => {
                totalPallets += c.pallets?.length || 0;
            });
        });
        return { 
            totalPlans: plans.length, 
            totalContainers, 
            totalPallets,
            finalized: statusCounts.Finalized || 0
        };
    }, [plans, statusCounts]);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'Finalized':
                return { text: 'Finalized', color: 'text-green-600 dark:text-green-400', bg: 'bg-green-100 dark:bg-green-900/40', dot: 'bg-green-500' };
            case 'Draft':
                return { text: 'Draft', color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-100 dark:bg-yellow-900/40', dot: 'bg-yellow-500' };
            case 'Cancelled':
                return { text: 'Cancelled', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/40', dot: 'bg-red-500' };
            default:
                return { text: status || 'Unknown', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800', dot: 'bg-gray-400' };
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Modal */}
            {isModalOpen && (
                <LoadingPlanDetailModal 
                    planId={selectedPlanId} 
                    onClose={handleCloseModalAndRefresh} 
                />
            )}

            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text dark:text-dark-text">Loading Plans</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">
                        Manage container loading plans and pallet assignments
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={fetchPlans} 
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors disabled:opacity-50 text-text dark:text-dark-text"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> Refresh
                    </button>
                    <Link
                        to="/loading-plans/new"
                        className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-hover shadow-sm transition-colors"
                    >
                        <PlusCircle size={16} /> Create New Plan
                    </Link>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Boxes size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.totalPlans}</p>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Plans</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.finalized}</p>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Finalized</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Truck size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.totalContainers}</p>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Containers</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                            <Package size={20} className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{stats.totalPallets}</p>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Pallets</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={18} />
                    <input
                        type="text"
                        placeholder="Search by Plan ID or Factory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['All', 'Finalized', 'Draft', 'Cancelled'].map(status => (
                        <button 
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
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
                    <button onClick={fetchPlans} className="ml-auto underline hover:no-underline">Retry</button>
                </div>
            )}

            {/* Loading */}
            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 size={48} className="animate-spin text-primary" />
                </div>
            )}

            {/* Empty State */}
            {!loading && !error && filteredPlans.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl bg-foreground dark:bg-dark-foreground">
                    <Inbox size={48} className="mx-auto text-text-secondary/30" />
                    <h3 className="mt-4 text-xl font-semibold text-text dark:text-dark-text">
                        {plans.length === 0 ? 'No Loading Plans Yet' : 'No Matching Plans'}
                    </h3>
                    <p className="text-text-secondary dark:text-dark-text-secondary mt-2">
                        {plans.length === 0 
                            ? 'Create your first loading plan to get started.' 
                            : 'Try adjusting your search or filter criteria.'}
                    </p>
                    {plans.length === 0 && (
                        <Link
                            to="/loading-plans/new"
                            className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors font-semibold"
                        >
                            <PlusCircle size={16} /> Create First Plan
                        </Link>
                    )}
                </div>
            )}

            {/* Plans Grid */}
            {!loading && !error && paginatedPlans.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {paginatedPlans.map(plan => {
                        const statusInfo = getStatusInfo(plan.status);
                        const totalPallets = plan.containers?.reduce((sum, container) => sum + (container.pallets?.length || 0), 0) || 0;
                        const totalBoxes = plan.containers?.reduce((sum, container) => {
                            return sum + (container.pallets?.reduce((pSum, p) => pSum + (p.boxCount || 0), 0) || 0);
                        }, 0) || 0;

                        return (
                            <div 
                                key={plan._id} 
                                className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-sm flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                            >
                                <div className="p-5 border-b border-border dark:border-dark-border">
                                    <div className="flex justify-between items-start">
                                        <p className="font-mono text-lg font-bold text-primary dark:text-dark-primary">
                                            {plan.loadingPlanId}
                                        </p>
                                        <span className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${statusInfo.bg} ${statusInfo.color}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`}></span>
                                            {statusInfo.text}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                                        <span className="flex items-center gap-1.5">
                                            <Calendar size={14}/>
                                            {plan.loadingDate 
                                                ? format(new Date(plan.loadingDate), 'dd MMM, yyyy') 
                                                : plan.createdAt 
                                                    ? format(new Date(plan.createdAt), 'dd MMM, yyyy')
                                                    : 'N/A'
                                            }
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14}/>
                                            {plan.createdAt ? format(new Date(plan.createdAt), 'HH:mm') : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="p-5 flex-grow">
                                    <div className="mb-4">
                                        <div className="text-xs text-text-secondary dark:text-dark-text-secondary mb-1">Factory</div>
                                        <div className="flex items-center gap-2 font-semibold text-text dark:text-dark-text">
                                            <Warehouse size={16} className="text-text-secondary"/>
                                            {plan.factory?.name || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div className="text-center p-3 bg-background dark:bg-dark-background rounded-lg">
                                            <Truck size={20} className="mx-auto text-purple-500 mb-1"/>
                                            <div className="text-xl font-bold text-text dark:text-dark-text">{plan.containers?.length || 0}</div>
                                            <div className="text-xs text-text-secondary">Containers</div>
                                        </div>
                                        <div className="text-center p-3 bg-background dark:bg-dark-background rounded-lg">
                                            <Package size={20} className="mx-auto text-blue-500 mb-1"/>
                                            <div className="text-xl font-bold text-text dark:text-dark-text">{totalPallets}</div>
                                            <div className="text-xs text-text-secondary">Pallets</div>
                                        </div>
                                        <div className="text-center p-3 bg-background dark:bg-dark-background rounded-lg">
                                            <Boxes size={20} className="mx-auto text-orange-500 mb-1"/>
                                            <div className="text-xl font-bold text-text dark:text-dark-text">{totalBoxes.toLocaleString()}</div>
                                            <div className="text-xs text-text-secondary">Boxes</div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="p-3 bg-background/50 dark:bg-dark-background/30 border-t border-border dark:border-dark-border">
                                    <button 
                                        onClick={() => handleViewDetails(plan._id)} 
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
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredPlans.length)} of {filteredPlans.length} plans
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

export default LoadingPlanListPage;