import React, { useState, useEffect } from 'react';
import { getAvailablePalletsByFactory } from '../../api/palletApi';
import { X, Search, Box, Tag, Package } from 'lucide-react';

const PalletSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  factoryId,
  currentlySelectedPallets = [],
  currentContainerPallets = []
}) => {
  const [pallets, setPallets] = useState([]);
  const [selectedPallets, setSelectedPallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && factoryId) {
      const fetchPallets = async () => {
        setLoading(true);
        setError('');
        try {
          const { data } = await getAvailablePalletsByFactory(factoryId);
          setPallets(Array.isArray(data) ? data : []);
        } catch (err) {
          setError('Failed to load pallets');
          setPallets([]);
        } finally {
          setLoading(false);
        }
      };
      fetchPallets();
    }
  }, [isOpen, factoryId]);

  useEffect(() => {
    if (currentContainerPallets && currentContainerPallets.length > 0) {
      setSelectedPallets(currentContainerPallets.map(p => p._id));
    } else {
      setSelectedPallets([]);
    }
  }, [currentContainerPallets, isOpen]);

  const togglePallet = (palletId) => {
    setSelectedPallets(prev => 
      prev.includes(palletId) ? prev.filter(id => id !== palletId) : [...prev, palletId]
    );
  };

  const handleConfirm = () => {
    const selectedPalletObjects = pallets.filter(p => selectedPallets.includes(p._id));
    onSelect(selectedPalletObjects);
  };

  const isDisabled = (palletId) => {
    return currentlySelectedPallets.includes(palletId) && !selectedPallets.includes(palletId);
  };

  const filteredPallets = pallets.filter(pallet =>
    (pallet.palletId?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (pallet.tile?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  // --- THIS IS THE FIX ---
  // 1. Increased z-index from z-50 to z-[60] to ensure it's on top.
  // 2. Darkened the background overlay for better visual separation.
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[60] p-4">
      <div className="bg-foreground dark:bg-dark-foreground rounded-lg p-6 max-w-3xl w-full max-h-[90vh] flex flex-col border border-border dark:border-dark-border">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-text dark:text-dark-text">Select Pallets</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-text dark:hover:text-dark-text"><X size={24} /></button>
        </div>

        <div className="mb-4 relative">
          <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" />
          <input
            type="text"
            placeholder="Search by Pallet ID or Tile Name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input w-full pl-10"
          />
        </div>

        {error && <div className="bg-red-100 text-red-700 px-4 py-2 rounded mb-4">{error}</div>}

        <div className="flex-1 overflow-y-auto mb-4 pr-2">
          {loading ? (
            <div className="text-center py-8 text-text-secondary">Loading pallets...</div>
          ) : filteredPallets.length === 0 ? (
            <div className="text-center py-8 text-text-secondary">No pallets available for this factory.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredPallets.map(pallet => {
                const isSelected = selectedPallets.includes(pallet._id);
                const isDisabledPallet = isDisabled(pallet._id);

                return (
                  <button
                    key={pallet._id}
                    onClick={() => !isDisabledPallet && togglePallet(pallet._id)}
                    disabled={isDisabledPallet}
                    className={`p-3 rounded-lg border-2 text-left transition-all ${
                      isSelected
                        ? 'bg-primary/10 border-primary text-text dark:text-dark-text'
                        : isDisabledPallet
                        ? 'bg-background/50 border-border text-text-secondary opacity-50 cursor-not-allowed'
                        : 'bg-background dark:bg-dark-background border-border dark:border-dark-border text-text dark:text-dark-text hover:border-primary/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                        <div className="font-mono font-bold text-primary dark:text-dark-primary flex items-center gap-2">
                            <Tag size={14}/> {pallet.palletId || 'N/A'}
                        </div>
                        <div className="font-semibold text-text dark:text-dark-text flex items-center gap-2">
                            {pallet.boxCount} <Box size={14}/>
                        </div>
                    </div>
                    <div className="text-sm text-text-secondary mt-1 flex items-center gap-2">
                        <Package size={14}/> {pallet.tile?.name || 'N/A'}
                    </div>
                    {isDisabledPallet && (
                      <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1 font-semibold">Assigned to another container</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-dark-border">
          <button onClick={onClose} className="px-6 py-2 rounded-md bg-gray-200 dark:bg-dark-border text-text dark:text-dark-text hover:bg-gray-300 dark:hover:bg-dark-border/50">Cancel</button>
          <button onClick={handleConfirm} className="px-6 py-2 rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-50">
            Confirm ({selectedPallets.length} selected)
          </button>
        </div>
      </div>
    </div>
  );
};

export default PalletSelectionModal;
