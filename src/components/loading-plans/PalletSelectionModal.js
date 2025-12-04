import React, { useState, useEffect } from 'react';
import { getAvailablePalletsByFactory } from '../../api/palletApi';
import { X, Search } from 'lucide-react';

const PalletSelectionModal = ({
  isOpen,
  onClose,
  onSelect,
  factoryId,
  currentlySelectedPallets = [],
  containerIndex,
  currentContainerPallets = []
}) => {
  const [pallets, setPallets] = useState([]);
  const [selectedPallets, setSelectedPallets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && factoryId) {
      fetchPallets();
    }
  }, [isOpen, factoryId]);

  useEffect(() => {
    if (currentContainerPallets && currentContainerPallets.length > 0) {
      setSelectedPallets(currentContainerPallets.map(p => p._id));
    }
  }, [currentContainerPallets]);

  const fetchPallets = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAvailablePalletsByFactory(factoryId);
      // Handle both array and object responses
      const palletsArray = Array.isArray(data) ? data : data.data || data.pallets || [];
      setPallets(palletsArray);
    } catch (err) {
      setError('Failed to load pallets');
      console.error(err);
      setPallets([]);
    } finally {
      setLoading(false);
    }
  };

  const togglePallet = (palletId) => {
    setSelectedPallets(prev => {
      if (prev.includes(palletId)) {
        return prev.filter(id => id !== palletId);
      } else {
        return [...prev, palletId];
      }
    });
  };

  const handleConfirm = () => {
    const palletsArray = Array.isArray(pallets) ? pallets : [];
    const selectedPalletObjects = palletsArray.filter(p => selectedPallets.includes(p._id));
    onSelect(selectedPalletObjects);
  };

  const isDisabled = (palletId) => {
    return currentlySelectedPallets.includes(palletId) && !selectedPallets.includes(palletId);
  };

  const palletsArray = Array.isArray(pallets) ? pallets : [];
  const filteredPallets = palletsArray.filter(pallet =>
    pallet.palletId && pallet.palletId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-slate-800 rounded-lg p-6 max-w-2xl w-full max-h-96 flex flex-col border border-slate-700">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Select Pallets</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 flex items-center gap-2">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Search pallets..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white placeholder-gray-400"
          />
        </div>

        {error && (
          <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto mb-4">
          {loading ? (
            <div className="text-center py-8 text-gray-400">Loading pallets...</div>
          ) : filteredPallets.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No pallets available</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {filteredPallets.map(pallet => {
                const isSelected = selectedPallets.includes(pallet._id);
                const isDisabledPallet = isDisabled(pallet._id);

                return (
                  <button
                    key={pallet._id}
                    onClick={() => !isDisabledPallet && togglePallet(pallet._id)}
                    disabled={isDisabledPallet}
                    className={`p-3 rounded border-2 transition-all ${
                      isSelected
                        ? 'bg-blue-600 border-blue-500 text-white'
                        : isDisabledPallet
                        ? 'bg-slate-700 border-slate-600 text-gray-500 opacity-50 cursor-not-allowed'
                        : 'bg-slate-700 border-slate-600 text-white hover:border-blue-500'
                    }`}
                  >
                    <div className="font-medium">{pallet.palletId || 'N/A'}</div>
                    <div className="text-sm text-gray-300">
                      {pallet.tile?.name || 'N/A'}
                    </div>
                    {isDisabledPallet && (
                      <div className="text-xs text-red-400 mt-1">Already assigned</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={selectedPallets.length === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
          >
            Confirm ({selectedPallets.length} selected)
          </button>
        </div>
      </div>
    </div>
  );
};

export default PalletSelectionModal;
