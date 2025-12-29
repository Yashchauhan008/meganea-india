
// import React, { useState, useEffect, useMemo } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getAllFactories } from '../api/factoryApi';
// import { createLoadingPlan } from '../api/loadingPlanApi';
// import PalletSelectionModal from '../components/loading-plans/PalletSelectionModal';
// import { Trash2, Plus, Package, Box, Ruler } from 'lucide-react';
// import Label from '../components/ui/Label';
// import Input from '../components/ui/Input';
// import Select from '../components/ui/Select';

// const CreateLoadingPlanPage = () => {
//     const navigate = useNavigate();
//     const [factories, setFactories] = useState([]);
//     const [selectedFactory, setSelectedFactory] = useState('');
//     const [containers, setContainers] = useState([]);
//     const [showPalletModal, setShowPalletModal] = useState(false);
//     const [selectedContainerIndex, setSelectedContainerIndex] = useState(null);
//     const [error, setError] = useState('');
//     const [isLoading, setIsLoading] = useState(false);

//     // This functionality is IDENTICAL to your original code.
//     useEffect(() => {
//         const fetchFactories = async () => {
//             try {
//                 const { data } = await getAllFactories();
//                 const factoriesArray = Array.isArray(data) ? data : data.data || data.factories || [];
//                 setFactories(factoriesArray);
//                 if (factoriesArray.length > 0) {
//                     setSelectedFactory(factoriesArray[0]._id);
//                 }
//             } catch (err) {
//                 setError('Failed to load factories');
//                 console.error(err);
//             }
//         };
//         fetchFactories();
//     }, []);

//     // These functions are IDENTICAL to your original code.
//     const addContainer = () => {
//         setContainers([...containers, { id: Date.now(), containerNumber: '', truckNumber: '', pallets: [] }]);
//     };

//     const removeContainer = (index) => {
//         setContainers(containers.filter((_, i) => i !== index));
//     };

//     const updateContainer = (index, field, value) => {
//         const updated = [...containers];
//         updated[index][field] = value;
//         setContainers(updated);
//     };

//     // This is the handler for opening the modal. IDENTICAL to your original code.
//     const handleAddPallets = (containerIndex) => {
//         setSelectedContainerIndex(containerIndex);
//         setShowPalletModal(true);
//     };

//     // This handler now receives the full pallet objects from the new modal. IDENTICAL logic.
//     const handlePalletSelect = (selectedPallets) => {
//         if (selectedContainerIndex !== null) {
//             const updated = [...containers];
//             updated[selectedContainerIndex].pallets = selectedPallets;
//             setContainers(updated);
//         }
//         setShowPalletModal(false);
//         setSelectedContainerIndex(null);
//     };

//     // The form submission logic is IDENTICAL to your original code.
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setError('');
//         if (!selectedFactory) { setError('You must select a factory.'); return; }
//         if (containers.length === 0) { setError('You must add at least one container.'); return; }
//         for (const c of containers) {
//             if (!c.containerNumber.trim() || !c.truckNumber.trim()) { setError(`Container details are missing.`); return; }
//             if (c.pallets.length === 0) { setError(`Container ${c.containerNumber} has no pallets.`); return; }
//         }

//         setIsLoading(true);
//         const planData = {
//             factoryId: selectedFactory,
//             containers: containers.map(c => ({
//                 containerNumber: c.containerNumber,
//                 truckNumber: c.truckNumber,
//                 pallets: c.pallets.map(p => p._id)
//             }))
//         };

//         try {
//             await createLoadingPlan(planData);
//             navigate('/loading-plans');
//         } catch (err) {
//             setError(err.response?.data?.message || 'Failed to create loading plan.');
//         } finally {
//             setIsLoading(false);
//         }
//     };

//     // This helper function is also preserved from your original code.
//     const allSelectedPallets = useMemo(() => {
//         return containers.flatMap(c => c.pallets.map(p => p._id));
//     }, [containers]);

