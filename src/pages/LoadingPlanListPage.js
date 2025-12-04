import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getLoadingPlans } from '../api/loadingPlanApi';
import LoadingPlanDetailModal from '../components/loading-plans/LoadingPlanDetailModal'; // Import the modal
import { Loader2, PlusCircle, FileText, Search, Eye } from 'lucide-react';
import { format } from 'date-fns';
import useDebounce from '../hooks/useDebounce';

const LoadingPlanListPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState(null);

    // State for search
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
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
        fetchPlans();
    }, []);

    const handleViewDetails = (planId) => {
        setSelectedPlanId(planId);
        setIsModalOpen(true);
    };

    const filteredPlans = useMemo(() => {
        return plans.filter(plan => 
            plan.loadingPlanId.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
            plan.factory?.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
        );
    }, [plans, debouncedSearchTerm]);

    return (
        <>
            {isModalOpen && <LoadingPlanDetailModal planId={selectedPlanId} onClose={() => setIsModalOpen(false)} />}

            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text dark:text-dark-text">Loading Plans</h1>
                <Link
                    to="/loading-plans/new"
                    className="flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md hover:bg-primary-hover shadow-sm w-full sm:w-auto"
                >
                    <PlusCircle size={16} /> Create New Plan
                </Link>
            </div>

            <div className="mb-4">
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

            {loading && <div className="text-center p-12"><Loader2 size={48} className="mx-auto animate-spin text-primary" /></div>}
            {error && <div className="p-6 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>}

            {!loading && !error && (
                <div className="bg-foreground dark:bg-dark-foreground rounded-lg shadow-md border border-border dark:border-dark-border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-background dark:bg-dark-background text-xs text-text-secondary uppercase">
                                <tr>
                                    <th scope="col" className="px-6 py-3">Plan ID</th>
                                    <th scope="col" className="px-6 py-3">Factory</th>
                                    <th scope="col" className="px-6 py-3">Date</th>
                                    <th scope="col" className="px-6 py-3">Containers</th>
                                    <th scope="col" className="px-6 py-3">Status</th>
                                    <th scope="col" className="px-6 py-3"><span className="sr-only">Actions</span></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPlans.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center py-16">
                                            <FileText size={48} className="mx-auto text-text-secondary/50" />
                                            <h3 className="mt-4 text-lg font-semibold">No Loading Plans Found</h3>
                                            <p className="text-text-secondary mt-1 text-sm">Your search returned no results.</p>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPlans.map(plan => (
                                        <tr key={plan._id} className="border-b border-border dark:border-dark-border hover:bg-background/50 dark:hover:bg-dark-background/50">
                                            <td className="px-6 py-4 font-mono font-bold text-primary">{plan.loadingPlanId}</td>
                                            <td className="px-6 py-4 text-text dark:text-dark-text">{plan.factory?.name || 'N/A'}</td>
                                            <td className="px-6 py-4 text-text-secondary">{format(new Date(plan.createdAt), 'dd MMM, yyyy')}</td>
                                            <td className="px-6 py-4 font-medium text-text dark:text-dark-text">{plan.containers?.length || 0}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">{plan.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button onClick={() => handleViewDetails(plan._id)} className="p-2 rounded-md hover:bg-primary/10 text-primary">
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </>
    );
};

export default LoadingPlanListPage;
