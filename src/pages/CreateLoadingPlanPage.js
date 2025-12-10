// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { getAllFactories } from '../api/factoryApi';
// import { createLoadingPlan } from '../api/loadingPlanApi';
// import PalletSelectionModal from '../components/loading-plans/PalletSelectionModal';
// import { Trash2, Plus } from 'lucide-react';

// const CreateLoadingPlanPage = () => {
//   const navigate = useNavigate();
//   const [factories, setFactories] = useState([]);
//   const [selectedFactory, setSelectedFactory] = useState('');
//   const [containers, setContainers] = useState([]);
//   const [showPalletModal, setShowPalletModal] = useState(false);
//   const [selectedContainerIndex, setSelectedContainerIndex] = useState(null);
//   const [error, setError] = useState('');
//   const [isLoading, setIsLoading] = useState(false);

//   useEffect(() => {
//     const fetchFactories = async () => {
//       try {
//         const data = await getAllFactories();
//         // Handle both array and object responses
//         const factoriesArray = Array.isArray(data) ? data : data.data || data.factories || [];
//         setFactories(factoriesArray);
//         if (factoriesArray.length > 0) {
//           setSelectedFactory(factoriesArray[0]._id);
//         }
//       } catch (err) {
//         setError('Failed to load factories');
//         console.error(err);
//       }
//     };
//     fetchFactories();
//   }, []);

//   const addContainer = () => {
//     const newContainer = {
//       id: `container_${Date.now()}`,
//       containerNumber: '',
//       truckNumber: '',
//       pallets: []
//     };
//     setContainers([...containers, newContainer]);
//   };

//   const removeContainer = (index) => {
//     setContainers(containers.filter((_, i) => i !== index));
//   };

//   const updateContainer = (index, field, value) => {
//     const updated = [...containers];
//     updated[index][field] = value;
//     setContainers(updated);
//   };

//   const getAllSelectedPallets = () => {
//     const selected = [];
//     containers.forEach((container) => {
//       container.pallets.forEach(pallet => {
//         selected.push(pallet._id);
//       });
//     });
//     return selected;
//   };

//   const handleAddPallets = (containerIndex) => {
//     setSelectedContainerIndex(containerIndex);
//     setShowPalletModal(true);
//   };

//   const handlePalletSelect = (selectedPallets) => {
//     if (selectedContainerIndex !== null) {
//       const updated = [...containers];
//       updated[selectedContainerIndex].pallets = selectedPallets;
//       setContainers(updated);
//       setShowPalletModal(false);
//       setSelectedContainerIndex(null);
//     }
//   };

//   const removePallet = (containerIndex, palletIndex) => {
//     const updated = [...containers];
//     updated[containerIndex].pallets.splice(palletIndex, 1);
//     setContainers(updated);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError('');

//     if (!selectedFactory) {
//       setError('You must select a factory.');
//       return;
//     }
//     if (containers.length === 0) {
//       setError('You must add at least one container.');
//       return;
//     }
//     for (const c of containers) {
//       if (!c.containerNumber.trim() || !c.truckNumber.trim()) {
//         setError(`Container details are missing. Please enter both container and truck numbers.`);
//         return;
//       }
//       if (c.pallets.length === 0) {
//         setError(`Container ${c.containerNumber} has no pallets added.`);
//         return;
//       }
//     }

//     setIsLoading(true);
    
//     const planData = {
//       factoryId: selectedFactory,
//       containers: containers.map((c) => ({
//         containerNumber: c.containerNumber,
//         truckNumber: c.truckNumber,
//         pallets: c.pallets.map(p => p._id)
//       }))
//     };

//     try {
//       await createLoadingPlan(planData);
//       navigate('/loading-plans', { state: { success: true } });
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to create loading plan.');
//       console.error(err);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const allSelectedPallets = getAllSelectedPallets();

//   return (
//     <div className="space-y-6">
//       <h1 className="text-3xl font-bold">Create New Loading Plan</h1>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
//           <h2 className="text-xl font-semibold mb-4">Plan Details</h2>
          
//           <div>
//             <label className="block text-sm font-medium mb-2">Loading Factory*</label>
//             <select
//               value={selectedFactory}
//               onChange={(e) => setSelectedFactory(e.target.value)}
//               disabled={containers.length > 0}
//               className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white disabled:opacity-50"
//             >
//               <option value="">Select a factory</option>
//               {factories && factories.length > 0 && factories.map(factory => (
//                 <option key={factory._id} value={factory._id}>
//                   {factory.name}
//                 </option>
//               ))}
//             </select>
//             {containers.length > 0 && (
//               <p className="text-sm text-gray-400 mt-2">Factory cannot be changed after adding containers.</p>
//             )}
//           </div>
//         </div>

//         <div>
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-xl font-semibold">Containers</h2>
//             <button
//               type="button"
//               onClick={addContainer}
//               className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2"
//             >
//               <Plus size={20} />
//               Add Container
//             </button>
//           </div>

