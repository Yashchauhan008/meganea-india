// frontend/src/components/purchase-orders/RecordQCModal.js

import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { recordQCForItem } from '../../api/purchaseOrderApi';
import Input from '../ui/Input';
import Label from '../ui/Label';

const RecordQCModal = ({ poId, item, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        quantityChecked: 0,
        quantityPassed: 0,
        quantityFailed: 0,
        notes: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-calculate failed quantity whenever checked or passed changes
    useEffect(() => {
        const checked = Number(formData.quantityChecked) || 0;
        const passed = Number(formData.quantityPassed) || 0;
        if (checked >= passed) {
            setFormData(prev => ({ ...prev, quantityFailed: checked - passed }));
        }
    }, [formData.quantityChecked, formData.quantityPassed]);

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const submissionData = {
            quantityChecked: Number(formData.quantityChecked),
            quantityPassed: Number(formData.quantityPassed),
            quantityFailed: Number(formData.quantityFailed),
            notes: formData.notes,
        };

        try {
            const updatedPO = await recordQCForItem(poId, item._id, submissionData);
            onSave(updatedPO.data); // Pass the updated PO back to the parent modal
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save QC record.');
        } finally {
            setLoading(false);
        }
    };

    if (!item) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="bg-foreground dark:bg-dark-foreground rounded-lg shadow-xl p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-background dark:hover:bg-dark-background">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-bold text-text dark:text-dark-text">Record QC for:</h2>
                <p className="text-primary dark:text-dark-primary font-semibold mb-4">{item.tile.name}</p>

                {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-4 text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="quantityChecked">Checked</Label>
                            <Input id="quantityChecked" name="quantityChecked" type="number" min="0" value={formData.quantityChecked} onChange={handleChange} required autoFocus />
                        </div>
                        <div>
                            <Label htmlFor="quantityPassed">Passed</Label>
                            <Input id="quantityPassed" name="quantityPassed" type="number" min="0" max={formData.quantityChecked} value={formData.quantityPassed} onChange={handleChange} required />
                        </div>
                        <div>
                            <Label htmlFor="quantityFailed">Failed</Label>
                            <Input id="quantityFailed" name="quantityFailed" type="number" value={formData.quantityFailed} readOnly className="bg-gray-200 dark:bg-dark-border cursor-not-allowed" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="notes">QC Notes</Label>
                        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} rows="3" className="form-input w-full"></textarea>
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading} className="px-6 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2">
                            {loading && <Loader2 size={16} className="animate-spin" />}
                            Save QC Record
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RecordQCModal;
