// FILE LOCATION: src/pages/FactoryPage.js

import React, { useState, useEffect, useCallback } from 'react';
import { getAllFactories, deleteFactory } from '../api/factoryApi';
import FactoryFormModal from '../components/factories/FactoryFormModal';
import { PlusCircle, Edit, Trash2, MapPin, User, Building2, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const FactoryPage = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';

    const [factories, setFactories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingFactory, setEditingFactory] = useState(null);

    const fetchFactories = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getAllFactories();
            // Handle different response structures safely
            const factoriesData = response?.data || response || [];
            setFactories(Array.isArray(factoriesData) ? factoriesData : []);
        } catch (err) {
            console.error('Failed to fetch factories:', err);
            setError(err.response?.data?.message || err.message || 'Failed to fetch factories.');
            setFactories([]); // Ensure factories is always an array
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchFactories();
    }, [fetchFactories]);

    const handleAdd = () => {
        setEditingFactory(null);
        setIsModalOpen(true);
    };

    const handleEdit = (factory) => {
        setEditingFactory(factory);
        setIsModalOpen(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this factory?')) {
            try {
                await deleteFactory(id);
                fetchFactories();
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to delete factory.');
            }
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setEditingFactory(null);
    };

    const handleSave = () => {
        handleModalClose();
        fetchFactories();
    };

    return (
        <div className="p-4 sm:p-6 md:p-8">
            {isModalOpen && (
                <FactoryFormModal 
                    factory={editingFactory} 
                    onClose={handleModalClose} 
                    onSave={handleSave} 
                />
            )}
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text dark:text-dark-text">Factories</h1>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button 
                        onClick={fetchFactories} 
                        disabled={loading}
                        className="flex items-center justify-center px-4 py-2 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-md hover:bg-gray-100 dark:hover:bg-dark-border transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <button 
                        onClick={handleAdd} 
                        className="flex items-center justify-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover shadow-sm flex-1 sm:flex-initial"
                    >
                        <PlusCircle size={20} className="mr-2" /> Add Factory
                    </button>
                </div>
            </div>

            {error && (
                <div className="mb-6 p-4 text-center text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <p className="font-medium">{error}</p>
                    <button 
                        onClick={fetchFactories}
                        className="mt-2 text-sm underline hover:no-underline"
                    >
                        Try again
                    </button>
                </div>
            )}

            {loading && (
                <div className="flex justify-center items-center py-20">
                    <Loader2 size={40} className="animate-spin text-primary" />
                </div>
            )}
            
            {!loading && !error && (
                <>
                    {factories.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-lg bg-foreground dark:bg-dark-foreground">
                            <Building2 size={48} className="mx-auto text-text-secondary/50 dark:text-dark-text-secondary/50" />
                            <h3 className="mt-4 text-lg font-semibold text-text dark:text-dark-text">No Factories Found</h3>
                            <p className="text-text-secondary dark:text-dark-text-secondary mt-1 text-sm">Click "Add Factory" to get started.</p>
                            <button 
                                onClick={handleAdd}
                                className="mt-4 inline-flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover"
                            >
                                <PlusCircle size={18} className="mr-2" /> Add Your First Factory
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {factories.map((factory) => (
                                <div 
                                    key={factory._id || factory.id || Math.random()} 
                                    className="bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-xl shadow-md p-5 flex flex-col justify-between transition-shadow hover:shadow-lg"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-lg text-text dark:text-dark-text">
                                                {factory.name || 'Unnamed Factory'}
                                            </h3>
                                            {isAdmin && (
                                                <div className="flex space-x-1">
                                                    <button 
                                                        onClick={() => handleEdit(factory)} 
                                                        className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-dark-border"
                                                        title="Edit factory"
                                                    >
                                                        <Edit size={16} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(factory._id)} 
                                                        className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        title="Delete factory"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                                            {factory.contactPerson && (
                                                <p className="flex items-center gap-2">
                                                    <User size={14} className="flex-shrink-0" /> 
                                                    <span>{factory.contactPerson}</span>
                                                </p>
                                            )}
                                            {factory.address && (
                                                <p className="flex items-center gap-2">
                                                    <MapPin size={14} className="flex-shrink-0" /> 
                                                    <span>{factory.address}</span>
                                                </p>
                                            )}
                                            {!factory.contactPerson && !factory.address && (
                                                <p className="text-text-secondary/50 dark:text-dark-text-secondary/50 italic">
                                                    No additional details
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FactoryPage;