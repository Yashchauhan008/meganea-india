import React, { useState } from 'react';
import { updatePalletBoxCount, deletePallet } from '../api/palletApi';
import { Loader2, X, AlertCircle, Trash2, Info } from 'lucide-react';

const EditPalletModal = ({ pallet, tile, onClose, onSuccess }) => {
    const [boxCount, setBoxCount] = useState(pallet.boxCount);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!boxCount || boxCount <= 0) {
            setError('Please enter a valid box count');
            return;
        }

        if (boxCount === pallet.boxCount) {
            setError('Please enter a different box count');
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            await updatePalletBoxCount(pallet._id, boxCount);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update pallet. Please try again.');
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        setError('');

        try {
            await deletePallet(pallet._id);
            onSuccess();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to delete pallet. Please try again.');
            setShowDeleteConfirm(false);
            console.error(err);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-border dark:border-dark-border">
                    <div>
                        <h1 className="text-2xl font-bold text-text dark:text-dark-text">Edit {pallet.type}</h1>
                        <p className="text-text-secondary dark:text-dark-text-secondary text-sm mt-1">{tile?.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-background dark:hover:bg-dark-background transition-colors">
                        <X size={24} className="text-text-secondary" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Info Box */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-500/10 text-blue-800 dark:text-blue-300 rounded-lg flex items-start gap-3">
                        <Info size={20} className="flex-shrink-0 mt-0.5" />
                        <div className="text-sm">
                            <p className="font-semibold mb-1">Pallet ID: {pallet.palletId}</p>
                            <p>Update the box count for this {pallet.type.toLowerCase()}. This will adjust the total stock accordingly.</p>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-800 dark:text-red-300 rounded-lg flex items-start gap-3">
                            <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
                            <p className="text-sm">{error}</p>
                        </div>
                    )}

                    {/* Current Info */}
                    <div className="p-4 bg-background dark:bg-dark-background rounded-lg border border-border dark:border-dark-border space-y-3">
                        <div className="flex justify-between items-center">
                            <span className="text-text-secondary dark:text-dark-text-secondary">Type:</span>
                            <span className="font-semibold text-text dark:text-dark-text">{pallet.type}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-text-secondary dark:text-dark-text-secondary">Tile:</span>
                            <span className="font-semibold text-text dark:text-dark-text">{tile?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-text-secondary dark:text-dark-text-secondary">Current Box Count:</span>
                            <span className="font-semibold text-primary dark:text-dark-primary text-lg">{pallet.boxCount}</span>
                        </div>
                        {pallet.isManualAdjustment && (
                            <div className="flex justify-between items-center pt-2 border-t border-border dark:border-dark-border">
                                <span className="text-text-secondary dark:text-dark-text-secondary text-xs">Status:</span>
                                <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-500/20 px-2 py-1 rounded">
                                    Manual Entry
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Edit Form */}
                    {!showDeleteConfirm && (
                        <form onSubmit={handleUpdate} className="space-y-4">
                            <div>
                                <label className="form-label">New Box Count*</label>
                                <input
                                    type="number"
                                    value={boxCount}
                                    onChange={(e) => {
                                        setBoxCount(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="Enter new box count"
                                    min="1"
                                    className="form-input text-lg font-semibold"
                                    autoFocus
                                />
                                <p className="text-xs text-text-secondary dark:text-dark-text-secondary mt-2">
                                    Change from {pallet.boxCount} to {boxCount || '?'} boxes
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !boxCount || boxCount <= 0 || boxCount === pallet.boxCount}
                                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Updating...
                                        </>
                                    ) : (
                                        'Update Box Count'
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Delete Confirmation */}
                    {showDeleteConfirm && (
                        <div className="p-4 bg-red-50 dark:bg-red-500/10 rounded-lg border border-red-200 dark:border-red-900/50 space-y-4">
                            <div className="flex items-start gap-3">
                                <AlertCircle size={20} className="text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-semibold text-red-800 dark:text-red-300">Delete this {pallet.type.toLowerCase()}?</p>
                                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                                        This will permanently remove this {pallet.type.toLowerCase()} from stock and adjust the tile inventory. This action cannot be undone.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="flex-1 px-4 py-2 text-sm font-semibold text-text-secondary bg-background dark:bg-dark-background rounded-lg hover:bg-gray-200 dark:hover:bg-dark-border transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDelete}
                                    disabled={isDeleting}
                                    className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Deleting...
                                        </>
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            Delete
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-background dark:bg-dark-background/50 border-t border-border dark:border-dark-border flex justify-between gap-3">
                    {!showDeleteConfirm && (
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors flex items-center gap-2"
                        >
                            <Trash2 size={16} />
                            Delete
                        </button>
                    )}
                    <div className="flex-1" />
                    <button
                        onClick={onClose}
                        className="px-6 py-2 text-sm font-semibold text-text-secondary rounded-lg bg-foreground dark:bg-dark-border hover:bg-gray-200 dark:hover:bg-dark-border/50 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditPalletModal;
