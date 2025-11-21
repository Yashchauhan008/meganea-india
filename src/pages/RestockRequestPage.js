// frontend/src/pages/RestockRequestPage.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllRestockRequests } from '../api/restockApi';
import { useNavigate } from 'react-router-dom';
import { Inbox, Hourglass, CheckCircle, Package, FileText, Calendar, Boxes } from 'lucide-react';
import { format } from 'date-fns';

const RestockRequestPage = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const fetchRequests = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getAllRestockRequests();
            setRequests(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch restock requests.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const sortedRequests = useMemo(() => {
        return [...requests].sort((a, b) => {
            if (a.status === 'Pending' && b.status !== 'Pending') return -1;
            if (a.status !== 'Pending' && b.status === 'Pending') return 1;
            return new Date(b.createdAt) - new Date(a.createdAt);
        });
    }, [requests]);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'Pending':
                return { icon: Hourglass, color: 'text-yellow-500 dark:text-yellow-400', pill: 'bg-yellow-100/80 dark:bg-yellow-900/40' };
            case 'Processing':
                return { icon: Package, color: 'text-blue-500 dark:text-blue-400', pill: 'bg-blue-100/80 dark:bg-blue-900/40' };
            case 'Completed':
            case 'Partially Arrived':
            case 'Completed with Discrepancy':
                return { icon: CheckCircle, color: 'text-green-500 dark:text-green-400', pill: 'bg-green-100/80 dark:bg-green-900/40' };
            default:
                return { icon: FileText, color: 'text-text-secondary dark:text-dark-text-secondary', pill: 'bg-background dark:bg-dark-background' };
        }
    };

    // --- THIS IS THE CORRECTED NAVIGATION HANDLER ---
    const handleCreatePO = (requestData) => {
        // We now navigate to the URL that includes the request's ID.
        // We no longer need to pass state, as the ID is in the URL.
        navigate(`/purchase-orders/create/${requestData._id}`);
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text dark:text-dark-text">Incoming Requests</h1>
                <p className="text-text-secondary dark:text-dark-text-secondary">Review requests from Dubai and create Purchase Orders.</p>
            </div>

            {loading && <div className="text-center p-8 text-text dark:text-dark-text">Loading requests...</div>}
            {error && <div className="p-6 text-center text-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg"><h2 className="font-bold text-lg">An Error Occurred</h2><p>{error}</p></div>}
            
            {!loading && !error && (
                <>
                    {sortedRequests.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-lg">
                            <Inbox size={48} className="mx-auto text-text-secondary/50 dark:text-dark-text-secondary/50" />
                            <h3 className="mt-4 text-lg font-semibold text-text dark:text-dark-text">All Clear!</h3>
                            <p className="text-text-secondary dark:text-dark-text-secondary mt-1 text-sm">There are no incoming restock requests.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {sortedRequests.map(req => {
                                const { icon: Icon, color, pill } = getStatusInfo(req.status);
                                const totalItems = req.requestedItems.reduce((sum, item) => sum + item.quantityRequested, 0);
                                return (
                                    <div key={req._id} className={`bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-xl shadow-sm p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${req.status === 'Pending' ? 'border-l-4 border-primary dark:border-dark-primary' : ''}`}>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-4 mb-2">
                                                <span className={`font-mono text-lg font-bold text-text dark:text-dark-text`}>{req.requestId}</span>
                                                <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-1 rounded-full ${pill} ${color}`}>
                                                    <Icon size={14} /> {req.status}
                                                </span>
                                            </div>
                                            <div className="text-sm text-text-secondary dark:text-dark-text-secondary flex items-center gap-4">
                                                <span className="flex items-center gap-1.5"><Calendar size={14} /> {format(new Date(req.createdAt), 'dd MMM, yyyy')}</span>
                                                <span className="flex items-center gap-1.5"><Boxes size={14} /> {req.requestedItems.length} tile types, {totalItems} total boxes</span>
                                            </div>
                                        </div>
                                        <div className="w-full sm:w-auto flex-shrink-0">
                                            <button
                                                onClick={() => handleCreatePO(req)}
                                                disabled={req.status !== 'Pending'}
                                                className={`w-full text-center px-4 py-2 rounded-md font-semibold text-sm transition-colors ${
                                                    req.status === 'Pending' 
                                                    ? 'bg-primary text-white hover:bg-primary-hover' 
                                                    : 'bg-background dark:bg-dark-background/50 text-text-secondary dark:text-dark-text-secondary cursor-not-allowed'
                                                }`}
                                            >
                                                Create Purchase Order
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default RestockRequestPage;
