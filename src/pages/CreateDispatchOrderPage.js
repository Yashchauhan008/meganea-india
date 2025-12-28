import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAvailableContainers, createDispatch } from '../api/dispatchApi';
import { getAllFactories } from '../api/factoryApi';
import { 
  Loader2, ChevronLeft, Package, Truck, CheckCircle, 
  AlertCircle, Factory, Box, X, Eye
} from 'lucide-react';
import Input from '../components/ui/Input';
import Label from '../components/ui/Label';
import Select from '../components/ui/Select';

// Helper function to safely get array
const safeArray = (arr) => {
  if (!arr) return [];
  if (!Array.isArray(arr)) return [];
  return arr.filter(item => item !== null && item !== undefined);
};

// Helper function to safely count boxes
const countBoxes = (items) => {
  if (!items || !Array.isArray(items)) return 0;
  return items.reduce((sum, item) => {
    if (!item) return sum;
    return sum + (item.boxCount || 0);
  }, 0);
};

const CreateDispatchOrderPage = () => {
  const navigate = useNavigate();
  
  const [containers, setContainers] = useState([]);
  const [factories, setFactories] = useState([]);
  const [selectedContainerIds, setSelectedContainerIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [factoryFilter, setFactoryFilter] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [previewContainer, setPreviewContainer] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    dispatchDate: new Date().toISOString().split('T')[0],
    destination: '',
    notes: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const [containersData, factoriesData] = await Promise.all([
          getAvailableContainers(),
          getAllFactories(),
        ]);
        setContainers(containersData || []);
        setFactories(factoriesData || []);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      if (e.code === 'Space' && !isPreviewOpen && selectedContainerIds.length > 0) {
        e.preventDefault();
        const lastSelectedId = selectedContainerIds[selectedContainerIds.length - 1];
        const container = containers.find(c => c._id === lastSelectedId);
        if (container) {
          setPreviewContainer(container);
          setIsPreviewOpen(true);
        }
      }
      
      if (e.code === 'Escape' && isPreviewOpen) {
        e.preventDefault();
        setIsPreviewOpen(false);
        setPreviewContainer(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedContainerIds, containers, isPreviewOpen]);

  const filteredContainers = useMemo(() => {
    if (!Array.isArray(containers)) return [];
    
    return containers.filter(container => {
      if (!container) return false;
      
      if (factoryFilter === 'none') {
        if (container.factory) return false;
      } else if (factoryFilter) {
        if (!container.factory || container.factory._id !== factoryFilter) return false;
      }
      
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        const matchesContainer = (container.containerNumber || '').toLowerCase().includes(search);
        const matchesTruck = (container.truckNumber || '').toLowerCase().includes(search);
        const matchesFactory = (container.factory?.name || '').toLowerCase().includes(search);
        
        if (!matchesContainer && !matchesTruck && !matchesFactory) return false;
      }
      
      return true;
    });
  }, [containers, factoryFilter, searchTerm]);

  const summary = useMemo(() => {
    if (!Array.isArray(containers)) {
      return {
        totalContainers: 0,
        totalPallets: 0,
        totalKhatlis: 0,
        totalBoxes: 0,
        tileBreakdown: [],
      };
    }

    const selected = containers.filter(c => c && selectedContainerIds.includes(c._id));
    
    let totalPallets = 0;
    let totalKhatlis = 0;
    let totalBoxes = 0;
    const tileBreakdown = new Map();

    selected.forEach(container => {
      if (!container) return;

      // Get arrays safely
      const pallets = safeArray(container.pallets);
      const khatlis = safeArray(container.khatlis);

      // Count pallets
      pallets.forEach(pallet => {
        if (!pallet) return;
        
        totalPallets++;
        const boxCount = pallet.boxCount || 0;
        totalBoxes += boxCount;
        
        const tileName = pallet.tile?.name || 'Unknown';
        const tileSize = pallet.tile?.size || 'N/A';
        const key = `${tileName}-${tileSize}`;
        
        if (!tileBreakdown.has(key)) {
          tileBreakdown.set(key, {
            name: tileName,
            size: tileSize,
            palletCount: 0,
            khatliCount: 0,
            boxCount: 0,
          });
        }
        const tile = tileBreakdown.get(key);
        tile.palletCount++;
        tile.boxCount += boxCount;
      });

      // Count khatlis
      khatlis.forEach(khatli => {
        if (!khatli) return;
        
        totalKhatlis++;
        const boxCount = khatli.boxCount || 0;
        totalBoxes += boxCount;
        
        const tileName = khatli.tile?.name || 'Unknown';
        const tileSize = khatli.tile?.size || 'N/A';
        const key = `${tileName}-${tileSize}`;
        
        if (!tileBreakdown.has(key)) {
          tileBreakdown.set(key, {
            name: tileName,
            size: tileSize,
            palletCount: 0,
            khatliCount: 0,
            boxCount: 0,
          });
        }
        const tile = tileBreakdown.get(key);
        tile.khatliCount++;
        tile.boxCount += boxCount;
      });
    });

    return {
      totalContainers: selected.length,
      totalPallets,
      totalKhatlis,
      totalBoxes,
      tileBreakdown: Array.from(tileBreakdown.values()),
    };
  }, [containers, selectedContainerIds]);

  const toggleContainer = (containerId) => {
    if (!containerId) return;
    
    setSelectedContainerIds(prev => {
      if (prev.includes(containerId)) {
        return prev.filter(id => id !== containerId);
      } else {
        return [...prev, containerId];
      }
    });
  };

  const handleQuickPreview = (container, e) => {
    e.stopPropagation();
    setPreviewContainer(container);
    setIsPreviewOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (selectedContainerIds.length === 0) {
      return 'Please select at least one container';
    }
    if (!formData.destination.trim()) {
      return 'Destination is required';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const validContainerIds = selectedContainerIds.filter(id => id);
      
      if (validContainerIds.length === 0) {
        setError('Please select at least one valid container');
        setSubmitting(false);
        return;
      }

      const dispatchData = {
        containerIds: validContainerIds,
        invoiceNumber: formData.invoiceNumber.trim(),
        dispatchDate: formData.dispatchDate,
        destination: formData.destination.trim(),
        notes: formData.notes.trim(),
      };

      await createDispatch(dispatchData);
      navigate('/dispatches', { 
        state: { 
          success: true, 
          message: 'Dispatch order created successfully' 
        } 
      });
    } catch (err) {
      setError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {isPreviewOpen && previewContainer && (
        <QuickPreviewModal
          container={previewContainer}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewContainer(null);
          }}
        />
      )}

      <div className="mb-6">
        <button
          onClick={() => navigate('/dispatches')}
          className="flex items-center gap-2 text-text-secondary dark:text-dark-text-secondary hover:text-text dark:hover:text-dark-text mb-4"
        >
          <ChevronLeft size={20} />
          <span>Back to Dispatches</span>
        </button>
        <h1 className="text-3xl font-bold text-text dark:text-dark-text">
          Create Dispatch Order
        </h1>
        <p className="text-text-secondary dark:text-dark-text-secondary mt-1">
          Select containers and enter dispatch details
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-800 dark:text-red-200 font-semibold">Error</p>
            <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={48} className="animate-spin text-primary mb-4" />
          <p className="text-text-secondary dark:text-dark-text-secondary">
            Loading available containers...
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-border dark:border-dark-border p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-xl font-semibold text-text dark:text-dark-text flex items-center gap-2">
                <Package size={24} />
                Select Containers ({filteredContainers.length} available)
              </h2>
              
              <div className="flex flex-wrap gap-3 w-full sm:w-auto">
                <Input
                  type="text"
                  placeholder="Search containers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full sm:w-64"
                />
                
                <Select
                  value={factoryFilter}
                  onChange={(e) => setFactoryFilter(e.target.value)}
                  className="w-full sm:w-48"
                >
                  <option value="">All Factories</option>
                  <option value="none">None (No Factory)</option>
                  {factories.map(factory => (
                    <option key={factory._id} value={factory._id}>
                      {factory.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            <p className="text-xs text-text-secondary dark:text-dark-text-secondary mb-4 italic">
              💡 Tip: Select a container and press <kbd className="px-2 py-1 bg-background dark:bg-dark-background rounded border">Space</kbd> for quick preview
            </p>

            {filteredContainers.length === 0 ? (
              <div className="text-center py-12">
                <Package size={48} className="mx-auto text-text-secondary/50 mb-4" />
                <p className="text-text-secondary dark:text-dark-text-secondary">
                  No containers match your filters
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setFactoryFilter('');
                    setSearchTerm('');
                  }}
                  className="mt-3 text-sm text-primary hover:underline"
                >
                  Clear filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContainers.map(container => {
                  if (!container) return null;
                  
                  const isSelected = selectedContainerIds.includes(container._id);
                  
                  // Safe array access
                  const pallets = safeArray(container.pallets);
                  const khatlis = safeArray(container.khatlis);
                  
                  const palletCount = pallets.length;
                  const khatliCount = khatlis.length;
                  const totalBoxes = countBoxes(pallets) + countBoxes(khatlis);

                  return (
                    <div
                      key={container._id}
                      onClick={() => toggleContainer(container._id)}
                      className={`
                        relative p-4 rounded-lg border-2 cursor-pointer transition-all
                        ${isSelected 
                          ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                          : 'border-border dark:border-dark-border hover:border-primary/50'
                        }
                      `}
                    >
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleQuickPreview(container, e)}
                          className="p-1 hover:bg-background dark:hover:bg-dark-background rounded"
                          title="Quick preview (Space)"
                        >
                          <Eye size={18} className="text-text-secondary dark:text-dark-text-secondary" />
                        </button>
                        {isSelected ? (
                          <CheckCircle size={24} className="text-primary" />
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-border dark:border-dark-border" />
                        )}
                      </div>

                      <div className="pr-16">
                        <p className="font-bold text-lg text-text dark:text-dark-text">
                          {container.containerNumber || 'N/A'}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
                          <Truck size={14} />
                          <span>{container.truckNumber || 'N/A'}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-text-secondary dark:text-dark-text-secondary mt-1">
                          <Factory size={14} />
                          <span>{container.factory?.name || 'No Factory'}</span>
                        </div>

                        <div className="mt-3 pt-3 border-t border-border dark:border-dark-border space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Box size={14} className="text-text-secondary dark:text-dark-text-secondary" />
                            <span className="font-semibold text-text dark:text-dark-text">
                              {totalBoxes} Boxes
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-text dark:text-dark-text">
                              <span className="font-bold">{palletCount}</span>
                              <span className="text-text-secondary dark:text-dark-text-secondary ml-1">
                                Pallet{palletCount !== 1 ? 's' : ''}
                              </span>
                            </span>
                            
                            <span className="text-text-secondary dark:text-dark-text-secondary">•</span>
                            
                            <span className="text-text dark:text-dark-text">
                              <span className="font-bold">{khatliCount}</span>
                              <span className="text-text-secondary dark:text-dark-text-secondary ml-1">
                                Khatli{khatliCount !== 1 ? 's' : ''}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {summary.totalContainers > 0 && (
            <div className="bg-primary/5 dark:bg-primary/10 rounded-lg border border-primary/20 p-6">
              <h3 className="text-lg font-semibold text-text dark:text-dark-text mb-4">
                Dispatch Summary
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Containers</p>
                  <p className="text-2xl font-bold text-text dark:text-dark-text">
                    {summary.totalContainers}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Pallets</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {summary.totalPallets}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Khatlis</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {summary.totalKhatlis}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Boxes</p>
                  <p className="text-2xl font-bold text-text dark:text-dark-text">
                    {summary.totalBoxes}
                  </p>
                </div>
              </div>

              {summary.tileBreakdown.length > 0 && (
                <div>
                  <p className="text-sm font-semibold text-text dark:text-dark-text mb-2">
                    Breakdown by Tile:
                  </p>
                  <div className="space-y-1">
                    {summary.tileBreakdown.map((tile, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-text dark:text-dark-text">
                          {tile.name} ({tile.size})
                        </span>
                        <span className="text-text-secondary dark:text-dark-text-secondary">
                          <span className="text-blue-600 dark:text-blue-400">{tile.palletCount}P</span>
                          {' + '}
                          <span className="text-green-600 dark:text-green-400">{tile.khatliCount}K</span>
                          {' = '}{tile.boxCount} boxes
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="bg-foreground dark:bg-dark-foreground rounded-lg border border-border dark:border-dark-border p-6">
            <h2 className="text-xl font-semibold text-text dark:text-dark-text mb-4">
              Dispatch Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Invoice Number (Optional)</Label>
                <Input
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleChange}
                  placeholder="e.g., INV-2025-001234"
                />
              </div>

              <div>
                <Label htmlFor="dispatchDate">Dispatch Date *</Label>
                <Input
                  type="date"
                  id="dispatchDate"
                  name="dispatchDate"
                  value={formData.dispatchDate}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="destination">Destination *</Label>
                <Input
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  placeholder="e.g., Dubai Warehouse - Al Quoz"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="notes">Notes / Instructions</Label>
                <textarea
                  id="notes"
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="w-full px-3 py-2 bg-background dark:bg-dark-background border border-border dark:border-dark-border rounded-md text-text dark:text-dark-text focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter any special instructions or notes..."
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border dark:border-dark-border">
            <button
              type="button"
              onClick={() => navigate('/dispatches')}
              className="px-6 py-2 rounded-md bg-background dark:bg-dark-background text-text dark:text-dark-text border border-border dark:border-dark-border hover:bg-border dark:hover:bg-dark-border font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || selectedContainerIds.length === 0}
              className="px-6 py-2 rounded-md bg-primary text-white font-semibold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? 'Creating...' : 'Create Dispatch Order'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

const QuickPreviewModal = ({ container, onClose }) => {
  const pallets = safeArray(container.pallets);
  const khatlis = safeArray(container.khatlis);
  
  const palletCount = pallets.length;
  const khatliCount = khatlis.length;
  const totalBoxes = countBoxes(pallets) + countBoxes(khatlis);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-foreground dark:bg-dark-foreground rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto border-2 border-border dark:border-dark-border shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-foreground dark:bg-dark-foreground border-b border-border dark:border-dark-border p-4 flex justify-between items-center">
          <h3 className="text-xl font-bold text-text dark:text-dark-text flex items-center gap-2">
            <Package size={24} />
            Quick Preview
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-background dark:hover:bg-dark-background rounded">
            <X size={24} className="text-text-secondary dark:text-dark-text-secondary" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <p className="text-2xl font-bold text-text dark:text-dark-text">
              {container.containerNumber || 'N/A'}
            </p>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">
              <span className="flex items-center gap-1">
                <Truck size={16} />
                {container.truckNumber || 'N/A'}
              </span>
              <span className="flex items-center gap-1">
                <Factory size={16} />
                {container.factory?.name || 'No Factory'}
              </span>
              <span className="px-2 py-1 bg-primary/10 text-primary rounded">
                {container.status || 'Unknown'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 p-4 bg-background dark:bg-dark-background rounded-lg">
            <div className="text-center">
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Pallets</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{palletCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Khatlis</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{khatliCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-text-secondary dark:text-dark-text-secondary">Total Boxes</p>
              <p className="text-2xl font-bold text-text dark:text-dark-text">{totalBoxes}</p>
            </div>
          </div>

          {palletCount > 0 && (
            <div>
              <h4 className="font-semibold text-text dark:text-dark-text mb-2 flex items-center gap-2">
                <Box size={18} className="text-blue-600" />
                Pallets ({palletCount})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {pallets.map((pallet, idx) => (
                  <div key={idx} className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-sm">
                    <p className="font-semibold text-text dark:text-dark-text">
                      {pallet.tile?.name || 'Unknown'} ({pallet.tile?.size || 'N/A'})
                    </p>
                    <p className="text-text-secondary dark:text-dark-text-secondary">
                      {pallet.boxCount || 0} boxes • {pallet.palletId || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {khatliCount > 0 && (
            <div>
              <h4 className="font-semibold text-text dark:text-dark-text mb-2 flex items-center gap-2">
                <Box size={18} className="text-green-600" />
                Khatlis ({khatliCount})
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {khatlis.map((khatli, idx) => (
                  <div key={idx} className="p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm">
                    <p className="font-semibold text-text dark:text-dark-text">
                      {khatli.tile?.name || 'Unknown'} ({khatli.tile?.size || 'N/A'})
                    </p>
                    <p className="text-text-secondary dark:text-dark-text-secondary">
                      {khatli.boxCount || 0} boxes • {khatli.palletId || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {palletCount === 0 && khatliCount === 0 && (
            <div className="text-center py-8 text-text-secondary dark:text-dark-text-secondary">
              <Box size={48} className="mx-auto mb-2 opacity-50" />
              <p>This container has no items</p>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-foreground dark:bg-dark-foreground border-t border-border dark:border-dark-border p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover font-semibold"
          >
            Close (Esc)
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateDispatchOrderPage;