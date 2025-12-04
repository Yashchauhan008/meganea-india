import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getLoadingPlans } from '../api/loadingPlanApi';
import { Loader2, PlusCircle, FileText, Truck, Warehouse } from 'lucide-react';

const LoadingPlanPage = () => {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);
                const { data } = await getLoadingPlans();
                setPlans(data);
            } catch (err) {
                setError('Failed to fetch loading plans.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    // The root element is a React Fragment (<>) so that the parent
    // SidebarLayout can control the padding of the page.
    return (
        <>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-text dark:text-dark-text">Loading Plans</h1>
                <Link
                    to="/loading-plans/new"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-primary text-white rounded-md hover:bg-primary-hover shadow-sm"
                >
                    <PlusCircle size={16} /> Create New Plan
                </Link>
            </div>

            {/* Show a loading spinner while fetching data */}
            {loading && (
                <div className="text-center p-12">
                    <Loader2 size={48} className="mx-auto animate-spin text-primary" />
                    <p className="mt-2 text-text-secondary">Loading plans...</p>
                </div>
            )}

            {/* Show an error message if the API call fails */}
            {error && <div className="p-6 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>}

            {/* Show the content only when not loading and no errors */}
            {!loading && !error && (
                <div className="space-y-4">
                    {/* Show a message if there are no plans */}
                    {plans.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-lg">
                            <FileText size={48} className="mx-auto text-text-secondary/50" />
                            <h3 className="mt-4 text-lg font-semibold">No Loading Plans Found</h3>
                            <p className="text-text-secondary mt-1 text-sm">
                                Click "Create New Plan" to start the containerization process.
                            </p>
                        </div>
                    ) : (
                        // Display the list of plans in a grid
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                            {plans.map(plan => (
                                <div key={plan._id} className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-md hover:shadow-lg transition-shadow duration-300">
                                    <div className="p-4 border-b border-border dark:border-dark-border">
                                        <div className="flex justify-between items-center">
                                            <p className="font-bold text-lg text-primary">{plan.loadingPlanId}</p>
                                            <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">{plan.status}</span>
                                        </div>
                                        <p className="text-sm text-text-secondary mt-1">
                                            {new Date(plan.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <Warehouse size={16} className="text-text-secondary" />
                                            <span className="font-semibold">Factory:</span>
                                            <span>{plan.factory?.name || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <Truck size={16} className="text-text-secondary" />
                                            <span className="font-semibold">Containers:</span>
                                            <span>{plan.containers?.length || 0}</span>
                                        </div>
                                    </div>
                                    <div className="p-4 border-t border-border dark:border-dark-border">
                                        <p className="text-xs text-text-secondary">Created by: {plan.createdBy?.name || 'Unknown User'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </>
    );
};

export default LoadingPlanPage;
