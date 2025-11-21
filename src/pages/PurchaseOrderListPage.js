import React, { useState, useEffect, useCallback } from 'react';
import { getAllPurchaseOrders } from '../api/purchaseOrderApi';
import { Link } from 'react-router-dom';
import { ClipboardList } from 'lucide-react';
import { format } from 'date-fns';

const PurchaseOrderListPage = () => {
    const [purchaseOrders, setPurchaseOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchPurchaseOrders = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { data } = await getAllPurchaseOrders();
            setPurchaseOrders(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch purchase orders.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPurchaseOrders();
    }, [fetchPurchaseOrders]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Draft':
            case 'SentToFactory':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
            case 'Manufacturing':
            case 'QC_InProgress':
                return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
            case 'QC_Completed':
            case 'Packing':
                return 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300';
            case 'Completed':
                return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
            case 'Cancelled':
                return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
        }
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-text dark:text-dark-text">Purchase Orders</h1>
            </div>

            {loading && <div className="text-center p-8">Loading Purchase Orders...</div>}
            {error && <div className="p-6 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>}

            {!loading && !error && (
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-sm overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-background dark:bg-dark-background">
                            <tr>
                                <th className="p-3 text-left font-semibold text-text-secondary dark:text-dark-text-secondary">PO ID</th>
                                <th className="p-3 text-left font-semibold text-text-secondary dark:text-dark-text-secondary">Factory</th>
                                <th className="p-3 text-left font-semibold text-text-secondary dark:text-dark-text-secondary">Status</th>
                                <th className="p-3 text-left font-semibold text-text-secondary dark:text-dark-text-secondary">Source Request</th>
                                <th className="p-3 text-left font-semibold text-text-secondary dark:text-dark-text-secondary">Created</th>
                                <th className="p-3 text-left font-semibold text-text-secondary dark:text-dark-text-secondary"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {purchaseOrders.map((po) => (
                                <tr key={po._id} className="border-t border-border dark:border-dark-border">
                                    <td className="p-3 font-mono text-primary dark:text-dark-primary font-bold">{po.poId}</td>
                                    <td className="p-3 text-text dark:text-dark-text">{po.factory?.name || 'N/A'}</td>
                                    <td className="p-3">
                                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(po.status)}`}>
                                            {po.status}
                                        </span>
                                    </td>
                                    <td className="p-3 font-mono text-text-secondary dark:text-dark-text-secondary">{po.sourceRestockRequest?.requestId}</td>
                                    <td className="p-3 text-text-secondary dark:text-dark-text-secondary">{format(new Date(po.createdAt), 'dd MMM, yyyy')}</td>
                                    <td className="p-3 text-right">
                                        <Link to={`/purchase-orders/${po._id}`} className="font-semibold text-primary dark:text-dark-primary hover:underline">
                                            Manage
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                             {purchaseOrders.length === 0 && (
                                <tr>
                                    <td colSpan="6">
                                        <div className="text-center p-12">
                                            <ClipboardList size={48} className="mx-auto text-text-secondary/50" />
                                            <h3 className="mt-4 text-lg font-semibold">No Purchase Orders Found</h3>
                                            <p className="text-text-secondary mt-1 text-sm">Create a PO from the "Incoming Requests" page to see it here.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default PurchaseOrderListPage;
