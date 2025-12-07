import React, { useState, useEffect } from 'react';
import { Loader2, X } from 'lucide-react';
import { recordQCForItem } from '../../api/purchaseOrderApi';
import Label from '../ui/Label';
import Input from '../ui/Input'; // We will use the standard input again
import ThemedSlider from '../ui/Slider'; // The slider component is still useful

const RecordQCModal = ({ poId, item, onClose, onSave }) => {
    // State is now simple and direct
    const [quantityPassed, setQuantityPassed] = useState(0);
    const [quantityFailed, setQuantityFailed] = useState(0);
    const [notes, setNotes] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Auto-calculate the total checked
    const quantityChecked = Number(quantityPassed) + Number(quantityFailed);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (quantityChecked === 0) {
            setError('You must record at least one passed or failed item.');
            return;
        }
        setError('');
        setLoading(true);

        const submissionData = {
            quantityChecked,
            quantityPassed,
            quantityFailed,
            notes,
        };

        try {
            const { data } = await recordQCForItem(poId, item._id, submissionData);
            onSave(data);
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to save QC record.');
        } finally {
            setLoading(false);
        }
    };

    if (!item) return null;

    // The maximum value for the slider is how many boxes are left to be QC'd
    const remainingToQc = item.totalBoxesOrdered - item.quantityPassedQC;

    // When the slider moves, we must ensure the total doesn't exceed what's remaining
    const handleSliderChange = (value) => {
        setQuantityPassed(value);
        if ((value + Number(quantityFailed)) > remainingToQc) {
            // If the new "passed" value plus the existing "failed" value is too high,
            // reduce the "failed" value to stay within the limit.
            setQuantityFailed(remainingToQc - value);
        }
    };

    // When the failed input changes, do the same check
    const handleFailedChange = (e) => {
        const failedValue = Number(e.target.value) || 0;
        if (failedValue < 0) return; // No negative numbers

        if ((quantityPassed + failedValue) > remainingToQc) {
            setQuantityFailed(remainingToQc - quantityPassed);
        } else {
            setQuantityFailed(failedValue);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4">
            <div className="bg-foreground dark:bg-dark-foreground rounded-lg shadow-xl p-6 w-full max-w-lg relative">
                <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-background dark:hover:bg-dark-background">
                    <X size={20} />
                </button>
                <h2 className="text-xl font-bold text-text dark:text-dark-text">Record QC for:</h2>
                <p className="text-primary dark:text-dark-primary font-semibold mb-6">{item.tile.name}</p>

                {error && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-4 text-sm">{error}</p>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* --- THE NEW, SIMPLIFIED UI --- */}
                    
                    {/* 1. The Single Slider for Passed Quantity */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <Label htmlFor="quantityPassed">Quantity Passed</Label>
                            <span className="font-bold text-lg text-green-500">{quantityPassed}</span>
                        </div>
                        <ThemedSlider
                            id="quantityPassed"
                            min={0}
                            max={remainingToQc}
                            value={quantityPassed}
                            onChange={handleSliderChange}
                        />
                        <div className="flex justify-between text-xs text-text-secondary mt-1">
                            <span>0</span>
                            <span>{remainingToQc} (Remaining)</span>
                        </div>
                    </div>

                    {/* 2. The Simple Input for Failed Quantity */}
                    <div className="grid grid-cols-2 gap-4 items-end">
                        <div>
                            <Label htmlFor="quantityFailed">Quantity Failed</Label>
                            <Input
                                id="quantityFailed"
                                type="number"
                                value={quantityFailed}
                                onChange={handleFailedChange}
                                className="text-red-500 font-bold"
                            />
                        </div>
                        
                        {/* 3. The Auto-Calculated Total */}
                        <div>
                            <Label>Total Checked</Label>
                            <div className="w-full p-2 mt-1 bg-background dark:bg-dark-background rounded-md text-center font-bold text-lg text-text dark:text-dark-text">
                                {quantityChecked}
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="notes">QC Notes (Optional)</Label>
                        <textarea id="notes" name="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows="3" className="form-input w-full"></textarea>
                    </div>
                    
                    <div className="flex justify-end pt-4">
                        <button type="submit" disabled={loading || quantityChecked === 0} className="px-6 py-2 text-sm font-semibold text-white bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50 flex items-center gap-2">
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
