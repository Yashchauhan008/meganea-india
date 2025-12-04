import React, { useState, useEffect } from 'react';
import { getLoadingPlanById } from '../../api/loadingPlanApi';
// --- THIS IS THE FIX ---
// I've replaced the incorrect 'Pallet' icon with the correct 'Package' icon.
import { Loader2, X, Warehouse, Calendar, User, Truck, Box, Package } from 'lucide-react';
// --- END OF FIX ---

const LoadingPlanDetailModal = ({ planId, onClose }) => {
    const [plan, setPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!planId) return;
        const fetchPlan = async () => {
            setLoading(true);
            try {
                const { data } = await getLoadingPlanById(planId);
                setPlan(data);
            } catch (err) {
                setError('Failed to load loading plan details.');
            } finally {
                setLoading(false);
            }
        };
        fetchPlan();
    }, [planId]);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-5 border-b border-border dark:border-dark-border">
                    <div>
                        <h1 className="text-2xl font-bold text-text dark:text-dark-text">Loading Plan Details</h1>
                        <p className="font-mono text-primary dark:text-dark-primary">{plan?.loadingPlanId || 'Loading...'}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background">
                        <X size={24} className="text-text-secondary" />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    {loading && <div className="flex justify-center items-center h-full"><Loader2 size={32} className="animate-spin text-primary" /></div>}
                    {error && <p className="text-center text-red-500">{error}</p>}
                    
                    {plan && (
                        <div className="space-y-6">
                            {/* Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
                                    <div className="text-sm text-text-secondary flex items-center gap-2"><Warehouse size={14}/> Factory</div>
                                    <div className="text-lg font-bold text-text dark:text-dark-text">{plan.factory?.name}</div>
                                </div>
                                <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
                                    <div className="text-sm text-text-secondary flex items-center gap-2"><Calendar size={14}/> Created</div>
                                    <div className="text-lg font-bold text-text dark:text-dark-text">{new Date(plan.createdAt).toLocaleDateString()}</div>
                                </div>
                                <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
                                    <div className="text-sm text-text-secondary flex items-center gap-2"><User size={14}/> Created By</div>
                                    <div className="text-lg font-bold text-text dark:text-dark-text">{plan.createdBy?.name}</div>
                                </div>
                            </div>

                            {/* Containers Section */}
                            <div>
                                <h2 className="text-xl font-semibold mb-3 text-text dark:text-dark-text">Containers ({plan.containers.length})</h2>
                                <div className="space-y-4">
                                    {plan.containers.map((container) => (
                                        <div key={container._id} className="border border-border dark:border-dark-border rounded-lg">
                                            <div className="p-3 bg-background dark:bg-dark-background rounded-t-lg">
                                                <h3 className="font-bold text-md text-primary flex items-center gap-2"><Truck size={18}/> {container.containerNumber}</h3>
                                                <p className="text-xs text-text-secondary">Truck: {container.truckNumber}</p>
                                            </div>
                                            <div className="p-3">
                                                {/* --- THIS IS THE FIX --- */}
                                                {/* The icon is now 'Package' */}
                                                <h4 className="text-sm font-semibold mb-2 flex items-center gap-2"><Package size={16}/> Pallets ({container.pallets.length})</h4>
                                                {/* --- END OF FIX --- */}
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                                    {container.pallets.map(pallet => (
                                                        <div key={pallet._id} className="p-2 bg-slate-200 dark:bg-slate-700 rounded-md text-center">
                                                            <p className="font-mono text-xs font-semibold text-text dark:text-dark-text">{pallet.palletId}</p>
                                                            <p className="text-xs text-text-secondary truncate" title={pallet.tile?.name}>{pallet.tile?.name || 'N/A'}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoadingPlanDetailModal;
