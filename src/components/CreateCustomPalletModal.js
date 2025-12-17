import React, { useState } from 'react';
import { createManualPallet } from '../api/palletApi';
import { Loader2, X, Info, AlertCircle } from 'lucide-react';

const CreateCustomPalletModal = ({ factory, tiles, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        tileId: '',
        type: 'Pallet',
        boxCount: '',
        quantity: 1
    });
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedTile = tiles.find(t => t._id === formData.tileId);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.tileId) {
            setError('Please select a tile');
            return;
        }
        if (!formData.boxCount || formData.boxCount <= 0) {
            setError('Please enter a valid box count');
            return;
        }
        if (!formData.quantity || formData.quantity <= 0) {
            setError('Please enter a valid quantity');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            // Create multiple pallets if quantity > 1
            const quantity = parseInt(formData.quantity);
            for (let i = 0; i < quantity; i++) {
                const palletPayload = {
                    factoryId: factory._id,
                    tileId: formData.tileId,
                    poId: 'CUSTOM', // Special ID for custom pallets without PO
                    type: formData.type,
                    boxCount: parseInt(formData.boxCount)
                };
                await createManualPallet(palletPayload);
            }

            // Reset form
            setFormData({
                tileId: '',
                type: 'Pallet',
                boxCount: '',
                quantity: 1
            });

            // Call success callback
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create pallet. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border dark:border-dark-border">
                    <div>
                        <h1 className="text-2xl font-bold text-text dark:text-dark-text">Create Custom Pallet/Khatli</h1>
                        <p className="text-text-secondary dark:text-dark-text-secondary text-sm mt-1">Add custom inventory directly to {factory.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background transition-colors">
                        <X size={24} className="text-text-secondary" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 rounded-lg flex items-start gap-3">
                        <Info size={20} className="flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold mb-1">Create Custom Inventory</p>
                            <p>Add pallets or khatlis with custom box counts directly to your factory stock without needing a purchase order.</p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 rounded-lg flex items-start gap-3">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Tile Selection */}
                        <div>
                            <label className="form-label">Select Tile*</label>
                            <select
                                name="tileId"
                                value={formData.tileId}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="">Choose a tile...</option>
                                {tiles.map(tile => (
                                    <option key={tile._id} value={tile._id}>
                                        {tile.name} ({tile.size})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Type Selection */}
                        <div>
                            <label className="form-label">Type*</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="form-select"
                            >
                                <option value="Pallet">Pallet</option>
                                <option value="Khatli">Khatli</option>
                            </select>
                        </div>

                        {/* Box Count */}
                        <div>
                            <label className="form-label">Boxes per {formData.type}*</label>
                            <input
                                type="number"
                                name="boxCount"
                                value={formData.boxCount}
                                onChange={handleInputChange}
                                placeholder="e.g., 50"
                                min="1"
                                className="form-input"
                            />
                            {selectedTile && selectedTile.packing && (
                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">
                                    Standard: {selectedTile.packing.pallet || 'N/A'} boxes per pallet
                                </p>
                            )}
                        </div>

                        {/* Quantity */}
                        <div>
                            <label className="form-label">Quantity (Number of {formData.type}s)*</label>
                            <input
                                type="number"
                                name="quantity"
                                value={formData.quantity}
                                onChange={handleInputChange}
                                placeholder="e.g., 5"
                                min="1"
                                className="form-input"
                            />
                            <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">
                                Will create {formData.quantity} {formData.type.toLowerCase()}(s) with {formData.boxCount || '?'} boxes each
                            </p>
                        </div>
                    </div>

                    {/* Summary */}
                    {formData.tileId && formData.boxCount && formData.quantity && (
                        <div className="p-4 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border">
                            <p className="text-sm font-semibold text-text dark:text-dark-text mb-3">Summary</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-secondary dark:text-dark-text-secondary">Tile:</span>
                                    <span className="font-semibold text-text dark:text-dark-text">{selectedTile?.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary dark:text-dark-text-secondary">Type:</span>
                                    <span className="font-semibold text-text dark:text-dark-text">{formData.type}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary dark:text-dark-text-secondary">Boxes per unit:</span>
                                    <span className="font-semibold text-text dark:text-dark-text">{formData.boxCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-secondary dark:text-dark-text-secondary">Quantity:</span>
                                    <span className="font-semibold text-text dark:text-dark-text">{formData.quantity}</span>
                                </div>
                                <div className="border-t border-border dark:border-dark-border pt-2 mt-2 flex justify-between">
                                    <span className="text-text-secondary dark:text-dark-text-secondary font-semibold">Total Boxes:</span>
                                    <span className="font-bold text-primary dark:text-dark-primary text-lg">
                                        {parseInt(formData.boxCount || 0) * parseInt(formData.quantity || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="p-6 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-semibold text-text-secondary rounded-lg bg-foreground dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-dark-border/50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !formData.tileId || !formData.boxCount || !formData.quantity}
                        className="px-6 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Creating...
                            </>
                        ) : (
                            'Create Pallet/Khatli'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateCustomPalletModal;
