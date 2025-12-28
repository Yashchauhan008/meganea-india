// FILE LOCATION: src/pages/RestockRequestPage.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllRestockRequests } from '../api/restockApi';
import { getAllPurchaseOrders } from '../api/purchaseOrderApi';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { 
    Inbox, Hourglass, CheckCircle, Package, FileText, Calendar, Boxes, 
    RefreshCw, Loader2, Search, ChevronDown, ChevronUp, User,
    AlertCircle, X, ArrowRight, RotateCcw, XCircle, Truck, Eye,
    ChevronLeft, ChevronRight, Layers
} from 'lucide-react';
import { format } from 'date-fns';

const ITEMS_PER_PAGE = 10;

const RestockRequestPage = () => {
    const [requests, setRequests] = useState([]);
    const [allPurchaseOrders, setAllPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [expandedRequest, setExpandedRequest] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    
    const [statusModal, setStatusModal] = useState({ open: false, request: null });
    const [newStatus, setNewStatus] = useState('');
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [statusError, setStatusError] = useState('');

    const navigate = useNavigate();

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [restockResponse, poResponse] = await Promise.all([
                getAllRestockRequests(),
                getAllPurchaseOrders()
            ]);
            
            const restockData = restockResponse?.data || restockResponse || [];
            const poData = poResponse?.data || poResponse || [];
            
            setRequests(Array.isArray(restockData) ? restockData : []);
            setAllPurchaseOrders(Array.isArray(poData) ? poData : []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch restock requests.');
            setRequests([]);
            setAllPurchaseOrders([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const getLinkedPOs = useCallback((restockId) => {
        return allPurchaseOrders.filter(po => 
            po.sourceRestockRequest === restockId || 
            po.sourceRestockRequest?._id === restockId
        );
    }, [allPurchaseOrders]);

    const statusConfig = {
        'Pending': { 
            icon: Hourglass, 
            color: 'text-yellow-600 dark:text-yellow-400', 
            bg: 'bg-yellow-100 dark:bg-yellow-900/40',
            description: 'Awaiting processing'
        },
        'Processing': { 
            icon: Package, 
            color: 'text-blue-600 dark:text-blue-400', 
            bg: 'bg-blue-100 dark:bg-blue-900/40',
            description: 'Being processed'
        },
        'Partially Arrived': { 
            icon: Truck, 
            color: 'text-cyan-600 dark:text-cyan-400', 
            bg: 'bg-cyan-100 dark:bg-cyan-900/40',
            description: 'Some items arrived'
        },
        'Completed': { 
            icon: CheckCircle, 
            color: 'text-green-600 dark:text-green-400', 
            bg: 'bg-green-100 dark:bg-green-900/40',
            description: 'All items received'
        },
        'Completed with Discrepancy': { 
            icon: AlertCircle, 
            color: 'text-orange-600 dark:text-orange-400', 
            bg: 'bg-orange-100 dark:bg-orange-900/40',
            description: 'Completed with differences'
        },
        'Cancelled': { 
            icon: XCircle, 
            color: 'text-red-600 dark:text-red-400', 
            bg: 'bg-red-100 dark:bg-red-900/40',
            description: 'Request cancelled'
        },
    };

    const getAvailableStatuses = (currentStatus) => {
        const transitions = {
            'Pending': ['Processing', 'Cancelled'],
            'Processing': ['Pending', 'Partially Arrived', 'Completed', 'Cancelled'],
            'Partially Arrived': ['Processing', 'Completed', 'Completed with Discrepancy'],
            'Completed': [],
            'Completed with Discrepancy': [],
            'Cancelled': ['Pending'],
        };
        return transitions[currentStatus] || [];
    };

    const filteredRequests = useMemo(() => {
        return requests
            .filter(req => {
                const matchesStatus = statusFilter === 'All' || req.status === statusFilter;
                const matchesSearch = !searchTerm || 
                    req.requestId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    req.requestedItems?.some(item => 
                        item.tile?.name?.toLowerCase().includes(searchTerm.toLowerCase())
                    );
                return matchesStatus && matchesSearch;
            })
            .sort((a, b) => {
                if (a.status === 'Pending' && b.status !== 'Pending') return -1;
                if (a.status !== 'Pending' && b.status === 'Pending') return 1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
    }, [requests, statusFilter, searchTerm]);

    const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
    const paginatedRequests = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredRequests.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredRequests, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchTerm]);

    const statusCounts = useMemo(() => {
        const counts = { All: requests.length };
        requests.forEach(req => {
            counts[req.status] = (counts[req.status] || 0) + 1;
        });
        return counts;
    }, [requests]);

    const handleStatusChange = async () => {
        if (!newStatus || !statusModal.request) return;
        setStatusUpdating(true);
        setStatusError('');
        try {
            await api.patch(`/restocks/${statusModal.request._id}/status`, { status: newStatus });
            await fetchRequests();
            setStatusModal({ open: false, request: null });
            setNewStatus('');
        } catch (err) {
            setStatusError(err.response?.data?.message || 'Failed to update status');
        } finally {
            setStatusUpdating(false);
        }
    };

    const openStatusModal = (request, e) => {
        e.stopPropagation();
        setStatusModal({ open: true, request });
        setNewStatus('');
        setStatusError('');
    };

    const handleCreatePO = (request, e) => {
        e.stopPropagation();
        navigate(`/purchase-orders/create/${request._id}`);
    };

    const toggleExpand = (requestId) => {
        setExpandedRequest(prev => prev === requestId ? null : requestId);
    };

    const getStatusInfo = (status) => statusConfig[status] || statusConfig['Pending'];

    // Calculate progress info for an item - FIXED LOGIC
    const getProgressInfo = (requested, inPO, shipped, arrived) => {
        if (requested === 0) {
            return { percent: 0, color: 'bg-gray-400', stage: 'none' };
        }

        // Priority: Arrived > Shipped > In PO
        if (arrived > 0) {
            const percent = Math.min(100, Math.round((arrived / requested) * 100));
            return { percent, color: 'bg-emerald-500', stage: 'arrived' };
        }

        if (shipped > 0) {
            const percent = Math.min(100, Math.round((shipped / requested) * 100));
            return { percent, color: 'bg-blue-500', stage: 'shipped' };
        }

        if (inPO > 0) {
            const percent = Math.min(100, Math.round((inPO / requested) * 100));
            return { percent, color: 'bg-amber-400', stage: 'inPO' };
        }

        return { percent: 0, color: 'bg-gray-400', stage: 'none' };
    };

    const poStatusColors = {
        'Draft': 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        'SentToFactory': 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
        'Manufacturing': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
        'QC_InProgress': 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
        'QC_Completed': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
        'Packing': 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
        'Completed': 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
        'Cancelled': 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-text dark:text-dark-text">Incoming Requests</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">
                        Review requests from Dubai and create Purchase Orders
                    </p>
                </div>
                <button 
                    onClick={fetchRequests} 
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
                            <FileText size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{statusCounts.All || 0}</p>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Requests</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                            <Hourglass size={20} className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{statusCounts.Pending || 0}</p>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Pending</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Package size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{statusCounts.Processing || 0}</p>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Processing</p>
                        </div>
                    </div>
                </div>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-4 border border-border dark:border-dark-border">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                            <CheckCircle size={20} className="text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-text dark:text-dark-text">{statusCounts.Completed || 0}</p>
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Completed</p>
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
                        placeholder="Search by request ID or tile name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    {['All', 'Pending', 'Processing', 'Partially Arrived', 'Completed', 'Cancelled'].map(status => (
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

            {error && (
                <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={fetchRequests} className="ml-auto underline hover:no-underline">Retry</button>
                </div>
            )}

            {loading && (
                <div className="flex justify-center py-20">
                    <Loader2 size={48} className="animate-spin text-primary" />
                </div>
            )}

            {!loading && !error && filteredRequests.length === 0 && (
                <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-xl bg-foreground dark:bg-dark-foreground">
                    <Inbox size={48} className="mx-auto text-text-secondary/30" />
                    <h3 className="mt-4 text-xl font-semibold text-text dark:text-dark-text">
                        {requests.length === 0 ? 'All Clear!' : 'No Matching Requests'}
                    </h3>
                    <p className="text-text-secondary dark:text-dark-text-secondary mt-2">
                        {requests.length === 0 ? 'There are no incoming restock requests at this time.' : 'Try adjusting your search or filter criteria.'}
                    </p>
                </div>
            )}

            {/* Request List */}
            {!loading && !error && paginatedRequests.length > 0 && (
                <div className="space-y-4">
                    {paginatedRequests.map(req => {
                        const { icon: Icon, color, bg } = getStatusInfo(req.status);
                        const totalRequested = req.requestedItems?.reduce((sum, item) => sum + (item.quantityRequested || 0), 0) || 0;
                        const totalInPO = req.requestedItems?.reduce((sum, item) => sum + (item.quantityInPO || 0), 0) || 0;
                        const totalShipped = req.requestedItems?.reduce((sum, item) => sum + (item.quantityShipped || 0), 0) || 0;
                        const totalArrived = req.requestedItems?.reduce((sum, item) => sum + (item.quantityArrived || 0), 0) || 0;
                        const isExpanded = expandedRequest === req._id;
                        const availableStatuses = getAvailableStatuses(req.status);
                        const isPending = req.status === 'Pending';
                        const linkedPOs = getLinkedPOs(req._id);

                        return (
                            <div 
                                key={req._id} 
                                className={`bg-foreground dark:bg-dark-foreground border rounded-xl shadow-sm overflow-hidden transition-all ${
                                    isPending ? 'border-l-4 border-l-primary border-t border-r border-b border-border dark:border-dark-border' : 'border-border dark:border-dark-border'
                                }`}
                            >
                                {/* Main Row */}
                                <div className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-dark-border/50 transition-colors" onClick={() => toggleExpand(req._id)}>
                                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="flex flex-wrap items-center gap-3 mb-2">
                                                <span className="font-mono text-lg font-bold text-text dark:text-dark-text">{req.requestId}</span>
                                                <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full ${bg} ${color}`}>
                                                    <Icon size={14} /> {req.status}
                                                </span>
                                                {isPending && (
                                                    <span className="text-xs font-medium px-2 py-0.5 bg-primary/10 text-primary rounded-full">Action Required</span>
                                                )}
                                                {linkedPOs.length > 0 && (
                                                    <span className="text-xs font-medium px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full flex items-center gap-1">
                                                        <Layers size={12} /> {linkedPOs.length} PO{linkedPOs.length > 1 ? 's' : ''}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-text-secondary dark:text-dark-text-secondary">
                                                <span className="flex items-center gap-1.5"><Calendar size={14} /> {format(new Date(req.createdAt), 'dd MMM, yyyy')}</span>
                                                <span className="flex items-center gap-1.5"><Boxes size={14} /> {req.requestedItems?.length || 0} tile types</span>
                                                <span className="flex items-center gap-1.5">
                                                    <Package size={14} /> 
                                                    <span className="font-semibold text-text dark:text-dark-text">{totalRequested.toLocaleString()}</span> requested
                                                    {totalInPO > 0 && <span className="text-amber-500">({totalInPO.toLocaleString()} in PO)</span>}
                                                </span>
                                                {totalArrived > 0 && (
                                                    <span className="flex items-center gap-1.5 text-emerald-500">
                                                        <CheckCircle size={14} /> {totalArrived.toLocaleString()} arrived
                                                    </span>
                                                )}
                                                {req.requestedBy && (
                                                    <span className="flex items-center gap-1.5"><User size={14} /> {req.requestedBy.username || 'Unknown'}</span>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {availableStatuses.length > 0 && (
                                                <button onClick={(e) => openStatusModal(req, e)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-secondary dark:text-dark-text-secondary border border-border dark:border-dark-border rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border transition-colors" title="Change status">
                                                    <RotateCcw size={16} /><span className="hidden sm:inline">Change Status</span>
                                                </button>
                                            )}
                                            {isPending && (
                                                <button onClick={(e) => handleCreatePO(req, e)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors shadow-sm">
                                                    <FileText size={16} />Create PO<ArrowRight size={16} />
                                                </button>
                                            )}
                                            {!isPending && (
                                                <button onClick={(e) => { e.stopPropagation(); navigate(`/purchase-orders/create/${req._id}`); }} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-primary border border-primary/30 rounded-lg hover:bg-primary/10 transition-colors">
                                                    <Eye size={16} />View
                                                </button>
                                            )}
                                            <button className="p-2 text-text-secondary hover:text-text dark:hover:text-dark-text transition-colors">
                                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-border dark:border-dark-border bg-background/50 dark:bg-dark-background/50">
                                        <div className="pt-4 space-y-4">
                                            {/* Linked Purchase Orders */}
                                            {linkedPOs.length > 0 && (
                                                <div className="bg-foreground dark:bg-dark-foreground rounded-lg p-4 border border-border dark:border-dark-border">
                                                    <h4 className="font-semibold text-text dark:text-dark-text mb-3 flex items-center gap-2">
                                                        <Layers size={18} className="text-primary" />Linked Purchase Orders ({linkedPOs.length})
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                                        {linkedPOs.map(po => {
                                                            const poTotalBoxes = po.items?.reduce((sum, item) => sum + (item.totalBoxesOrdered || 0), 0) || 0;
                                                            return (
                                                                <div key={po._id} className="p-3 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border hover:border-primary/50 transition-colors cursor-pointer" onClick={(e) => { e.stopPropagation(); navigate(`/purchase-orders`); }}>
                                                                    <div className="flex justify-between items-start mb-2">
                                                                        <span className="font-mono font-bold text-primary dark:text-dark-primary">{po.poId}</span>
                                                                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${poStatusColors[po.status] || poStatusColors['Draft']}`}>{po.status?.replace(/_/g, ' ')}</span>
                                                                    </div>
                                                                    <div className="text-sm text-text-secondary dark:text-dark-text-secondary space-y-1">
                                                                        <p className="flex items-center gap-1"><Package size={12} />{po.factory?.name || 'Unknown Factory'}</p>
                                                                        <p className="flex items-center gap-1"><Boxes size={12} />{poTotalBoxes.toLocaleString()} boxes</p>
                                                                        <p className="flex items-center gap-1"><Calendar size={12} />{format(new Date(po.createdAt), 'dd MMM, yyyy')}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Requested Items Table */}
                                            <div>
                                                <h4 className="font-semibold text-text dark:text-dark-text mb-3">Requested Items</h4>
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-sm">
                                                        <thead>
                                                            <tr className="border-b border-border dark:border-dark-border">
                                                                <th className="text-left py-3 px-3 font-semibold text-text-secondary dark:text-dark-text-secondary">Tile</th>
                                                                <th className="text-center py-3 px-3 font-semibold text-text-secondary dark:text-dark-text-secondary">Requested</th>
                                                                <th className="text-center py-3 px-3 font-semibold text-amber-500">In PO</th>
                                                                <th className="text-center py-3 px-3 font-semibold text-blue-500">Shipped</th>
                                                                <th className="text-center py-3 px-3 font-semibold text-emerald-500">Arrived</th>
                                                                <th className="text-left py-3 px-3 font-semibold text-text-secondary dark:text-dark-text-secondary w-56">Progress</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {req.requestedItems?.map((item, idx) => {
                                                                const requested = item.quantityRequested || 0;
                                                                const inPO = item.quantityInPO || 0;
                                                                const shipped = item.quantityShipped || 0;
                                                                const arrived = item.quantityArrived || 0;
                                                                const progressInfo = getProgressInfo(requested, inPO, shipped, arrived);

                                                                return (
                                                                    <tr key={idx} className="border-b border-border/50 dark:border-dark-border/50 hover:bg-foreground dark:hover:bg-dark-foreground transition-colors">
                                                                        <td className="py-3 px-3">
                                                                            <p className="font-medium text-text dark:text-dark-text">{item.tile?.name || 'Unknown Tile'}</p>
                                                                            {item.tile?.tileId && <p className="text-xs text-text-secondary dark:text-dark-text-secondary font-mono">{item.tile.tileId}</p>}
                                                                        </td>
                                                                        <td className="py-3 px-3 text-center font-bold text-text dark:text-dark-text">{requested.toLocaleString()}</td>
                                                                        <td className="py-3 px-3 text-center">
                                                                            <span className={`font-semibold ${inPO > 0 ? 'text-amber-500' : 'text-text-secondary/30'}`}>{inPO.toLocaleString()}</span>
                                                                        </td>
                                                                        <td className="py-3 px-3 text-center">
                                                                            <span className={`font-semibold ${shipped > 0 ? 'text-blue-500' : 'text-text-secondary/30'}`}>{shipped.toLocaleString()}</span>
                                                                        </td>
                                                                        <td className="py-3 px-3 text-center">
                                                                            <span className={`font-semibold ${arrived > 0 ? 'text-emerald-500' : 'text-text-secondary/30'}`}>{arrived.toLocaleString()}</span>
                                                                        </td>
                                                                        <td className="py-3 px-3">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="flex-1 h-2.5 bg-slate-600 rounded-full overflow-hidden">
                                                                                    <div className={`h-full rounded-full transition-all duration-500 ${progressInfo.color}`} style={{ width: `${progressInfo.percent}%` }} />
                                                                                </div>
                                                                                <span className={`text-sm font-bold w-14 text-right ${
                                                                                    progressInfo.stage === 'arrived' ? 'text-emerald-500' : 
                                                                                    progressInfo.stage === 'shipped' ? 'text-blue-500' : 
                                                                                    progressInfo.stage === 'inPO' ? 'text-amber-500' : 'text-text-secondary'
                                                                                }`}>{progressInfo.percent}%</span>
                                                                            </div>
                                                                            <p className={`text-xs mt-1 ${
                                                                                progressInfo.stage === 'arrived' ? 'text-emerald-500' : 
                                                                                progressInfo.stage === 'shipped' ? 'text-blue-500' : 
                                                                                progressInfo.stage === 'inPO' ? 'text-amber-500' : 'text-text-secondary/50'
                                                                            }`}>
                                                                                {progressInfo.stage === 'arrived' && `${arrived}/${requested} arrived`}
                                                                                {progressInfo.stage === 'shipped' && `${shipped}/${requested} shipped`}
                                                                                {progressInfo.stage === 'inPO' && `${inPO}/${requested} in PO`}
                                                                                {progressInfo.stage === 'none' && 'Not started'}
                                                                            </p>
                                                                        </td>
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                        <tfoot>
                                                            <tr className="bg-foreground dark:bg-dark-foreground font-bold">
                                                                <td className="py-3 px-3 text-text dark:text-dark-text">Total</td>
                                                                <td className="py-3 px-3 text-center text-text dark:text-dark-text">{totalRequested.toLocaleString()}</td>
                                                                <td className="py-3 px-3 text-center text-amber-500">{totalInPO.toLocaleString()}</td>
                                                                <td className="py-3 px-3 text-center text-blue-500">{totalShipped.toLocaleString()}</td>
                                                                <td className="py-3 px-3 text-center text-emerald-500">{totalArrived.toLocaleString()}</td>
                                                                <td className="py-3 px-3">
                                                                    {(() => {
                                                                        const totalProgress = getProgressInfo(totalRequested, totalInPO, totalShipped, totalArrived);
                                                                        return (
                                                                            <>
                                                                                <div className="flex items-center gap-3">
                                                                                    <div className="flex-1 h-2.5 bg-slate-600 rounded-full overflow-hidden">
                                                                                        <div className={`h-full rounded-full transition-all duration-500 ${totalProgress.color}`} style={{ width: `${totalProgress.percent}%` }} />
                                                                                    </div>
                                                                                    <span className={`text-sm font-bold w-14 text-right ${
                                                                                        totalProgress.stage === 'arrived' ? 'text-emerald-500' : 
                                                                                        totalProgress.stage === 'shipped' ? 'text-blue-500' : 
                                                                                        totalProgress.stage === 'inPO' ? 'text-amber-500' : 'text-text-secondary'
                                                                                    }`}>{totalProgress.percent}%</span>
                                                                                </div>
                                                                                <p className={`text-xs mt-1 ${
                                                                                    totalProgress.stage === 'arrived' ? 'text-emerald-500' : 
                                                                                    totalProgress.stage === 'shipped' ? 'text-blue-500' : 
                                                                                    totalProgress.stage === 'inPO' ? 'text-amber-500' : 'text-text-secondary/50'
                                                                                }`}>
                                                                                    {totalProgress.stage === 'arrived' && `${totalArrived.toLocaleString()}/${totalRequested.toLocaleString()} arrived`}
                                                                                    {totalProgress.stage === 'shipped' && `${totalShipped.toLocaleString()}/${totalRequested.toLocaleString()} shipped`}
                                                                                    {totalProgress.stage === 'inPO' && `${totalInPO.toLocaleString()}/${totalRequested.toLocaleString()} in PO`}
                                                                                    {totalProgress.stage === 'none' && 'Not started'}
                                                                                </p>
                                                                            </>
                                                                        );
                                                                    })()}
                                                                </td>
                                                            </tr>
                                                        </tfoot>
                                                    </table>
                                                </div>
                                            </div>

                                            {req.notes && (
                                                <div className="p-3 bg-foreground dark:bg-dark-foreground rounded-lg border border-border dark:border-dark-border">
                                                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                                                        <strong className="text-text dark:text-dark-text">Notes:</strong> {req.notes}
                                                    </p>
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

            {/* Pagination */}
            {!loading && totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t border-border dark:border-dark-border">
                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                        Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, filteredRequests.length)} of {filteredRequests.length} requests
                    </p>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
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
                                    <button key={pageNum} onClick={() => setCurrentPage(pageNum)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum ? 'bg-primary text-white' : 'border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border text-text dark:text-dark-text'}`}>{pageNum}</button>
                                );
                            })}
                        </div>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-border dark:border-dark-border hover:bg-gray-100 dark:hover:bg-dark-border disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                            <ChevronRight size={18} className="text-text dark:text-dark-text" />
                        </button>
                    </div>
                </div>
            )}

            {/* Status Change Modal */}
            {statusModal.open && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setStatusModal({ open: false, request: null })}>
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold text-text dark:text-dark-text">Change Status</h3>
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1">Request: <span className="font-mono font-bold">{statusModal.request?.requestId}</span></p>
                            </div>
                            <button onClick={() => setStatusModal({ open: false, request: null })} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-dark-border"><X size={20} className="text-text-secondary" /></button>
                        </div>

                        <div className="mb-4 p-3 bg-background dark:bg-dark-background rounded-lg">
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mb-1">Current Status</p>
                            {(() => {
                                const { icon: IconCurrent, color: colorCurrent, bg: bgCurrent } = getStatusInfo(statusModal.request?.status);
                                return (
                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-sm font-bold ${bgCurrent} ${colorCurrent}`}>
                                        <IconCurrent size={14} /> {statusModal.request?.status}
                                    </span>
                                );
                            })()}
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">Select New Status</label>
                            <div className="space-y-2">
                                {getAvailableStatuses(statusModal.request?.status).map(status => {
                                    const { icon: IconOption, color: colorOption, bg: bgOption, description } = getStatusInfo(status);
                                    return (
                                        <button key={status} onClick={() => setNewStatus(status)} className={`w-full flex items-center justify-between p-3 rounded-lg border-2 transition-all ${newStatus === status ? 'border-primary bg-primary/5' : 'border-border dark:border-dark-border hover:border-primary/50'}`}>
                                            <div className="flex items-center gap-3">
                                                <span className={`flex items-center justify-center w-8 h-8 rounded-full ${bgOption}`}><IconOption size={16} className={colorOption} /></span>
                                                <div className="text-left">
                                                    <p className="font-medium text-text dark:text-dark-text">{status}</p>
                                                    <p className="text-xs text-text-secondary dark:text-dark-text-secondary">{description}</p>
                                                </div>
                                            </div>
                                            {newStatus === status && <CheckCircle size={20} className="text-primary" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {statusError && (
                            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg text-sm flex items-center gap-2">
                                <AlertCircle size={16} />{statusError}
                            </div>
                        )}

                        <div className="flex justify-end gap-3">
                            <button onClick={() => setStatusModal({ open: false, request: null })} className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border transition-colors">Cancel</button>
                            <button onClick={handleStatusChange} disabled={!newStatus || statusUpdating} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors">
                                {statusUpdating && <Loader2 size={16} className="animate-spin" />}Update Status
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RestockRequestPage;