//     // --- NEW IMPROVEMENT: The Aggregated Display Component ---
//     // This component replaces the ugly blue tags with a clean, aggregated summary.
//     const AggregatedPalletDisplay = ({ pallets }) => {
//         const groups = useMemo(() => {
//             const g = {};
//             pallets.forEach(p => {
//                 const key = `${p.tile._id}-${p.boxCount}`;
//                 if (!g[key]) {
//                     g[key] = { tile: p.tile, boxCount: p.boxCount, count: 0 };
//                 }
//                 g[key].count++;
//             });
//             return Object.values(g);
//         }, [pallets]);

//         if (pallets.length === 0) {
//             return <p className="text-sm text-text-secondary text-center py-4">No pallets added yet.</p>;
//         }

//         return (
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
//                 {groups.map((group, index) => (
//                     <div key={index} className="p-2 bg-background dark:bg-dark-background rounded-md border border-border dark:border-dark-border">
//                         <div className="flex justify-between items-start">
//                             <p className="font-semibold text-sm text-text dark:text-dark-text">{group.tile.name}</p>
//                             <span className="text-xs font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5">{group.count}x</span>
//                         </div>
//                         <div className="text-xs text-text-secondary flex justify-between mt-1">
//                             <span><Ruler size={12} className="inline mr-1"/>{group.tile.size}</span>
//                             <span><Box size={12} className="inline mr-1"/>{group.boxCount} boxes</span>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         );
//     };

//     return (
//         <div className="p-4 sm:p-6 md:p-8 space-y-6">
//             {showPalletModal && (
//                 <PalletSelectionModal
//                     isOpen={showPalletModal}
//                     onClose={() => setShowPalletModal(false)}
//                     onSelect={handlePalletSelect}
//                     factoryId={selectedFactory}
//                     currentlySelectedPallets={allSelectedPallets}
//                     currentContainerPallets={selectedContainerIndex !== null ? containers[selectedContainerIndex].pallets : []}
//                 />
//             )}

//             <h1 className="text-3xl font-bold text-text dark:text-dark-text">Create New Loading Plan</h1>

//             <form onSubmit={handleSubmit} className="space-y-6">
//                 <div className="bg-foreground dark:bg-dark-foreground rounded-lg p-6 border border-border dark:border-dark-border">
//                     <h2 className="text-xl font-semibold mb-4 text-text dark:text-dark-text">Plan Details</h2>
//                     <div>
//                         <Label htmlFor="factory">Loading Factory*</Label>
//                         <Select id="factory" value={selectedFactory} onChange={(e) => setSelectedFactory(e.target.value)} disabled={containers.length > 0}>
//                             <option value="" disabled>Select a factory</option>
//                             {factories.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
//                         </Select>
//                         {containers.length > 0 && <p className="text-sm text-text-secondary mt-2">Factory cannot be changed after adding containers.</p>}
//                     </div>
//                 </div>

//                 <div>
//                     <div className="flex justify-between items-center mb-4">
//                         <h2 className="text-xl font-semibold text-text dark:text-dark-text">Containers</h2>
//                         <button type="button" onClick={addContainer} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold">
//                             <Plus size={16} /> Add Container
//                         </button>
//                     </div>
//                     <div className="space-y-4">
//                         {containers.map((container, index) => (
//                             <div key={container.id} className="bg-foreground dark:bg-dark-foreground rounded-lg p-6 border border-border dark:border-dark-border">
//                                 <div className="flex justify-between items-center mb-4">
//                                     <h3 className="text-lg font-semibold text-primary dark:text-dark-primary">Container #{index + 1}</h3>
//                                     <button type="button" onClick={() => removeContainer(index)} className="text-red-500 hover:text-red-400"><Trash2 size={20} /></button>
//                                 </div>
//                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                                     <div>
//                                         <Label htmlFor={`cn-${index}`}>Container Number*</Label>
//                                         <Input id={`cn-${index}`} type="text" value={container.containerNumber} onChange={(e) => updateContainer(index, 'containerNumber', e.target.value.toUpperCase())} />
//                                     </div>
//                                     <div>
//                                         <Label htmlFor={`tn-${index}`}>Truck Number*</Label>
//                                         <Input id={`tn-${index}`} type="text" value={container.truckNumber} onChange={(e) => updateContainer(index, 'truckNumber', e.target.value.toUpperCase())} />
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <Label>Pallets ({container.pallets.length})</Label>
//                                     <div className="p-4 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border">
//                                         {/* This now uses the new, clean display component */}
//                                         <AggregatedPalletDisplay pallets={container.pallets} />
//                                     </div>
//                                     <button type="button" onClick={() => handleAddPallets(index)} className="text-sm font-semibold text-primary dark:text-dark-primary hover:underline mt-2">
//                                         Manage Pallets
//                                     </button>
//                                 </div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>