//           <div className="space-y-4">
//             {containers.map((container, index) => (
//               <div key={container.id} className="bg-slate-800 rounded-lg p-6 border border-slate-700">
//                 <div className="flex justify-between items-center mb-4">
//                   <h3 className="text-lg font-semibold text-blue-400">Container #{index + 1}</h3>
//                   <button
//                     type="button"
//                     onClick={() => removeContainer(index)}
//                     className="text-red-500 hover:text-red-700"
//                   >
//                     <Trash2 size={20} />
//                   </button>
//                 </div>

//                 <div className="grid grid-cols-2 gap-4 mb-4">
//                   <div>
//                     <label className="block text-sm font-medium mb-2">Container Number*</label>
//                     <input
//                       type="text"
//                       value={container.containerNumber}
//                       onChange={(e) => updateContainer(index, 'containerNumber', e.target.value.toUpperCase())}
//                       placeholder="e.g., CONT001"
//                       className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-400"
//                     />
//                   </div>
//                   <div>
//                     <label className="block text-sm font-medium mb-2">Truck Number*</label>
//                     <input
//                       type="text"
//                       value={container.truckNumber}
//                       onChange={(e) => updateContainer(index, 'truckNumber', e.target.value.toUpperCase())}
//                       placeholder="e.g., TRUCK001"
//                       className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-400"
//                     />
//                   </div>
//                 </div>

//                 <div>
//                   <h4 className="text-sm font-medium mb-2">Pallets ({container.pallets.length})</h4>
//                   <div className="bg-slate-700 rounded p-4 mb-3 min-h-12">
//                     {container.pallets.length > 0 ? (
//                       <div className="flex flex-wrap gap-2">
//                         {container.pallets.map((pallet, palletIndex) => (
//                           <div
//                             key={pallet._id}
//                             className="bg-blue-600 text-white px-3 py-1 rounded flex items-center gap-2"
//                           >
//                             {pallet.palletId}
//                             <button
//                               type="button"
//                               onClick={() => removePallet(index, palletIndex)}
//                               className="text-white hover:text-red-300"
//                             >
//                               ×
//                             </button>
//                           </div>
//                         ))}
//                       </div>
//                     ) : (
//                       <p className="text-gray-400 text-sm">No pallets added</p>
//                     )}
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => handleAddPallets(index)}
//                     className="text-blue-400 hover:text-blue-300 flex items-center gap-2"
//                   >
//                     <Plus size={16} />
//                     Add/View Pallets
//                   </button>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {error && (
//           <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
//             {error}
//           </div>
//         )}

//         <div className="flex justify-end gap-3">
//           <button
//             type="button"
//             onClick={() => navigate('/loading-plans')}
//             className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={isLoading}
//             className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded disabled:opacity-50"
//           >
//             {isLoading ? 'Creating...' : 'Finalize Loading Plan'}
//           </button>
//         </div>
//       </form>

//       {showPalletModal && (
//         <PalletSelectionModal
//           isOpen={showPalletModal}
//           onClose={() => {
//             setShowPalletModal(false);
//             setSelectedContainerIndex(null);
//           }}
//           onSelect={handlePalletSelect}
//           factoryId={selectedFactory}
//           currentlySelectedPallets={allSelectedPallets}
//           containerIndex={selectedContainerIndex}
//           currentContainerPallets={selectedContainerIndex !== null ? containers[selectedContainerIndex].pallets : []}
//         />
//       )}
//     </div>
//   );
// };

// export default CreateLoadingPlanPage;


