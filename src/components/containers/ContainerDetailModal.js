import React, { useState } from 'react';
import { X, Loader2, Package, Box, Ruler, Tag, Warehouse, FileText, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { updateContainerStatus } from '../../api/containerApi';

const ContainerDetailModal = ({ container, onClose, onUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!container) return null;

  const handleStatusUpdate = async (newStatus) => {
    if (!window.confirm(`Are you sure you want to mark this container as "${newStatus}"?`)) return;

    setIsUpdating(true);
    try {
      const { data } = await updateContainerStatus(container._id, newStatus);
      onUpdate(data); // Pass the updated container back to the parent page
    } catch (error) {
      alert('Failed to update status. Please try again.');
      console.error(error);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Loaded': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
      case 'Dispatched': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
      case 'In Transit': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300';
      case 'Delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const totalBoxes = container.pallets.reduce((sum, pallet) => sum + pallet.boxCount, 0);

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center p-5 border-b border-border dark:border-dark-border">
          <div>
            <h1 className="text-2xl font-bold text-text dark:text-dark-text">Container Details</h1>
            <p className="font-mono text-primary dark:text-dark-primary">{container.containerId}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background">
            <X size={24} className="text-text-secondary" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Top Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
              <div className="text-sm text-text-secondary flex items-center gap-2"><Truck size={14} /> Container Info</div>
              <div className="text-lg font-bold text-text dark:text-dark-text">{container.containerNumber}</div>
              <div className="text-md text-text-secondary">{container.truckNumber}</div>
            </div>
            <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
              <div className="text-sm text-text-secondary">Status</div>
              <div className={`text-lg font-bold inline-block px-3 py-1 mt-1 rounded-full text-sm ${getStatusColor(container.status)}`}>
                {container.status}
              </div>
            </div>
            <div className="p-4 bg-background dark:bg-dark-background rounded-lg">
              <div className="text-sm text-text-secondary flex items-center gap-2"><FileText size={14} /> Source Plan</div>
              <div className="text-lg font-bold text-text dark:text-dark-text">{container.loadingPlan?.loadingPlanId || 'N/A'}</div>
              <div className="text-md text-text-secondary flex items-center gap-1"><Warehouse size={12}/> {container.loadingPlan?.factory?.name || 'N/A'}</div>
            </div>
          </div>

          {/* Pallet Contents Section */}
          <div>
            <h3 className="text-lg font-semibold mb-3 text-text dark:text-dark-text">
              Contents ({container.pallets.length} Pallets, {totalBoxes} Total Boxes)
            </h3>
            <div className="border border-border dark:border-dark-border rounded-lg max-h-96 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-background dark:bg-dark-background sticky top-0">
                  <tr>
                    <th className="p-3 text-left font-medium text-text-secondary dark:text-dark-text-secondary"><Tag size={14} className="inline mr-1"/>Pallet ID</th>
                    <th className="p-3 text-left font-medium text-text-secondary dark:text-dark-text-secondary">Tile Name</th>
                    <th className="p-3 text-left font-medium text-text-secondary dark:text-dark-text-secondary"><Ruler size={14} className="inline mr-1"/>Size</th>
                    <th className="p-3 text-left font-medium text-text-secondary dark:text-dark-text-secondary"><Box size={14} className="inline mr-1"/>Boxes</th>
                  </tr>
                </thead>
                <tbody>
                  {container.pallets.map(pallet => (
                    <tr key={pallet._id} className="border-t border-border dark:border-dark-border">
                      <td className="p-3 font-mono text-text dark:text-dark-text">{pallet.palletId}</td>
                      <td className="p-3 text-text-secondary">{pallet.tile?.name || 'N/A'}</td>
                      <td className="p-3 text-text-secondary">{pallet.tile?.size || 'N/A'}</td>
                      <td className="p-3 font-semibold text-text dark:text-dark-text">{pallet.boxCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="p-4 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-between items-center">
            <span className="text-xs text-text-secondary">Created: {format(new Date(container.createdAt), 'dd MMM, yyyy HH:mm')}</span>
            <div className="flex gap-3">
                <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-text-secondary rounded-md bg-foreground dark:bg-dark-border hover:bg-gray-100">
                    Close
                </button>
                {container.status === 'Loaded' && (
                    <button 
                        onClick={() => handleStatusUpdate('Dispatched')}
                        disabled={isUpdating} 
                        className="px-4 py-2 text-sm font-semibold text-white bg-yellow-500 rounded-md hover:bg-yellow-600 disabled:opacity-50 flex items-center gap-2"
                    >
                        {isUpdating && <Loader2 size={16} className="animate-spin" />}
                        Mark as Dispatched
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ContainerDetailModal;
