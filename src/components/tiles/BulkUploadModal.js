import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { X, UploadCloud, Download, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react';
import { bulkCreateTiles } from '../../api/tileApi';

const BulkUploadModal = ({ onClose, onSave }) => {
    const [files, setFiles] = useState([]);
    const [parsedData, setParsedData] = useState([]);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [apiError, setApiError] = useState('');

    const requiredHeaders = ['name', 'size', 'surface', 'conversionFactor', 'restockThreshold', 'initialStock'];
    const optionalHeaders = ['number', 'imageUrl'];

    const handleDownloadTemplate = () => {
        const worksheet = XLSX.utils.json_to_sheet([
            {
                name: 'Example: Calacatta Gold',
                number: 'T-123 (Optional)',
                size: '60x120',
                surface: 'Glossy',
                conversionFactor: 1.44,
                restockThreshold: 100,
                initialStock: 500,
                imageUrl: 'https://example.com/image.jpg (Optional  )',
            },
        ]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Tiles');
        XLSX.writeFile(workbook, 'Tile_Upload_Template.xlsx');
    };

    const onDrop = useCallback((acceptedFiles) => {
        setFiles(acceptedFiles);
        setApiError('');
        setErrors([]);
        const file = acceptedFiles[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);

                if (json.length > 0) {
                    const headers = Object.keys(json[0]);
                    const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
                    if (missingHeaders.length > 0) {
                        setApiError(`Template error: Missing required columns: ${missingHeaders.join(', ')}`);
                        setParsedData([]);
                        return;
                    }
                }
                setParsedData(json);
            };
            reader.readAsArrayBuffer(file);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
        maxFiles: 1,
    });

    const handleSubmit = async () => {
        setLoading(true);
        setApiError('');
        try {
            // The backend expects an object with a 'tiles' key
            await bulkCreateTiles({ tiles: parsedData });
            onSave();
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData && errorData.errors) {
                setErrors(errorData.errors);
                setApiError('Validation failed. Please fix the errors shown below and re-upload the file.');
            } else {
                setApiError(errorData?.message || 'An unexpected error occurred.');
            }
        } finally {
            setLoading(false);
        }
    };

    const getRowErrors = (rowIndex) => {
        return errors.filter(e => e.rowIndex === rowIndex).map(e => e.errors).flat();
    };

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            {/* The modal background is correct */}
            <div className="bg-white dark:bg-dark-foreground rounded-lg shadow-xl p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    {/* --- FIX #1: Added text color classes to the title --- */}
                    <h2 className="text-2xl font-bold text-text dark:text-dark-text">Bulk Upload Tiles</h2>
                    <button onClick={onClose} className="p-2 rounded-full text-text-secondary dark:text-dark-text-secondary hover:bg-gray-200 dark:hover:bg-dark-border"><X /></button>
                </div>

                {apiError && <p className="text-red-500 bg-red-100 dark:bg-red-900/30 p-3 rounded-md mb-4 text-sm">{apiError}</p>}

                {parsedData.length === 0 ? (
                    <div className="flex-grow flex flex-col items-center justify-center">
                        <div {...getRootProps()} className={`w-full border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 dark:border-dark-border hover:border-primary'}`}>
                            <input {...getInputProps()} />
                            <UploadCloud size={48} className="text-gray-400 dark:text-dark-text-secondary mx-auto mb-4" />
                            {/* --- FIX #2: Added text color classes to the dropzone text --- */}
                            <p className="text-text-secondary dark:text-dark-text-secondary">Drag & drop your .xlsx file here, or click to select</p>
                        </div>
                        <button onClick={handleDownloadTemplate} className="mt-6 flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                            <Download size={18} /> Download Excel Template
                        </button>
                    </div>
                ) : (
                    <>
                        {/* --- FIX #3: Added text color to the preview title --- */}
                        <h3 className="font-semibold mb-2 text-text dark:text-dark-text">Upload Preview</h3>
                        <div className="flex-grow overflow-y-auto border dark:border-dark-border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 dark:bg-dark-background sticky top-0">
                                    {/* --- FIX #4: Added text color to table headers --- */}
                                    <tr>
                                        <th className="p-2 text-left font-medium text-text dark:text-dark-text">Status</th>
                                        {requiredHeaders.map(h => <th key={h} className="p-2 text-left font-medium capitalize text-text dark:text-dark-text">{h}</th>)}
                                        {optionalHeaders.map(h => <th key={h} className="p-2 text-left font-medium capitalize text-text dark:text-dark-text">{h}</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {parsedData.map((row, index) => {
                                        const rowErrors = getRowErrors(index);
                                        const hasError = rowErrors.length > 0;
                                        return (
                                            <tr key={index} className={`border-t dark:border-dark-border ${hasError ? 'bg-red-50 dark:bg-red-900/20' : ''}`}>
                                                <td className="p-2">
                                                    {hasError ? (
                                                        <div className="relative group">
                                                            <AlertTriangle className="text-red-500" />
                                                            <div className="absolute bottom-full left-0 mb-2 w-max max-w-xs bg-black text-white text-xs rounded-md p-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                                                <ul className="list-disc list-inside">
                                                                    {rowErrors.map((err, i) => <li key={i}>{err}</li>)}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <CheckCircle className="text-green-500" />
                                                    )}
                                                </td>
                                                {/* --- FIX #5: Added text color to table data cells --- */}
                                                {requiredHeaders.map(h => <td key={h} className="p-2 truncate max-w-[100px] text-text-secondary dark:text-dark-text-secondary">{row[h]}</td>)}
                                                {optionalHeaders.map(h => <td key={h} className="p-2 truncate max-w-[100px] text-text-secondary dark:text-dark-text-secondary">{row[h]}</td>)}
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                            <button onClick={() => setParsedData([])} className="text-sm text-gray-600 dark:text-dark-text-secondary hover:underline">Upload a different file</button>
                            <button onClick={handleSubmit} disabled={loading || errors.length > 0} className="flex items-center justify-center bg-primary text-white font-semibold py-2 px-6 rounded-md hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed">
                                {loading && <Loader2 size={18} className="animate-spin mr-2" />}
                                {loading ? 'Importing...' : `Import ${parsedData.length} Tiles`}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default BulkUploadModal;
