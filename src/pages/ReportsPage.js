// FILE: frontend/src/pages/ReportsPage.js
// Reports Center - Generate PDF and Excel reports for all India module entities
// Field names match the backend reportController.js

import React, { useState } from 'react';
import { 
    FileText, FileSpreadsheet, Download, Loader2, Eye, X, AlertCircle,
    Layers, Factory, Warehouse, Package, ClipboardList, Inbox, Ship, Truck, Box
} from 'lucide-react';
import api from '../api/api';
import { generatePDFReport, generateExcelReport } from '../utils/reportGenerator';

// Helper to flatten summary objects for display (handles nested objects)
const flattenSummary = (summary) => {
    if (!summary || typeof summary !== 'object') return [];
    
    const result = [];
    Object.entries(summary).forEach(([key, value]) => {
        // Skip if value is an object (like statusBreakdown maps)
        if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
            return; // Skip nested objects entirely
        }
        if (typeof value === 'number' || typeof value === 'string') {
            result.push({
                key,
                label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim(),
                value: value,
            });
        }
    });
    return result;
};

// Column definitions for each report type - matches backend field names
const getColumnsForReport = (reportType) => {
    const columns = {
        tiles: [
            { key: 'sNo', header: 'S.No', width: 15 },
            { key: 'tileNumber', header: 'Tile No', width: 30 },
            { key: 'name', header: 'Name', width: 45 },
            { key: 'size', header: 'Size', width: 25 },
            { key: 'surface', header: 'Surface', width: 25 },
            { key: 'availableStock', header: 'Available', width: 25 },
            { key: 'bookedStock', header: 'Booked', width: 25 },
            { key: 'restockingStock', header: 'Restocking', width: 25 },
            { key: 'inFactoryStock', header: 'In Factory', width: 25 },
            { key: 'restockThreshold', header: 'Min Stock', width: 25 },
            { key: 'status', header: 'Status', width: 25 },
        ],
        factories: [
            { key: 'sNo', header: 'S.No', width: 15 },
            { key: 'name', header: 'Factory Name', width: 50 },
            { key: 'contactPerson', header: 'Contact', width: 35 },
            { key: 'address', header: 'Address', width: 60 },
            { key: 'pallets', header: 'Pallets', width: 25 },
            { key: 'khatlis', header: 'Khatlis', width: 25 },
            { key: 'totalBoxes', header: 'Total Boxes', width: 30 },
        ],
        factoryStock: [
            { key: 'sNo', header: 'S.No', width: 15 },
            { key: 'palletId', header: 'Pallet ID', width: 35 },
            { key: 'type', header: 'Type', width: 25 },
            { key: 'tileName', header: 'Tile Name', width: 45 },
            { key: 'tileNumber', header: 'Tile No', width: 30 },
            { key: 'size', header: 'Size', width: 25 },
            { key: 'boxCount', header: 'Boxes', width: 25 },
            { key: 'factoryName', header: 'Factory', width: 40 },
        ],
        containers: [
            { key: 'sNo', header: 'S.No', width: 15 },
            { key: 'containerId', header: 'Container ID', width: 35 },
            { key: 'containerNumber', header: 'Container No', width: 35 },
            { key: 'truckNumber', header: 'Truck No', width: 30 },
            { key: 'factoryName', header: 'Factory', width: 40 },
            { key: 'status', header: 'Status', width: 30 },
            { key: 'palletCount', header: 'Pallets', width: 25 },
            { key: 'khatliCount', header: 'Khatlis', width: 25 },
            { key: 'totalBoxes', header: 'Boxes', width: 25 },
        ],
        purchaseOrders: [
            { key: 'sNo', header: 'S.No', width: 15 },
            { key: 'poId', header: 'PO ID', width: 35 },
            { key: 'factoryName', header: 'Factory', width: 40 },
            { key: 'restockRequestId', header: 'Restock Req', width: 35 },
            { key: 'status', header: 'Status', width: 30 },
            { key: 'itemCount', header: 'Items', width: 20 },
            { key: 'totalPallets', header: 'Pallets', width: 25 },
            { key: 'totalKhatlis', header: 'Khatlis', width: 25 },
            { key: 'totalBoxes', header: 'Boxes', width: 25 },
            { key: 'qcProgress', header: 'QC %', width: 20 },
        ],
        restockRequests: [
            { key: 'sNo', header: 'S.No', width: 15 },
            { key: 'requestId', header: 'Request ID', width: 35 },
            { key: 'status', header: 'Status', width: 30 },
            { key: 'itemCount', header: 'Items', width: 20 },
            { key: 'totalQuantity', header: 'Requested', width: 25 },
            { key: 'quantityShipped', header: 'Shipped', width: 25 },
            { key: 'quantityArrived', header: 'Arrived', width: 25 },
            { key: 'requestedBy', header: 'Requested By', width: 35 },
        ],
        loadingPlans: [
            { key: 'sNo', header: 'S.No', width: 15 },
            { key: 'planId', header: 'Plan ID', width: 35 },
            { key: 'factoryName', header: 'Factory', width: 40 },
            { key: 'loadingDate', header: 'Loading Date', width: 30 },
            { key: 'status', header: 'Status', width: 30 },
            { key: 'containerCount', header: 'Containers', width: 25 },
            { key: 'createdBy', header: 'Created By', width: 35 },
        ],
        dispatches: [
            { key: 'sNo', header: 'S.No', width: 15 },
            { key: 'dispatchNumber', header: 'Dispatch No', width: 35 },
            { key: 'destination', header: 'Destination', width: 40 },
            { key: 'status', header: 'Status', width: 30 },
            { key: 'dispatchDate', header: 'Dispatch Date', width: 30 },
            { key: 'containerCount', header: 'Containers', width: 25 },
            { key: 'palletCount', header: 'Pallets', width: 25 },
            { key: 'khatliCount', header: 'Khatlis', width: 25 },
            { key: 'totalBoxes', header: 'Boxes', width: 25 },
        ],
        inventory: [
            { key: 'sNo', header: 'S.No', width: 15 },
            { key: 'tileName', header: 'Tile Name', width: 45 },
            { key: 'tileNumber', header: 'Tile No', width: 30 },
            { key: 'size', header: 'Size', width: 25 },
            { key: 'surface', header: 'Surface', width: 25 },
            { key: 'factoryName', header: 'Factory', width: 40 },
            { key: 'type', header: 'Type', width: 25 },
            { key: 'count', header: 'Count', width: 20 },
            { key: 'totalBoxes', header: 'Total Boxes', width: 30 },
        ],
    };
    return columns[reportType] || [];
};