import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllFactories } from '../api/factoryApi';
import { createLoadingPlan } from '../api/loadingPlanApi';
import PalletSelectionModal from '../components/loading-plans/PalletSelectionModal';
import { Trash2, Plus, Package, Box, Ruler } from 'lucide-react';
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

    // This functionality is IDENTICAL to your original code.
    useEffect(() => {
        const fetchFactories = async () => {
            try {
                const { data } = await getAllFactories();
                const factoriesArray = Array.isArray(data) ? data : data.data || data.factories || [];
                setFactories(factoriesArray);
                if (factoriesArray.length > 0) {
                    setSelectedFactory(factoriesArray[0]._id);
                }
            } catch (err) {
                setError('Failed to load factories');
                console.error(err);
            }
        };
        fetchFactories();
    }, []);

    // These functions are IDENTICAL to your original code.
    const addContainer = () => {
        setContainers([...containers, { id: Date.now(), containerNumber: '', truckNumber: '', pallets: [] }]);
    };

    const removeContainer = (index) => {
        setContainers(containers.filter((_, i) => i !== index));
    };

    const updateContainer = (index, field, value) => {
        const updated = [...containers];
        updated[index][field] = value;
        setContainers(updated);
    };

    // This is the handler for opening the modal. IDENTICAL to your original code.
    const handleAddPallets = (containerIndex) => {
        setSelectedContainerIndex(containerIndex);
        setShowPalletModal(true);
    };

    // This handler now receives the full pallet objects from the new modal. IDENTICAL logic.
    const handlePalletSelect = (selectedPallets) => {
        if (selectedContainerIndex !== null) {
            const updated = [...containers];
            updated[selectedContainerIndex].pallets = selectedPallets;
            setContainers(updated);
        }
        setShowPalletModal(false);
        setSelectedContainerIndex(null);
    };

    // The form submission logic is IDENTICAL to your original code.
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!selectedFactory) { setError('You must select a factory.'); return; }
        if (containers.length === 0) { setError('You must add at least one container.'); return; }
        for (const c of containers) {
            if (!c.containerNumber.trim() || !c.truckNumber.trim()) { setError(`Container details are missing.`); return; }
            if (c.pallets.length === 0) { setError(`Container ${c.containerNumber} has no pallets.`); return; }
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

    // This helper function is also preserved from your original code.
    const allSelectedPallets = useMemo(() => {
        return containers.flatMap(c => c.pallets.map(p => p._id));
    }, [containers]);

    // --- NEW IMPROVEMENT: The Aggregated Display Component ---
    // This component replaces the ugly blue tags with a clean, aggregated summary.
    const AggregatedPalletDisplay = ({ pallets }) => {
        const groups = useMemo(() => {
            const g = {};
            pallets.forEach(p => {
                const key = `${p.tile._id}-${p.boxCount}`;
                if (!g[key]) {
                    g[key] = { tile: p.tile, boxCount: p.boxCount, count: 0 };
                }
                g[key].count++;
            });
            return Object.values(g);
        }, [pallets]);

        if (pallets.length === 0) {
            return <p className="text-sm text-text-secondary text-center py-4">No pallets added yet.</p>;
        }

        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {groups.map((group, index) => (
                    <div key={index} className="p-2 bg-background dark:bg-dark-background rounded-md border border-border dark:border-dark-border">
                        <div className="flex justify-between items-start">
                            <p className="font-semibold text-sm text-text dark:text-dark-text">{group.tile.name}</p>
                            <span className="text-xs font-bold bg-primary/10 text-primary rounded-full px-2 py-0.5">{group.count}x</span>
                        </div>
                        <div className="text-xs text-text-secondary flex justify-between mt-1">
                            <span><Ruler size={12} className="inline mr-1"/>{group.tile.size}</span>
                            <span><Box size={12} className="inline mr-1"/>{group.boxCount} boxes</span>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6">
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

            <h1 className="text-3xl font-bold text-text dark:text-dark-text">Create New Loading Plan</h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-foreground dark:bg-dark-foreground rounded-lg p-6 border border-border dark:border-dark-border">
                    <h2 className="text-xl font-semibold mb-4 text-text dark:text-dark-text">Plan Details</h2>
                    <div>
                        <Label htmlFor="factory">Loading Factory*</Label>
                        <Select id="factory" value={selectedFactory} onChange={(e) => setSelectedFactory(e.target.value)} disabled={containers.length > 0}>
                            <option value="" disabled>Select a factory</option>
                            {factories.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                        </Select>
                        {containers.length > 0 && <p className="text-sm text-text-secondary mt-2">Factory cannot be changed after adding containers.</p>}
                    </div>
                </div>

                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold text-text dark:text-dark-text">Containers</h2>
                        <button type="button" onClick={addContainer} className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-md flex items-center gap-2 text-sm font-semibold">
                            <Plus size={16} /> Add Container
                        </button>
                    </div>
                    <div className="space-y-4">
                        {containers.map((container, index) => (
                            <div key={container.id} className="bg-foreground dark:bg-dark-foreground rounded-lg p-6 border border-border dark:border-dark-border">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold text-primary dark:text-dark-primary">Container #{index + 1}</h3>
                                    <button type="button" onClick={() => removeContainer(index)} className="text-red-500 hover:text-red-400"><Trash2 size={20} /></button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div>
                                        <Label htmlFor={`cn-${index}`}>Container Number*</Label>
                                        <Input id={`cn-${index}`} type="text" value={container.containerNumber} onChange={(e) => updateContainer(index, 'containerNumber', e.target.value.toUpperCase())} />
                                    </div>
                                    <div>
                                        <Label htmlFor={`tn-${index}`}>Truck Number*</Label>
                                        <Input id={`tn-${index}`} type="text" value={container.truckNumber} onChange={(e) => updateContainer(index, 'truckNumber', e.target.value.toUpperCase())} />
                                    </div>
                                </div>
                                <div>
                                    <Label>Pallets ({container.pallets.length})</Label>
                                    <div className="p-4 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border">
                                        {/* This now uses the new, clean display component */}
                                        <AggregatedPalletDisplay pallets={container.pallets} />
                                    </div>
                                    <button type="button" onClick={() => handleAddPallets(index)} className="text-sm font-semibold text-primary dark:text-dark-primary hover:underline mt-2">
                                        Manage Pallets
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {error && <div className="p-4 bg-red-100 text-red-700 rounded-md">{error}</div>}

                <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-dark-border">
                    <button type="button" onClick={() => navigate('/loading-plans')} className="px-6 py-2 rounded-md bg-gray-200 dark:bg-dark-border text-text dark:text-dark-text font-semibold">Cancel</button>
                    <button type="submit" disabled={isLoading} className="px-6 py-2 rounded-md bg-green-600 text-white font-semibold disabled:opacity-50">
                        {isLoading ? 'Finalizing...' : 'Finalize Loading Plan'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateLoadingPlanPage;