//                 {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

//                 <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-dark-border">
//                     <button type="button" onClick={() => navigate('/loading-plans')} className="px-6 py-2 rounded-md bg-gray-200 dark:bg-dark-border text-text dark:text-dark-text font-semibold">Cancel</button>
//                     <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-md bg-green-600 text-white font-semibold disabled:opacity-50">
//                         {isLoading ? 'Finalizing...' : 'Finalize Loading Plan'}
//                     </button>
//                 </div>
//             </form>
//         </div>
//     );
// };

// export default CreateLoadingPlanPage;
// FILE LOCATION: src/pages/CreateLoadingPlanPage.js

import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllFactories } from '../api/factoryApi';
import { createLoadingPlan } from '../api/loadingPlanApi';
import PalletSelectionModal from '../components/loading-plans/PalletSelectionModal';
import { Trash2, Plus, Box, Ruler, Loader2, AlertCircle, Package, Boxes, ChevronLeft } from 'lucide-react';
import Label from '../components/ui/Label';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';

const CreateLoadingPlanPage = () => {
    const navigate = useNavigate();
    const [factories, setFactories] = useState([]);
    const [selectedFactory, setSelectedFactory] = useState('');
    const [containers, setContainers] = useState([]);
    const [showPalletModal, setShowPalletModal] = useState(false);
    const [selectedContainerIndex, setSelectedContainerIndex] = useState(null);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [factoriesLoading, setFactoriesLoading] = useState(true);

    // Fetch factories with proper response handling
    useEffect(() => {
        const fetchFactories = async () => {
            setFactoriesLoading(true);
            setError('');
            try {
                const response = await getAllFactories();
                // Handle various response structures
                const data = response?.data || response;
                const factoriesArray = Array.isArray(data) ? data : data?.data || data?.factories || [];
                
                setFactories(factoriesArray);
                if (factoriesArray.length > 0) {
                    setSelectedFactory(factoriesArray[0]._id);
                }
            } catch (err) {
                console.error('Failed to load factories:', err);
                setError('Failed to load factories. Please refresh the page.');
            } finally {
                setFactoriesLoading(false);
            }
        };
        fetchFactories();
    }, []);

    const addContainer = () => {
        setContainers([...containers, { 
            id: Date.now(), 
            containerNumber: '', 
            truckNumber: '', 
            pallets: [] 
        }]);
    };

    const removeContainer = (index) => {
        setContainers(containers.filter((_, i) => i !== index));
    };

    const updateContainer = (index, field, value) => {
        const updated = [...containers];
        updated[index][field] = value;
        setContainers(updated);
    };

    const handleAddPallets = (containerIndex) => {
        setSelectedContainerIndex(containerIndex);
        setShowPalletModal(true);
    };

    const handlePalletSelect = (selectedPallets) => {
        if (selectedContainerIndex !== null) {
            const updated = [...containers];
            updated[selectedContainerIndex].pallets = selectedPallets;
            setContainers(updated);
        }
        setShowPalletModal(false);
        setSelectedContainerIndex(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!selectedFactory) {
            setError('You must select a factory.');
            return;
        }
        if (containers.length === 0) {
            setError('You must add at least one container.');
            return;
        }

        for (const c of containers) {
            if (!c.containerNumber.trim() || !c.truckNumber.trim()) {
                setError('Container details are missing. Please enter both container and truck numbers.');
                return;
            }
            if (c.pallets.length === 0) {
                setError(`Container ${c.containerNumber || '#' + (containers.indexOf(c) + 1)} has no pallets added.`);
                return;
            }
        }

        setIsLoading(true);
        const planData = {
            factoryId: selectedFactory,
            containers: containers.map(c => ({
                containerNumber: c.containerNumber,
                truckNumber: c.truckNumber,
                pallets: c.pallets.map(p => p._id)
            }))
        };

        try {
            await createLoadingPlan(planData);
            navigate('/loading-plans');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create loading plan.');
        } finally {
            setIsLoading(false);
        }
    };

    const allSelectedPallets = useMemo(() => {
        return containers.flatMap(c => c.pallets.map(p => p._id));
    }, [containers]);

    // Calculate totals
    const totals = useMemo(() => {
        let totalPallets = 0;
        let totalBoxes = 0;
        containers.forEach(c => {
            totalPallets += c.pallets.length;
            c.pallets.forEach(p => {
                totalBoxes += p.boxCount || 0;
            });
        });
        return { pallets: totalPallets, boxes: totalBoxes };
    }, [containers]);

    // Aggregated Pallet Display Component
    const AggregatedPalletDisplay = ({ pallets }) => {
        const groups = useMemo(() => {
            const g = {};
            pallets.forEach(p => {
                if (!p?.tile) return;
                const key = `${p.tile._id}-${p.boxCount}`;
                if (!g[key]) {
                    g[key] = { tile: p.tile, boxCount: p.boxCount, count: 0 };
                }
                g[key].count++;
            });
            return Object.values(g);
        }, [pallets]);

        if (pallets.length === 0) {
            return (
                <div className="text-center py-6 text-text-secondary dark:text-dark-text-secondary">
                    <Package size={32} className="mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No pallets added yet.</p>
                    <p className="text-xs">Click "Manage Pallets" to add pallets to this container.</p>
                </div>
            );
        }

        return (
            <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {groups.map((group, index) => (
                        <div key={index} className="p-3 bg-foreground dark:bg-dark-foreground rounded-lg border border-border dark:border-dark-border">
                            <div className="flex justify-between items-start mb-1">
                                <p className="font-semibold text-sm text-text dark:text-dark-text truncate pr-2">
                                    {group.tile?.name || 'Unknown Tile'}
                                </p>
                                <span className="text-xs font-bold bg-primary/20 text-primary rounded-full px-2 py-0.5 whitespace-nowrap">
                                    {group.count}x
                                </span>
                            </div>
                            <div className="text-xs text-text-secondary dark:text-dark-text-secondary flex justify-between">
                                <span className="flex items-center gap-1">
                                    <Ruler size={12} />{group.tile?.size || 'N/A'}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Box size={12} />{group.boxCount} boxes
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="text-right text-sm text-text-secondary dark:text-dark-text-secondary">
                    Total: <span className="font-semibold text-text dark:text-dark-text">{pallets.length} pallets</span>, 
                    <span className="font-semibold text-text dark:text-dark-text ml-1">
                        {pallets.reduce((sum, p) => sum + (p.boxCount || 0), 0)} boxes
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
            {/* Pallet Selection Modal */}
            {showPalletModal && (
                <PalletSelectionModal
                    isOpen={showPalletModal}
                    onClose={() => setShowPalletModal(false)}
                    onSelect={handlePalletSelect}
                    factoryId={selectedFactory}
                    currentlySelectedPallets={allSelectedPallets}
                    currentContainerPallets={selectedContainerIndex !== null ? containers[selectedContainerIndex].pallets : []}
                />
            )}

            {/* Header */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => navigate('/loading-plans')} 
                    className="p-2 rounded-lg hover:bg-background dark:hover:bg-dark-background transition-colors"
                >
                    <ChevronLeft size={24} className="text-text dark:text-dark-text" />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-text dark:text-dark-text">Create New Loading Plan</h1>
                    <p className="text-text-secondary dark:text-dark-text-secondary">
                        Add containers and assign pallets to create a loading plan
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Plan Details */}
                <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-6 border border-border dark:border-dark-border">
                    <h2 className="text-xl font-semibold mb-4 text-text dark:text-dark-text">Plan Details</h2>
                    <div>
                        <Label htmlFor="factory">Loading Factory*</Label>
                        {factoriesLoading ? (
                            <div className="flex items-center gap-2 py-3 text-text-secondary">
                                <Loader2 size={16} className="animate-spin" />
                                Loading factories...
                            </div>
                        ) : (
                            <Select 
                                id="factory" 
                                value={selectedFactory} 
                                onChange={(e) => setSelectedFactory(e.target.value)} 
                                disabled={containers.length > 0}
                            >
                                <option value="" disabled>Select a factory</option>
                                {factories.map(f => (
                                    <option key={f._id} value={f._id}>{f.name}</option>
                                ))}
                            </Select>
                        )}
                        {factories.length === 0 && !factoriesLoading && (
                            <p className="text-sm text-red-500 mt-2">No factories found. Please create a factory first.</p>
                        )}
                        {containers.length > 0 && (
                            <p className="text-sm text-text-secondary dark:text-dark-text-secondary mt-2">
                                Factory cannot be changed after adding containers.
                            </p>
                        )}
                    </div>
                </div>

                {/* Containers Section */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-text dark:text-dark-text">Containers</h2>
                            {containers.length > 0 && (
                                <p className="text-sm text-text-secondary dark:text-dark-text-secondary">
                                    {containers.length} container{containers.length > 1 ? 's' : ''} • {totals.pallets} pallets • {totals.boxes} boxes
                                </p>
                            )}
                        </div>
                        <button 
                            type="button" 
                            onClick={addContainer} 
                            disabled={!selectedFactory}
                            className="bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-semibold transition-colors"
                        >
                            <Plus size={16} /> Add Container
                        </button>
                    </div>

                    {containers.length === 0 ? (
                        <div className="bg-foreground dark:bg-dark-foreground rounded-xl p-8 border-2 border-dashed border-border dark:border-dark-border text-center">
                            <Boxes size={48} className="mx-auto text-text-secondary/30 mb-4" />
                            <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-2">No Containers Added</h3>
                            <p className="text-text-secondary dark:text-dark-text-secondary mb-4">
                                {selectedFactory 
                                    ? 'Click "Add Container" to start building your loading plan.'
                                    : 'Select a factory first, then add containers.'}
                            </p>
                            {selectedFactory && (
                                <button 
                                    type="button" 
                                    onClick={addContainer}
                                    className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm font-semibold transition-colors"
                                >
                                    <Plus size={16} /> Add First Container
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {containers.map((container, index) => (
                                <div key={container.id} className="bg-foreground dark:bg-dark-foreground rounded-xl p-6 border border-border dark:border-dark-border">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-lg font-semibold text-primary dark:text-dark-primary">
                                            Container #{index + 1}
                                        </h3>
                                        <button 
                                            type="button" 
                                            onClick={() => removeContainer(index)} 
                                            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            title="Remove container"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <Label htmlFor={`cn-${index}`}>Container Number*</Label>
                                            <Input 
                                                id={`cn-${index}`} 
                                                type="text" 
                                                placeholder="e.g., MSKU1234567"
                                                value={container.containerNumber} 
                                                onChange={(e) => updateContainer(index, 'containerNumber', e.target.value.toUpperCase())} 
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor={`tn-${index}`}>Truck Number*</Label>
                                            <Input 
                                                id={`tn-${index}`} 
                                                type="text" 
                                                placeholder="e.g., GJ05AB1234"
                                                value={container.truckNumber} 
                                                onChange={(e) => updateContainer(index, 'truckNumber', e.target.value.toUpperCase())} 
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <Label>Pallets ({container.pallets.length})</Label>
                                        <div className="p-4 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border">
                                            <AggregatedPalletDisplay pallets={container.pallets} />
                                        </div>
                                        <button 
                                            type="button" 
                                            onClick={() => handleAddPallets(index)} 
                                            className="text-sm font-semibold text-primary dark:text-dark-primary hover:underline mt-3 flex items-center gap-1"
                                        >
                                            <Package size={14} />
                                            Manage Pallets
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Error Display */}
                {error && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg flex items-center gap-3">
                        <AlertCircle size={20} />
                        <span>{error}</span>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-dark-border">
                    <button 
                        type="button" 
                        onClick={() => navigate('/loading-plans')} 
                        className="px-6 py-2.5 rounded-lg bg-gray-200 dark:bg-dark-border text-text dark:text-dark-text font-semibold hover:bg-gray-300 dark:hover:bg-dark-foreground transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        disabled={isLoading || containers.length === 0}
                        className="px-6 py-2.5 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                    >
                        {isLoading && <Loader2 size={16} className="animate-spin" />}
                        {isLoading ? 'Creating...' : 'Finalize Loading Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateLoadingPlanPage;