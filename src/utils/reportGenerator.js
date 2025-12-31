// FILE: frontend/src/utils/reportGenerator.js
//
// Reusable PDF and Excel report generator utility
//
// Required packages:
// npm install jspdf jspdf-autotable xlsx file-saver

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// =============================================
// PDF GENERATION
// =============================================
export const generatePDFReport = ({
    title,
    subtitle = '',
    headerInfo = [],
    summaryData = [],
    tableColumns = [],
    tableData = [],
    fileName = 'report',
    orientation = 'portrait',
}) => {
    try {
        const doc = new jsPDF(orientation, 'mm', 'a4');
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 14;

        // Colors
        const primaryColor = [99, 102, 241];
        const textDark = [31, 41, 55];
        const textLight = [107, 114, 128];
        const successColor = [16, 185, 129];
        const warningColor = [245, 158, 11];
        const dangerColor = [239, 68, 68];

        let yPos = 0;

        // ===== HEADER SECTION =====
        doc.setFillColor(...primaryColor);
        doc.rect(0, 0, pageWidth, 32, 'F');

        doc.setTextColor(255, 255, 255);
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(title || 'Report', margin, 14);

        if (subtitle) {
            doc.setFontSize(11);
            doc.setFont('helvetica', 'normal');
            doc.text(String(subtitle), margin, 22);
        }

        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('MEGA INDIA', pageWidth - margin, 12, { align: 'right' });
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, pageWidth - margin, 18, { align: 'right' });

        yPos = 40;

        // ===== HEADER INFO SECTION =====
        if (headerInfo.length > 0) {
            const rows = Math.ceil(headerInfo.length / 3);
            doc.setFillColor(249, 250, 251);
            doc.rect(margin, yPos - 4, pageWidth - 2 * margin, rows * 12 + 8, 'F');
            doc.setDrawColor(229, 231, 235);
            doc.rect(margin, yPos - 4, pageWidth - 2 * margin, rows * 12 + 8, 'S');

            const colWidth = (pageWidth - 2 * margin) / 3;
            headerInfo.forEach((item, idx) => {
                const col = idx % 3;
                const row = Math.floor(idx / 3);
                const xPos = margin + 4 + col * colWidth;
                const yPosition = yPos + 4 + row * 12;

                doc.setTextColor(...textLight);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(String(item.label || ''), xPos, yPosition);

                doc.setTextColor(...textDark);
                doc.setFontSize(10);
                doc.setFont('helvetica', 'bold');
                const value = item.value !== null && item.value !== undefined ? String(item.value) : '-';
                doc.text(value, xPos, yPosition + 5);
            });

            yPos += rows * 12 + 12;
        }

        // ===== SUMMARY SECTION =====
        if (summaryData.length > 0) {
            doc.setTextColor(...textDark);
            doc.setFontSize(12);
            doc.setFont('helvetica', 'bold');
            doc.text('Summary', margin, yPos);
            yPos += 8;

            const cols = Math.min(summaryData.length, 4);
            const summaryColWidth = (pageWidth - 2 * margin) / cols;
            
            summaryData.forEach((item, idx) => {
                const col = idx % 4;
                const row = Math.floor(idx / 4);
                const xPos = margin + col * summaryColWidth;
                const yPosition = yPos + row * 16;

                const bgColor = item.color === 'green' ? [236, 253, 245] :
                               item.color === 'blue' ? [239, 246, 255] :
                               item.color === 'purple' ? [245, 243, 255] :
                               item.color === 'orange' ? [255, 247, 237] :
                               item.color === 'red' ? [254, 242, 242] :
                               [249, 250, 251];
                
                doc.setFillColor(...bgColor);
                doc.roundedRect(xPos, yPosition - 2, summaryColWidth - 4, 14, 2, 2, 'F');

                doc.setTextColor(...textLight);
                doc.setFontSize(8);
                doc.setFont('helvetica', 'normal');
                doc.text(String(item.label || ''), xPos + 3, yPosition + 3);

                const valueColor = item.color === 'green' ? successColor :
                                  item.color === 'red' ? dangerColor :
                                  item.color === 'orange' ? warningColor :
                                  textDark;
                doc.setTextColor(...valueColor);
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                const val = item.value !== null && item.value !== undefined ? String(item.value) : '-';
                doc.text(val, xPos + 3, yPosition + 10);
            });

            yPos += Math.ceil(summaryData.length / 4) * 16 + 8;
        }

        // ===== TABLE SECTION =====
        if (tableColumns.length > 0 && tableData.length > 0) {
            // Use autoTable directly as a function
            autoTable(doc, {
                startY: yPos,
                head: [tableColumns.map(col => col.header)],
                body: tableData.map(row => tableColumns.map(col => {
                    const value = row[col.key];
                    if (value === null || value === undefined) return '-';
                    if (typeof value === 'object') return JSON.stringify(value);
                    return String(value);
                })),
                theme: 'striped',
                headStyles: {
                    fillColor: primaryColor,
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    fontSize: 9,
                    cellPadding: 4,
                },
                bodyStyles: {
                    fontSize: 8,
                    textColor: textDark,
                    cellPadding: 3,
                },
                alternateRowStyles: {
                    fillColor: [249, 250, 251],
                },
                margin: { left: margin, right: margin },
                styles: {
                    overflow: 'linebreak',
                    lineWidth: 0.1,
                },
            });
        }

        // ===== FOOTER =====
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
            doc.setPage(i);
            doc.setFontSize(8);
            doc.setTextColor(...textLight);
            doc.text(`Page ${i} of ${totalPages}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
            doc.text('Mega India - Inventory Management System', margin, pageHeight - 10);
            doc.text(new Date().toLocaleDateString('en-IN'), pageWidth - margin, pageHeight - 10, { align: 'right' });
        }

        // Save
        const safeFileName = String(fileName).replace(/[^a-zA-Z0-9_-]/g, '_');
        doc.save(`${safeFileName}_${new Date().toISOString().split('T')[0]}.pdf`);
        return true;
    } catch (error) {
        console.error('PDF Generation Error:', error);
        alert('Failed to generate PDF: ' + error.message);
        return false;
    }
};

// =============================================
// EXCEL GENERATION
// =============================================
export const generateExcelReport = ({
    title,
    headerInfo = [],
    summaryData = [],
    tableColumns = [],
    tableData = [],
    fileName = 'report',
    sheetName = 'Report',
}) => {
    try {
        const wb = XLSX.utils.book_new();
        const wsData = [];

        // Title
        wsData.push([title || 'Report']);
        wsData.push([`Generated: ${new Date().toLocaleString('en-IN')}`]);
        wsData.push([]);

        // Header Info
        if (headerInfo.length > 0) {
            headerInfo.forEach(item => {
                const value = item.value !== null && item.value !== undefined ? item.value : '-';
                wsData.push([String(item.label || ''), typeof value === 'object' ? JSON.stringify(value) : value]);
            });
            wsData.push([]);
        }

        // Summary
        if (summaryData.length > 0) {
            wsData.push(['Summary']);
            summaryData.forEach(item => {
                const value = item.value !== null && item.value !== undefined ? item.value : '-';
                wsData.push([String(item.label || ''), typeof value === 'object' ? JSON.stringify(value) : value]);
            });
            wsData.push([]);
        }

        // Table Headers
        if (tableColumns.length > 0) {
            wsData.push(tableColumns.map(col => col.header));

            // Table Data
            tableData.forEach(row => {
                wsData.push(tableColumns.map(col => {
                    const value = row[col.key];
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'object') return JSON.stringify(value);
                    return value;
                }));
            });
        }

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Set column widths
        if (tableColumns.length > 0) {
            ws['!cols'] = tableColumns.map(col => ({ wch: col.width ? Math.floor(col.width / 3) : 15 }));
        }

        // Safe sheet name (max 31 chars, no special chars)
        const safeSheetName = String(sheetName).replace(/[^a-zA-Z0-9 ]/g, '').substring(0, 31) || 'Report';
        XLSX.utils.book_append_sheet(wb, ws, safeSheetName);

        // Save
        const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const safeFileName = String(fileName).replace(/[^a-zA-Z0-9_-]/g, '_');
        saveAs(new Blob([wbout], { type: 'application/octet-stream' }), 
            `${safeFileName}_${new Date().toISOString().split('T')[0]}.xlsx`);

        return true;
    } catch (error) {
        console.error('Excel Generation Error:', error);
        alert('Failed to generate Excel: ' + error.message);
        return false;
    }
};

// =============================================
// FORMAT HELPERS
// =============================================
export const formatDate = (date) => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    } catch {
        return '-';
    }
};

export const formatDateTime = (date) => {
    if (!date) return '-';
    try {
        return new Date(date).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch {
        return '-';
    }
};

export const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return Number(num).toLocaleString('en-IN');
};

export default {
    generatePDFReport,
    generateExcelReport,
    formatDate,
    formatDateTime,
    formatNumber,
};