// Report Card Component
const ReportCard = ({ title, description, icon: Icon, color, reportType, endpoint }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);

    const colorClasses = {
        blue: 'from-blue-500 to-blue-600',
        green: 'from-green-500 to-green-600',
        purple: 'from-purple-500 to-purple-600',
        orange: 'from-orange-500 to-orange-600',
        cyan: 'from-cyan-500 to-cyan-600',
        pink: 'from-pink-500 to-pink-600',
        indigo: 'from-indigo-500 to-indigo-600',
        teal: 'from-teal-500 to-teal-600',
    };

    const fetchReport = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.get(endpoint);
            return response?.data;
        } catch (err) {
            console.error('Report fetch error:', err);
            setError(err?.response?.data?.message || 'Failed to fetch report data');
            return null;
        } finally {
            setLoading(false);
        }
    };

    const handlePreview = async () => {
        const data = await fetchReport();
        if (data) {
            setPreviewData(data);
            setShowPreview(true);
        }
    };

    const handleDownloadPDF = async () => {
        const data = previewData || await fetchReport();
        if (!data) return;

        const columns = getColumnsForReport(reportType);
        const tableData = data.reportData || [];
        const summaryItems = flattenSummary(data.summary).slice(0, 8);

        generatePDFReport({
            title: title,
            subtitle: `Generated on ${new Date().toLocaleString('en-IN')}`,
            headerInfo: [
                { label: 'Report Type', value: title },
                { label: 'Total Records', value: tableData.length },
                { label: 'Generated', value: new Date().toLocaleString('en-IN') },
            ],
            summaryData: summaryItems.map(item => ({
                ...item,
                value: typeof item.value === 'number' ? item.value.toLocaleString() : String(item.value),
                color: 'blue',
            })),
            tableColumns: columns,
            tableData: tableData,
            fileName: `${reportType}_report`,
            orientation: 'landscape',
        });
    };

    const handleDownloadExcel = async () => {
        const data = previewData || await fetchReport();
        if (!data) return;

        const columns = getColumnsForReport(reportType);
        const tableData = data.reportData || [];
        const summaryItems = flattenSummary(data.summary).slice(0, 8);

        generateExcelReport({
            title: title,
            headerInfo: [
                { label: 'Report Type', value: title },
                { label: 'Total Records', value: tableData.length },
            ],
            summaryData: summaryItems,
            tableColumns: columns,
            tableData: tableData,
            fileName: `${reportType}_report`,
            sheetName: title.substring(0, 30),
        });
    };

    // Get flattened summary for preview
    const summaryItems = previewData ? flattenSummary(previewData.summary) : [];

    return (
        <>
            <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-lg overflow-hidden border border-border dark:border-dark-border">
                {/* Header */}
                <div className={`bg-gradient-to-r ${colorClasses[color]} p-4`}>
                    <div className="flex items-center gap-3 text-white">
                        <Icon size={24} />
                        <div>
                            <h3 className="font-bold text-lg">{title}</h3>
                            <p className="text-sm text-white/80">{description}</p>
                        </div>
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                        <AlertCircle size={14} />
                        {error}
                    </div>
                )}

                {/* Actions */}
                <div className="p-4 flex items-center gap-2">
                    <button
                        onClick={handlePreview}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />}
                        Preview
                    </button>
                    <button
                        onClick={handleDownloadPDF}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <FileText size={16} />
                        PDF
                    </button>
                    <button
                        onClick={handleDownloadExcel}
                        disabled={loading}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors disabled:opacity-50"
                    >
                        <FileSpreadsheet size={16} />
                        Excel
                    </button>
                </div>
            </div>

            {/* Preview Modal */}
            {showPreview && previewData && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowPreview(false)}>
                    <div className="bg-foreground dark:bg-dark-foreground rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        {/* Header */}
                        <div className="flex justify-between items-center p-4 border-b border-border dark:border-dark-border">
                            <h2 className="text-xl font-bold text-text dark:text-dark-text">{title} Preview</h2>
                            <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-dark-border rounded-full">
                                <X size={20} className="text-text-secondary" />
                            </button>
                        </div>

                        {/* Summary */}
                        {summaryItems.length > 0 && (
                            <div className="p-4 bg-gray-50 dark:bg-dark-background border-b border-border dark:border-dark-border">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {summaryItems.slice(0, 8).map((item) => (
                                        <div key={item.key} className="bg-white dark:bg-dark-foreground p-3 rounded-lg">
                                            <p className="text-xs text-text-secondary">{item.label}</p>
                                            <p className="text-lg font-bold text-text dark:text-dark-text">
                                                {typeof item.value === 'number' ? item.value.toLocaleString() : String(item.value)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Table */}
                        <div className="flex-1 overflow-auto p-4">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 dark:bg-dark-background sticky top-0">
                                    <tr>
                                        {getColumnsForReport(reportType).map(col => (
                                            <th key={col.key} className="px-3 py-2 text-left font-semibold text-text dark:text-dark-text">
                                                {col.header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border dark:divide-dark-border">
                                    {(previewData.reportData || []).slice(0, 50).map((row, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-dark-background">
                                            {getColumnsForReport(reportType).map(col => (
                                                <td key={col.key} className="px-3 py-2 text-text dark:text-dark-text">
                                                    {row[col.key] !== undefined && row[col.key] !== null ? String(row[col.key]) : '-'}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {(previewData.reportData?.length || 0) > 50 && (
                                <p className="text-center text-text-secondary mt-4 text-sm">
                                    Showing first 50 of {previewData.reportData.length} records
                                </p>
                            )}
                            {(!previewData.reportData || previewData.reportData.length === 0) && (
                                <p className="text-center text-text-secondary mt-8 text-sm">
                                    No records found
                                </p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-border dark:border-dark-border flex justify-end gap-2">
                            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                <FileText size={16} /> Download PDF
                            </button>
                            <button onClick={handleDownloadExcel} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                <FileSpreadsheet size={16} /> Download Excel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

// Main Reports Page
const ReportsPage = () => {
    const reports = [
        { title: 'Tiles Report', description: 'Complete tile inventory with stock levels', icon: Layers, color: 'blue', reportType: 'tiles', endpoint: '/reports/tiles' },
        { title: 'Factories Report', description: 'All factories with stock summary', icon: Factory, color: 'green', reportType: 'factories', endpoint: '/reports/factories' },
        { title: 'Factory Stock Report', description: 'Detailed pallet/khatli stock in factories', icon: Warehouse, color: 'purple', reportType: 'factoryStock', endpoint: '/reports/factory-stock' },
        { title: 'Containers Report', description: 'All containers with status and contents', icon: Package, color: 'cyan', reportType: 'containers', endpoint: '/reports/containers' },
        { title: 'Purchase Orders Report', description: 'All POs with production status', icon: ClipboardList, color: 'indigo', reportType: 'purchaseOrders', endpoint: '/reports/purchase-orders' },
        { title: 'Restock Requests Report', description: 'Incoming restock requests from Dubai', icon: Inbox, color: 'orange', reportType: 'restockRequests', endpoint: '/reports/restock-requests' },
        { title: 'Loading Plans Report', description: 'All loading plans with containers', icon: Ship, color: 'teal', reportType: 'loadingPlans', endpoint: '/reports/loading-plans' },
        { title: 'Dispatches Report', description: 'All dispatches with delivery status', icon: Truck, color: 'pink', reportType: 'dispatches', endpoint: '/reports/dispatches' },
        { title: 'Inventory Report', description: 'Complete inventory by tile and factory', icon: Box, color: 'blue', reportType: 'inventory', endpoint: '/reports/inventory' },
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <FileText size={28} className="text-primary" />
                    <h1 className="text-2xl font-bold text-text dark:text-dark-text">Reports Center</h1>
                </div>
                <p className="text-text-secondary dark:text-dark-text-secondary">
                    Generate and download reports in PDF or Excel format
                </p>
            </div>

            {/* Info Banner */}
            <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
                <div className="flex items-center gap-3">
                    <Download size={20} className="text-blue-600" />
                    <div>
                        <p className="font-semibold text-blue-800 dark:text-blue-300">Export Options</p>
                        <p className="text-sm text-blue-600 dark:text-blue-400">
                            Preview data before downloading. Export as PDF for printing or Excel for data analysis.
                        </p>
                    </div>
                </div>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map(report => (
                    <ReportCard key={report.reportType} {...report} />
                ))}
            </div>

            {/* Instructions */}
            <div className="mt-8 p-6 bg-foreground dark:bg-dark-foreground rounded-xl border border-border dark:border-dark-border">
                <h3 className="font-bold text-text dark:text-dark-text mb-4">How to Use Reports</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="flex items-start gap-3">
                        <Eye size={20} className="text-text-secondary mt-0.5" />
                        <div>
                            <p className="font-semibold text-text dark:text-dark-text">Preview</p>
                            <p className="text-sm text-text-secondary">View report data in a table format before downloading</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <FileText size={20} className="text-red-500 mt-0.5" />
                        <div>
                            <p className="font-semibold text-text dark:text-dark-text">PDF Export</p>
                            <p className="text-sm text-text-secondary">Professional formatted report for printing or sharing</p>
                        </div>
                    </div>
                    <div className="flex items-start gap-3">
                        <FileSpreadsheet size={20} className="text-green-500 mt-0.5" />
                        <div>
                            <p className="font-semibold text-text dark:text-dark-text">Excel Export</p>
                            <p className="text-sm text-text-secondary">Spreadsheet format for data analysis and manipulation</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportsPage;