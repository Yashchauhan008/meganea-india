import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getLoadingPlans } from '../api/loadingPlanApi';
import LoadingPlanDetailModal from '../components/loading-plans/LoadingPlanDetailModal';
import { Loader2, PlusCircle, FileText, Search, Eye, Warehouse, Truck, Package, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import useDebounce from '../hooks/useDebounce';

const LoadingPlanListPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const { data } = await getLoadingPlans();
            setPlans(data);
        } catch (err) {
            setError('Failed to fetch loading plans.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleViewDetails = (planId) => {
        setSelectedPlanId(planId);
        setIsModalOpen(true);
    };
    
    // Add a handler to refresh the list after a delete
    const handleCloseModalAndRefresh = () => {
        setIsModalOpen(false);
        setSelectedPlanId(null);
        fetchPlans(); // Re-fetch the data
    };

    const filteredPlans = useMemo(() => {
        if (!plans) return [];
        return plans.filter(plan => 
            (plan.loadingPlanId?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase()) ||
            (plan.factory?.name?.toLowerCase() || '').includes(debouncedSearchTerm.toLowerCase())
        );
    }, [plans, debouncedSearchTerm]);

    const getStatusInfo = (status) => {
        switch (status) {
            case 'Finalized':
                return { text: 'Finalized', color: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' };
            default:
                return { text: 'Unknown', color: 'text-gray-500', dot: 'bg-gray-400' };
        }
    };

    return (
        <>
            {isModalOpen && <LoadingPlanDetailModal planId={selectedPlanId} onClose={handleCloseModalAndRefresh} />}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text dark:text-dark-text">Loading Plans</h1>
                <Link
                    to="/loading-plans/new"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md hover:bg-primary-hover shadow-sm w-full sm:w-auto"
                >
                    <PlusCircle size={16} /> Create New Plan
                </Link>
            </div>

            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={20} />
                    <input
                        type="text"
                        placeholder="Search by Plan ID or Factory..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input w-full max-w-sm pl-10"
                    />
                </div>
            </div>

            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredPlans.map(plan => {
                        const statusInfo = getStatusInfo(plan.status);
                        const totalPallets = plan.containers?.reduce((sum, container) => sum + (container.pallets?.length || 0), 0) || 0;

                        return (
                            <div key={plan._id} className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-sm flex flex-col transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                                <div className="p-5 border-b border-border dark:border-dark-border">
                                    <div className="flex justify-between items-start">
                                        <p className="font-mono text-lg font-bold text-primary dark:text-dark-primary">{plan.loadingPlanId}</p>
                                        <div className="flex items-center gap-2 text-xs font-semibold">
                                            <span className={`w-2 h-2 rounded-full ${statusInfo.dot}`}></span>
                                            <span className={statusInfo.color}>{statusInfo.text}</span>
                                        </div>
                                    </div>
                                    {/* --- UPDATE: Show loadingDate --- */}
                                    <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-1 flex items-center gap-1.5">
                                        <Calendar size={14}/> Loading Date: {plan.loadingDate ? format(new Date(plan.loadingDate), 'dd MMM, yyyy') : 'N/A'}
                                    </p>
                                </div>
                                <div className="p-5 flex-grow">
                                    <div className="mb-4">
                                        <div className="text-xs text-text-secondary mb-1">Factory</div>
                                        <div className="flex items-center gap-2 font-semibold text-text dark:text-dark-text">
                                            <Warehouse size={16} className="text-text-secondary"/>
                                            {plan.factory?.name || 'N/A'}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 text-center">
                                        <div>
                                            <div className="text-xs text-text-secondary">Containers</div>
                                            <div className="flex items-center justify-center gap-2 text-xl font-bold text-text dark:text-dark-text">
                                                <Truck size={20}/>
                                                {plan.containers?.length || 0}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-text-secondary">Total Pallets</div>
                                            <div className="flex items-center justify-center gap-2 text-xl font-bold text-text dark:text-dark-text">
                                                <Package size={20}/>
                                                {totalPallets}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="p-3 bg-background/50 dark:bg-dark-background/30 border-t border-border dark:border-dark-border">
                                    <button onClick={() => handleViewDetails(plan._id)} className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-primary dark:text-dark-primary hover:bg-primary/10 dark:hover:bg-dark-primary/10 py-2 rounded-md">
                                        <Eye size={16} /> View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </>
    );
};

export default LoadingPlanListPage;
