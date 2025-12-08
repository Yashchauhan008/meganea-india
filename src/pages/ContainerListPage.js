import React, { useState, useEffect, useMemo } from 'react';
import { getAllContainers } from '../api/containerApi';
import ContainerDetailModal from '../components/containers/ContainerDetailModal';
import { Loader2, Search, Package, Box, Truck, Warehouse, FileText } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';

const ContainerListPage = () => {
  const [allContainers, setAllContainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // State for modal
  const [selectedContainer, setSelectedContainer] = useState(null);

  // State for filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const fetchContainers = async () => {
      setLoading(true);
      try {
        const { data } = await getAllContainers();
        setAllContainers(data);
      } catch (err) {
        setError('Failed to fetch containers.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchContainers();
  }, []);

  const handleUpdateContainer = (updatedContainer) => {
    setAllContainers(prev => prev.map(c => c._id === updatedContainer._id ? updatedContainer : c));
    setSelectedContainer(updatedContainer); // Keep modal open with updated data
  };

  const filteredContainers = useMemo(() => {
    return allContainers
      .filter(c => {
        if (statusFilter === 'All') return true;
        return c.status === statusFilter;
      })
      .filter(c => {
        const search = debouncedSearchTerm.toLowerCase();
        if (!search) return true;
        return (
          c.containerId?.toLowerCase().includes(search) ||
          c.containerNumber?.toLowerCase().includes(search) ||
          c.truckNumber?.toLowerCase().includes(search)
        );
      });
  }, [allContainers, statusFilter, debouncedSearchTerm]);

  const getStatusColor = (status) => {
    // (Same function as in the modal)
    switch (status) {
        case 'Loaded': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300';
        case 'Dispatched': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300';
        case 'In Transit': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300';
        case 'Delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300';
        default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <>
      {selectedContainer && (
        <ContainerDetailModal
          container={selectedContainer}
          onClose={() => setSelectedContainer(null)}
          onUpdate={handleUpdateContainer}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text dark:text-dark-text">Container Management</h1>
      </div>

      {/* Filter and Search Bar */}
      <div className="mb-6 p-4 bg-foreground dark:bg-dark-foreground rounded-lg border border-border dark:border-dark-border flex flex-wrap items-center gap-4">
        <div className="relative flex-grow min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary/50" size={20} />
          <input
            type="text"
            placeholder="Search by ID, container, or truck..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input w-full pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="form-select w-full sm:w-auto"
        >
          <option value="All">All Statuses</option>
          <option value="Loaded">Loaded</option>
          <option value="Dispatched">Dispatched</option>
          <option value="In Transit">In Transit</option>
          <option value="Delivered">Delivered</option>
        </select>
      </div>

      {loading && (
        <div className="text-center p-12"><Loader2 size={48} className="mx-auto animate-spin text-primary" /></div>
      )}
      {error && <div className="p-6 text-center text-red-500 bg-red-100 rounded-lg">{error}</div>}

      {!loading && !error && (
        <>
          {filteredContainers.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border dark:border-dark-border rounded-lg">
              <Package size={48} className="mx-auto text-text-secondary/50" />
              <h3 className="mt-4 text-lg font-semibold">No Containers Found</h3>
              <p className="text-text-secondary mt-1 text-sm">
                No containers match your current filters. Try creating a loading plan first.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredContainers.map(container => {
                const totalPallets = container.pallets.filter(p => p.type === 'Pallet').length;
                const totalKhatlis = container.pallets.filter(p => p.type === 'Khatli').length;
                const totalBoxes = container.pallets.reduce((sum, p) => sum + p.boxCount, 0);

                return (
                  <div key={container._id} className="bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border shadow-sm flex flex-col transition-shadow hover:shadow-lg">
                    <div className="p-4 border-b border-border dark:border-dark-border">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-mono text-primary dark:text-dark-primary font-bold">{container.containerId}</p>
                          <h3 className="text-lg font-bold text-text dark:text-dark-text flex items-center gap-2">
                            {container.containerNumber}
                          </h3>
                        </div>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStatusColor(container.status)}`}>
                          {container.status}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 flex-grow space-y-3 text-sm">
                        <p className="flex items-center gap-2 text-text-secondary"><Truck size={14}/> Truck: <span className="font-semibold text-text dark:text-dark-text">{container.truckNumber}</span></p>
                        <p className="flex items-center gap-2 text-text-secondary"><FileText size={14}/> Plan: <span className="font-semibold text-text dark:text-dark-text">{container.loadingPlan?.loadingPlanId || 'N/A'}</span></p>
                        <p className="flex items-center gap-2 text-text-secondary"><Warehouse size={14}/> Factory: <span className="font-semibold text-text dark:text-dark-text">{container.loadingPlan?.factory?.name || 'N/A'}</span></p>
                    </div>

                    <div className="p-4 border-t border-border dark:border-dark-border">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex gap-3 text-text-secondary">
                                <span><strong className="text-text dark:text-dark-text">{totalPallets}</strong> Pallets</span>
                                <span><strong className="text-text dark:text-dark-text">{totalKhatlis}</strong> Khatlis</span>
                                <span><strong className="text-text dark:text-dark-text">{totalBoxes}</strong> Boxes</span>
                            </div>
                            <button onClick={() => setSelectedContainer(container)} className="font-semibold text-primary dark:text-dark-primary hover:underline">
                                View Details
                            </button>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </>
  );
};

export default ContainerListPage;
