import * as XLSX from 'xlsx';

/**
 * Utility to export JavaScript array objects into clean, formatted Excel (.xlsx) files.
 * @param {Array} data - List of objects to export
 * @param {String} fileName - Desired file name without extension
 * @param {String} sheetName - Excel sheet tab name
 */
export const exportToExcel = (data, fileName = 'Barangay_Report', sheetName = 'Report') => {
  if (!data || data.length === 0) {
    throw new Error('No data available to export');
  }

  // Create a new worksheet from array of objects
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths
  const colWidths = Object.keys(data[0]).map((key) => {
    const maxLength = Math.max(
      key.length,
      ...data.map((row) => (row[key] ? row[key].toString().length : 0))
    );
    return { wch: Math.min(Math.max(maxLength + 3, 12), 40) };
  });
  worksheet['!cols'] = colWidths;

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Trigger file download in browser
  XLSX.writeFile(workbook, `${fileName}_${new Date().toISOString().split('T')[0]}.xlsx`);
};
