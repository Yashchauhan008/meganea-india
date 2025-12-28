// FILE LOCATION: src/components/dispatches/DispatchDetailModal.js

import React, { useState, useMemo } from 'react';
import {
    X, Loader2, Package, Truck, Warehouse, Box, Layers, Calendar, FileText, MapPin,
    User, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp, Boxes, History,
    Trash2, Send, XCircle
} from 'lucide-react';
import { updateDispatchStatus, deleteDispatch } from '../../api/dispatchApi';

const DispatchDetailModal = ({ dispatch, onClose, onUpdate, onDelete }) => {
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState('');
    const [expandedContainers, setExpandedContainers] = useState({});
    const [showStatusHistory, setShowStatusHistory] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteReason, setDeleteReason] = useState('');
    const [statusNotes, setStatusNotes] = useState('');
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState('');

    const statusConfig = {
        Pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300', icon: Clock },
        Ready: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300', icon: CheckCircle2 },
        'In Transit': { color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300', icon: Truck },
        Delivered: { color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300', icon: CheckCircle2 },
        Completed: { color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300', icon: CheckCircle2 },
        Cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300', icon: XCircle },
    };

    const getNextStatuses = (currentStatus) => {
        const transitions = { Pending: ['Ready', 'Cancelled'], Ready: ['In Transit', 'Cancelled'], 'In Transit': ['Delivered'], Delivered: ['Completed'], Completed: [], Cancelled: [] };
        return transitions[currentStatus] || [];
    };

    // ALL HOOKS MUST BE BEFORE CONDITIONAL RETURN
    const tileAggregation = useMemo(() => {
        if (!dispatch?.containers) return [];
        const tiles = {};
        dispatch.containers.forEach((container) => {
            container.items?.forEach((item) => {
                const tileKey = item.tileId || item.tileName || 'unknown';
                if (!tiles[tileKey]) tiles[tileKey] = { tileName: item.tileName || 'Unknown Tile', tileId: item.tileId, palletCount: 0, khatliCount: 0, palletBoxes: 0, khatliBoxes: 0, totalBoxes: 0 };
                const quantity = item.quantity || 1;
                const boxes = (item.boxCount || 0) * quantity;
                if (item.itemType === 'Pallet') { tiles[tileKey].palletCount += quantity; tiles[tileKey].palletBoxes += boxes; }
                else if (item.itemType === 'Khatli') { tiles[tileKey].khatliCount += quantity; tiles[tileKey].khatliBoxes += boxes; }
                tiles[tileKey].totalBoxes += boxes;
            });
        });
        return Object.values(tiles);
    }, [dispatch?.containers]);

    const factorySummary = useMemo(() => {
        if (!dispatch?.containers) return [];
        const factories = {};
        dispatch.containers.forEach((container) => {
            const factoryKey = container.factory || container.factoryName || 'unknown';
            const factoryName = container.factoryName || 'Unknown Factory';
            if (!factories[factoryKey]) factories[factoryKey] = { factoryName, containerCount: 0, palletCount: 0, khatliCount: 0, totalBoxes: 0 };
            factories[factoryKey].containerCount += 1;
            container.items?.forEach((item) => {
                const quantity = item.quantity || 1;
                const boxes = (item.boxCount || 0) * quantity;
                if (item.itemType === 'Pallet') factories[factoryKey].palletCount += quantity;
                else if (item.itemType === 'Khatli') factories[factoryKey].khatliCount += quantity;
                factories[factoryKey].totalBoxes += boxes;
            });
        });
        return Object.values(factories);
    }, [dispatch?.containers]);

    const totals = useMemo(() => {
        if (!dispatch) return { totalPallets: 0, totalKhatlis: 0, totalBoxes: 0, totalContainers: 0 };
        return {
            totalPallets: dispatch.stockSummary?.totalPallets || dispatch.containers?.reduce((sum, c) => sum + (c.items?.filter(i => i.itemType === 'Pallet').length || 0), 0) || 0,
            totalKhatlis: dispatch.stockSummary?.totalKhatlis || dispatch.containers?.reduce((sum, c) => sum + (c.items?.filter(i => i.itemType === 'Khatli').length || 0), 0) || 0,
            totalBoxes: dispatch.stockSummary?.totalBoxes || dispatch.containers?.reduce((sum, c) => sum + (c.totalBoxes || 0), 0) || 0,
            totalContainers: dispatch.containers?.length || 0,
        };
    }, [dispatch]);

    // CONDITIONAL RETURN AFTER ALL HOOKS
    if (!dispatch) return null;

    const toggleContainer = (containerId) => setExpandedContainers((prev) => ({ ...prev, [containerId]: !prev[containerId] }));

    const handleStatusUpdate = async () => {
        if (!selectedStatus) return;
        setIsUpdatingStatus(true); setError('');
        try {
            const updatedDispatch = await updateDispatchStatus(dispatch._id, selectedStatus, statusNotes);
            onUpdate?.(updatedDispatch); setShowStatusModal(false); setStatusNotes(''); setSelectedStatus('');
        } catch (err) { setError(typeof err === 'string' ? err : err.message || 'Failed to update status'); }
        finally { setIsUpdatingStatus(false); }
    };

    const handleDelete = async () => {
        setIsDeleting(true); setError('');
        try { await deleteDispatch(dispatch._id, deleteReason); onDelete?.(dispatch._id); onClose(); }
        catch (err) { setError(typeof err === 'string' ? err : err.message || 'Failed to delete dispatch'); }
        finally { setIsDeleting(false); }
    };

    const formatDate = (date) => date ? new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A';
    const formatDateTime = (date) => date ? new Date(date).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A';

    const StatusIcon = statusConfig[dispatch.status]?.icon || Clock;
    const nextStatuses = getNextStatuses(dispatch.status);
    const { totalPallets, totalKhatlis, totalBoxes, totalContainers } = totals;

    return (
        <>
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    {/* Header */}
                    <div className="flex justify-between items-start p-5 border-b border-border dark:border-dark-border">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-2xl font-bold text-text dark:text-dark-text">Dispatch Details</h1>
                                <span className={`px-3 py-1 text-sm font-bold rounded-full flex items-center gap-1.5 ${statusConfig[dispatch.status]?.color}`}><StatusIcon size={14} />{dispatch.status}</span>
                            </div>
                            <p className="font-mono text-primary dark:text-dark-primary text-lg">{dispatch.dispatchNumber}</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background transition-colors"><X size={24} className="text-text-secondary" /></button>
                    </div>

                    {error && <div className="mx-5 mt-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-2"><AlertCircle size={18} />{error}</div>}

                    <div className="flex-grow overflow-y-auto p-5 space-y-6">
                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800"><div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-1"><Package size={18} /><span className="text-sm font-medium">Containers</span></div><p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{totalContainers}</p></div>
                            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-800"><div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-1"><Layers size={18} /><span className="text-sm font-medium">Pallets</span></div><p className="text-3xl font-bold text-green-700 dark:text-green-300">{totalPallets}</p></div>
                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800"><div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 mb-1"><Boxes size={18} /><span className="text-sm font-medium">Khatlis</span></div><p className="text-3xl font-bold text-purple-700 dark:text-purple-300">{totalKhatlis}</p></div>
                            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/20 rounded-xl p-4 border border-orange-200 dark:border-orange-800"><div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 mb-1"><Box size={18} /><span className="text-sm font-medium">Total Boxes</span></div><p className="text-3xl font-bold text-orange-700 dark:text-orange-300">{totalBoxes.toLocaleString()}</p></div>
                        </div>

                        {/* Dispatch Info */}
                        <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
                            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2"><FileText size={20} className="text-primary" />Dispatch Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="flex items-start gap-3"><div className="p-2 bg-primary/10 rounded-lg"><FileText size={18} className="text-primary" /></div><div><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Invoice Number</p><p className="font-semibold text-text dark:text-dark-text">{dispatch.invoiceNumber || 'N/A'}</p></div></div>
                                <div className="flex items-start gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Calendar size={18} className="text-primary" /></div><div><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Dispatch Date</p><p className="font-semibold text-text dark:text-dark-text">{formatDate(dispatch.dispatchDate)}</p></div></div>
                                <div className="flex items-start gap-3"><div className="p-2 bg-primary/10 rounded-lg"><MapPin size={18} className="text-primary" /></div><div><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Destination</p><p className="font-semibold text-text dark:text-dark-text">{dispatch.destination || 'N/A'}</p></div></div>
                                <div className="flex items-start gap-3"><div className="p-2 bg-primary/10 rounded-lg"><User size={18} className="text-primary" /></div><div><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Created By</p><p className="font-semibold text-text dark:text-dark-text">{dispatch.createdBy?.username || dispatch.createdBy?.email || 'N/A'}</p></div></div>
                                <div className="flex items-start gap-3"><div className="p-2 bg-primary/10 rounded-lg"><Clock size={18} className="text-primary" /></div><div><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Created At</p><p className="font-semibold text-text dark:text-dark-text">{formatDateTime(dispatch.createdAt)}</p></div></div>
                                {dispatch.notes && <div className="flex items-start gap-3 md:col-span-2 lg:col-span-3"><div className="p-2 bg-primary/10 rounded-lg"><FileText size={18} className="text-primary" /></div><div className="flex-1"><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Notes</p><p className="font-medium text-text dark:text-dark-text">{dispatch.notes}</p></div></div>}
                            </div>
                        </div>

                        {/* Tile Summary */}
                        {tileAggregation.length > 0 && (
                            <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2"><Layers size={20} className="text-primary" />Tile Summary ({tileAggregation.length} Types)</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead><tr className="border-b border-border dark:border-dark-border"><th className="text-left py-3 px-4 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">Tile Name</th><th className="text-center py-3 px-4 text-sm font-semibold text-green-600 dark:text-green-400">Pallets</th><th className="text-center py-3 px-4 text-sm font-semibold text-green-600 dark:text-green-400">Pallet Boxes</th><th className="text-center py-3 px-4 text-sm font-semibold text-purple-600 dark:text-purple-400">Khatlis</th><th className="text-center py-3 px-4 text-sm font-semibold text-purple-600 dark:text-purple-400">Khatli Boxes</th><th className="text-center py-3 px-4 text-sm font-semibold text-orange-600 dark:text-orange-400">Total Boxes</th></tr></thead>
                                        <tbody>{tileAggregation.map((tile, index) => (<tr key={index} className="border-b border-border/50 dark:border-dark-border/50 hover:bg-foreground dark:hover:bg-dark-foreground transition-colors"><td className="py-3 px-4 font-semibold text-text dark:text-dark-text">{tile.tileName}</td><td className="py-3 px-4 text-center"><span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full font-semibold text-sm">{tile.palletCount}</span></td><td className="py-3 px-4 text-center text-green-600 dark:text-green-400 font-medium">{tile.palletBoxes.toLocaleString()}</td><td className="py-3 px-4 text-center"><span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full font-semibold text-sm">{tile.khatliCount}</span></td><td className="py-3 px-4 text-center text-purple-600 dark:text-purple-400 font-medium">{tile.khatliBoxes.toLocaleString()}</td><td className="py-3 px-4 text-center"><span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded-full font-bold text-sm">{tile.totalBoxes.toLocaleString()}</span></td></tr>))}</tbody>
                                        <tfoot><tr className="bg-foreground dark:bg-dark-foreground font-bold"><td className="py-3 px-4 text-text dark:text-dark-text">Total</td><td className="py-3 px-4 text-center text-green-600 dark:text-green-400">{totalPallets}</td><td className="py-3 px-4 text-center text-green-600 dark:text-green-400">{tileAggregation.reduce((sum, t) => sum + t.palletBoxes, 0).toLocaleString()}</td><td className="py-3 px-4 text-center text-purple-600 dark:text-purple-400">{totalKhatlis}</td><td className="py-3 px-4 text-center text-purple-600 dark:text-purple-400">{tileAggregation.reduce((sum, t) => sum + t.khatliBoxes, 0).toLocaleString()}</td><td className="py-3 px-4 text-center text-orange-600 dark:text-orange-400">{totalBoxes.toLocaleString()}</td></tr></tfoot>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* Factory-wise Summary */}
                        {factorySummary.length > 0 && (
                            <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
                                <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2"><Warehouse size={20} className="text-primary" />Factory-wise Summary</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {factorySummary.map((factory, index) => (
                                        <div key={index} className="bg-foreground dark:bg-dark-foreground rounded-lg p-4 border border-border dark:border-dark-border">
                                            <h4 className="font-bold text-text dark:text-dark-text flex items-center gap-2 mb-3"><Warehouse size={16} className="text-primary" />{factory.factoryName}</h4>
                                            <div className="grid grid-cols-4 gap-2 text-sm">
                                                <div className="text-center p-2 bg-blue-50 dark:bg-blue-900/20 rounded"><p className="text-blue-600 dark:text-blue-400 font-bold">{factory.containerCount}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Containers</p></div>
                                                <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded"><p className="text-green-600 dark:text-green-400 font-bold">{factory.palletCount}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Pallets</p></div>
                                                <div className="text-center p-2 bg-purple-50 dark:bg-purple-900/20 rounded"><p className="text-purple-600 dark:text-purple-400 font-bold">{factory.khatliCount}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Khatlis</p></div>
                                                <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded"><p className="text-orange-600 dark:text-orange-400 font-bold">{factory.totalBoxes.toLocaleString()}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">Boxes</p></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Containers List */}
                        <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
                            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4 flex items-center gap-2"><Package size={20} className="text-primary" />Containers ({totalContainers})</h3>
                            <div className="space-y-3">
                                {dispatch.containers?.map((container, index) => {
                                    const isExpanded = expandedContainers[container.containerId || index];
                                    const containerPallets = container.items?.filter((i) => i.itemType === 'Pallet').length || 0;
                                    const containerKhatlis = container.items?.filter((i) => i.itemType === 'Khatli').length || 0;
                                    const containerBoxes = container.totalBoxes || container.items?.reduce((sum, i) => sum + (i.boxCount || 0) * (i.quantity || 1), 0) || 0;
                                    const itemsByTile = {};
                                    container.items?.forEach((item) => { const key = `${item.tileName}-${item.itemType}-${item.boxCount}`; if (!itemsByTile[key]) itemsByTile[key] = { tileName: item.tileName, itemType: item.itemType, boxCount: item.boxCount, count: 0 }; itemsByTile[key].count += item.quantity || 1; });
                                    return (
                                        <div key={container.containerId || index} className="border border-border dark:border-dark-border rounded-lg overflow-hidden">
                                            <div className="flex items-center justify-between p-4 bg-foreground dark:bg-dark-foreground cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" onClick={() => toggleContainer(container.containerId || index)}>
                                                <div className="flex items-center gap-4"><div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg"><Package size={20} className="text-blue-600 dark:text-blue-400" /></div><div><h4 className="font-bold text-text dark:text-dark-text">{container.containerNumber || 'N/A'}</h4><div className="flex items-center gap-3 text-sm text-text-secondary dark:text-dark-text-secondary"><span className="flex items-center gap-1"><Truck size={14} />{container.truckNumber || 'N/A'}</span><span className="flex items-center gap-1"><Warehouse size={14} />{container.factoryName || 'Unknown'}</span></div></div></div>
                                                <div className="flex items-center gap-4"><div className="flex gap-3 text-sm"><span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded font-medium">{containerPallets}P</span><span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded font-medium">{containerKhatlis}K</span><span className="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 rounded font-medium">{containerBoxes} boxes</span></div>{isExpanded ? <ChevronUp size={20} className="text-text-secondary" /> : <ChevronDown size={20} className="text-text-secondary" />}</div>
                                            </div>
                                            {isExpanded && (<div className="p-4 border-t border-border dark:border-dark-border bg-gray-50 dark:bg-gray-900/30"><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{Object.values(itemsByTile).map((item, itemIndex) => (<div key={itemIndex} className={`p-3 rounded-lg border ${item.itemType === 'Pallet' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'}`}><div className="flex justify-between items-start mb-2"><p className="font-semibold text-text dark:text-dark-text text-sm">{item.tileName}</p><span className={`px-2 py-0.5 text-xs font-bold rounded ${item.itemType === 'Pallet' ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' : 'bg-purple-200 dark:bg-purple-800 text-purple-800 dark:text-purple-200'}`}>{item.itemType}</span></div><div className="flex justify-between text-sm"><span className="text-text-secondary dark:text-dark-text-secondary">{item.boxCount} boxes × {item.count}</span><span className="font-bold text-text dark:text-dark-text">= {item.boxCount * item.count} boxes</span></div></div>))}</div></div>)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Status History */}
                        {dispatch.statusHistory && dispatch.statusHistory.length > 0 && (
                            <div className="bg-background dark:bg-dark-background rounded-xl p-5 border border-border dark:border-dark-border">
                                <button onClick={() => setShowStatusHistory(!showStatusHistory)} className="w-full flex items-center justify-between text-lg font-semibold text-text dark:text-dark-text"><span className="flex items-center gap-2"><History size={20} className="text-primary" />Status History ({dispatch.statusHistory.length})</span>{showStatusHistory ? <ChevronUp size={20} /> : <ChevronDown size={20} />}</button>
                                {showStatusHistory && (<div className="mt-4 space-y-3">{[...dispatch.statusHistory].reverse().map((history, index) => (<div key={index} className="flex items-start gap-3 p-3 bg-foreground dark:bg-dark-foreground rounded-lg"><div className={`p-2 rounded-full ${statusConfig[history.status]?.color || 'bg-gray-100 dark:bg-gray-800'}`}>{React.createElement(statusConfig[history.status]?.icon || Clock, { size: 16 })}</div><div className="flex-1"><div className="flex items-center justify-between"><p className="font-semibold text-text dark:text-dark-text">{history.status}</p><p className="text-xs text-text-secondary dark:text-dark-text-secondary">{formatDateTime(history.changedAt)}</p></div>{history.changedBy && <p className="text-sm text-text-secondary dark:text-dark-text-secondary">by {history.changedBy.username || 'Unknown'}</p>}{history.notes && <p className="text-sm text-text dark:text-dark-text mt-1 italic">"{history.notes}"</p>}</div></div>))}</div>)}
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex flex-wrap justify-between items-center gap-3">
                        <div className="flex gap-2">{dispatch.status === 'Pending' && (<button onClick={() => setShowDeleteConfirm(true)} className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors"><Trash2 size={16} />Delete</button>)}</div>
                        <div className="flex gap-2"><button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border transition-colors">Close</button>{nextStatuses.length > 0 && nextStatuses.map((status) => (<button key={status} onClick={() => { setSelectedStatus(status); setShowStatusModal(true); }} className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center gap-2 transition-colors ${status === 'Cancelled' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-primary hover:bg-primary-hover text-white'}`}>{status === 'In Transit' && <Send size={16} />}{(status === 'Delivered' || status === 'Ready' || status === 'Completed') && <CheckCircle2 size={16} />}{status === 'Cancelled' && <XCircle size={16} />}Mark as {status}</button>))}</div>
                    </div>
                </div>
            </div>

            {/* Status Modal */}
            {showStatusModal && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4"><div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-md p-6"><h3 className="text-xl font-bold text-text dark:text-dark-text mb-4">Update Status to "{selectedStatus}"</h3><div className="mb-4"><label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">Notes (Optional)</label><textarea value={statusNotes} onChange={(e) => setStatusNotes(e.target.value)} className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:ring-2 focus:ring-primary focus:border-transparent" rows={3} placeholder="Add any notes..." /></div><div className="flex justify-end gap-3"><button onClick={() => { setShowStatusModal(false); setStatusNotes(''); setSelectedStatus(''); }} className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border">Cancel</button><button onClick={handleStatusUpdate} disabled={isUpdatingStatus} className="px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2">{isUpdatingStatus && <Loader2 size={16} className="animate-spin" />}Confirm</button></div></div></div>)}

            {/* Delete Modal */}
            {showDeleteConfirm && (<div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4"><div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-md p-6"><div className="flex items-center gap-3 mb-4"><div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full"><AlertCircle size={24} className="text-red-600 dark:text-red-400" /></div><h3 className="text-xl font-bold text-text dark:text-dark-text">Delete Dispatch?</h3></div><p className="text-text-secondary dark:text-dark-text-secondary mb-4">This will delete dispatch <strong>{dispatch.dispatchNumber}</strong> and revert all container statuses.</p><div className="mb-4"><label className="block text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-2">Reason for deletion</label><textarea value={deleteReason} onChange={(e) => setDeleteReason(e.target.value)} className="w-full px-3 py-2 border border-border dark:border-dark-border rounded-lg bg-background dark:bg-dark-background text-text dark:text-dark-text focus:ring-2 focus:ring-red-500 focus:border-transparent" rows={2} placeholder="Enter reason..." /></div><div className="flex justify-end gap-3"><button onClick={() => { setShowDeleteConfirm(false); setDeleteReason(''); }} className="px-4 py-2 text-sm font-semibold text-text-secondary dark:text-dark-text-secondary rounded-lg hover:bg-border dark:hover:bg-dark-border">Cancel</button><button onClick={handleDelete} disabled={isDeleting} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">{isDeleting && <Loader2 size={16} className="animate-spin" />}Delete Dispatch</button></div></div></div>)}
        </>
    );
};

export default DispatchDetailModal;