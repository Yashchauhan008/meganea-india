import React, { useState, useEffect, useCallback } from 'react';
import { getAllFactories, deleteFactory } from '../api/factoryApi';
import FactoryFormModal from '../components/factories/FactoryFormModal';
import { PlusCircle, Edit, Trash2, MapPin, User, Building2 } from 'lucide-react';
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
            const { data } = await getAllFactories();
            setFactories(data);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch factories.');
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

    return (
        <div className="p-4 sm:p-6 md:p-8">
            {isModalOpen && <FactoryFormModal factory={editingFactory} onClose={() => setIsModalOpen(false)} onSave={fetchFactories} />}
            
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-text dark:text-dark-text">Factories</h1>
                <button onClick={handleAdd} className="flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover shadow-sm w-full sm:w-auto">
                    <PlusCircle size={20} className="mr-2" /> Add Factory
                </button>
            </div>

            {loading && <div className="text-center p-8 text-text dark:text-dark-text">Loading factories...</div>}
            {error && <div className="p-6 text-center text-red-500 bg-red-100 dark:bg-red-900/20 rounded-lg"><h2 className="font-bold text-lg">An Error Occurred</h2><p>{error}</p></div>}
            
            {!loading && !error && (
                <>
                    {factories.length === 0 ? (
                        <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-lg">
                            <Building2 size={48} className="mx-auto text-text-secondary/50 dark:text-dark-text-secondary/50" />
                            <h3 className="mt-4 text-lg font-semibold text-text dark:text-dark-text">No Factories Found</h3>
                            <p className="text-text-secondary dark:text-dark-text-secondary mt-1 text-sm">Click "Add Factory" to get started.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {factories.map((factory) => (
                                <div key={factory._id} className="bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-xl shadow-md p-5 flex flex-col justify-between transition-shadow hover:shadow-lg">
                                    <div>
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="font-bold text-lg text-text dark:text-dark-text">{factory.name}</h3>
                                            {isAdmin && (
                                                <div className="flex space-x-1">
                                                    {/* THIS IS THE FIX: Using theme-aware hover colors */}
                                                    <button onClick={() => handleEdit(factory)} className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-primary dark:hover:text-dark-primary"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(factory._id)} className="p-2 text-text-secondary dark:text-dark-text-secondary hover:text-red-500"><Trash2 size={16} /></button>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-2 text-sm text-text-secondary dark:text-dark-text-secondary">
                                            {factory.contactPerson && <p className="flex items-center gap-2"><User size={14} /> {factory.contactPerson}</p>}
                                            {factory.address && <p className="flex items-center gap-2"><MapPin size={14} /> {factory.address}</p>}
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
