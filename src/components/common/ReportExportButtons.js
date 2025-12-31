// FILE: frontend/src/components/common/ReportExportButtons.js
//
// Reusable export buttons component for PDF and Excel
// Use in any detail modal to add export functionality
//
// Usage:
// <ReportExportButtons 
//     onExportPDF={handleExportPDF}
//     onExportExcel={handleExportExcel}
//     loading={isExporting}
// />

import React, { useState } from 'react';
import { FileText, FileSpreadsheet, Download, Loader2, ChevronDown } from 'lucide-react';

const ReportExportButtons = ({ 
    onExportPDF, 
    onExportExcel, 
    loading = false,
    variant = 'buttons', // 'buttons' | 'dropdown' | 'icons'
    size = 'default', // 'small' | 'default'
    className = '',
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [exportingType, setExportingType] = useState(null);

    const handleExport = async (type, handler) => {
        if (!handler || loading) return;
        setExportingType(type);
        try {
            await handler();
        } finally {
            setExportingType(null);
        }
    };

    const isExporting = loading || exportingType !== null;

    // Icon-only variant
    if (variant === 'icons') {
        return (
            <div className={`flex items-center gap-1 ${className}`}>
                <button
                    onClick={() => handleExport('pdf', onExportPDF)}
                    disabled={isExporting}
                    className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 disabled:opacity-50 transition-colors"
                    title="Export as PDF"
                >
                    {exportingType === 'pdf' ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                </button>
                <button
                    onClick={() => handleExport('excel', onExportExcel)}
                    disabled={isExporting}
                    className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 disabled:opacity-50 transition-colors"
                    title="Export as Excel"
                >
                    {exportingType === 'excel' ? <Loader2 size={18} className="animate-spin" /> : <FileSpreadsheet size={18} />}
                </button>
            </div>
        );
    }

    // Dropdown variant
    if (variant === 'dropdown') {
        return (
            <div className={`relative ${className}`}>
                <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    disabled={isExporting}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border border-border dark:border-dark-border bg-foreground dark:bg-dark-foreground text-text dark:text-dark-text hover:bg-gray-50 dark:hover:bg-dark-border disabled:opacity-50 transition-colors ${size === 'small' ? 'text-sm' : ''}`}
                >
                    {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Export
                    <ChevronDown size={14} className={`transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showDropdown && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowDropdown(false)} />
                        <div className="absolute right-0 mt-1 w-48 bg-foreground dark:bg-dark-foreground border border-border dark:border-dark-border rounded-lg shadow-xl z-20 overflow-hidden">
                            <button
                                onClick={() => { handleExport('pdf', onExportPDF); setShowDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-border transition-colors"
                            >
                                <FileText size={18} className="text-red-500" />
                                <div>
                                    <p className="font-medium text-text dark:text-dark-text">Export PDF</p>
                                    <p className="text-xs text-text-secondary">For printing</p>
                                </div>
                            </button>
                            <button
                                onClick={() => { handleExport('excel', onExportExcel); setShowDropdown(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-dark-border transition-colors border-t border-border dark:border-dark-border"
                            >
                                <FileSpreadsheet size={18} className="text-green-500" />
                                <div>
                                    <p className="font-medium text-text dark:text-dark-text">Export Excel</p>
                                    <p className="text-xs text-text-secondary">For analysis</p>
                                </div>
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    // Default buttons variant
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <button
                onClick={() => handleExport('pdf', onExportPDF)}
                disabled={isExporting}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors ${size === 'small' ? 'text-sm px-2.5 py-1.5' : ''}`}
            >
                {exportingType === 'pdf' ? <Loader2 size={16} className="animate-spin" /> : <FileText size={16} />}
                <span className={size === 'small' ? 'hidden sm:inline' : ''}>PDF</span>
            </button>
            <button
                onClick={() => handleExport('excel', onExportExcel)}
                disabled={isExporting}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 disabled:opacity-50 transition-colors ${size === 'small' ? 'text-sm px-2.5 py-1.5' : ''}`}
            >
                {exportingType === 'excel' ? <Loader2 size={16} className="animate-spin" /> : <FileSpreadsheet size={16} />}
                <span className={size === 'small' ? 'hidden sm:inline' : ''}>Excel</span>
            </button>
        </div>
    );
};

export default ReportExportButtons;