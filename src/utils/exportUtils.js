import * as XLSX from 'xlsx';

/**
 * Downloads data as an Excel file (.xlsx)
 * @param {Array} data - Array of objects to export
 * @param {string} fileName - Desired file name
 * @param {string} sheetName - Name of the worksheet
 */
export const downloadAsExcel = (data, fileName = 'DataExport', sheetName = 'Sheet1') => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Generate buffer and trigger download
    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${fileName}_${date}.xlsx`);
};

/**
 * Downloads multiple data sets as a single Excel file with multiple sheets
 * @param {Object} sheets - Object where keys are sheet names and values are data arrays
 * @param {string} fileName - Desired file name
 */
export const downloadMultipleAsExcel = (sheets, fileName = 'MultiReportExport') => {
    const workbook = XLSX.utils.book_new();

    Object.entries(sheets).forEach(([sheetName, data]) => {
        if (data && data.length > 0) {
            const worksheet = XLSX.utils.json_to_sheet(data);
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        }
    });

    const date = new Date().toISOString().split('T')[0];
    XLSX.writeFile(workbook, `${fileName}_${date}.xlsx`);
};

/**
 * Downloads data as a SQL file (.sql)
 * @param {Array} data - Array of objects to export
 * @param {string} tableName - Name of the DB table
 * @param {string} fileName - Desired file name
 */
export const downloadAsSQL = (data, tableName, fileName = 'DatabaseDump') => {
    if (!data || data.length === 0) return;

    let sqlContent = `-- SQL Dump generated for table: ${tableName}\n`;
    sqlContent += `-- Generated on: ${new Date().toLocaleString()}\n\n`;

    data.forEach(item => {
        const columns = Object.keys(item).join(', ');
        const values = Object.values(item).map(val => {
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
            return val;
        }).join(', ');

        sqlContent += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
    });

    const blob = new Blob([sqlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];

    link.href = url;
    link.download = `${fileName}_${date}.sql`;
    link.click();
    URL.revokeObjectURL(url);
};

/**
 * Downloads multiple data sets as a single SQL file
 * @param {Object} sections - Object where keys are table names and values are data arrays
 * @param {string} fileName - Desired file name
 */
export const downloadMultipleAsSQL = (sections, fileName = 'MultiTableDump') => {
    let sqlContent = `-- Multi-Table SQL Dump\n`;
    sqlContent += `-- Generated on: ${new Date().toLocaleString()}\n\n`;

    Object.entries(sections).forEach(([tableName, data]) => {
        if (data && data.length > 0) {
            sqlContent += `-- Table: ${tableName}\n`;
            data.forEach(item => {
                const columns = Object.keys(item).join(', ');
                const values = Object.values(item).map(val => {
                    if (val === null || val === undefined) return 'NULL';
                    if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
                    if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
                    return val;
                }).join(', ');

                sqlContent += `INSERT INTO ${tableName} (${columns}) VALUES (${values});\n`;
            });
            sqlContent += `\n`;
        }
    });

    const blob = new Blob([sqlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const date = new Date().toISOString().split('T')[0];

    link.href = url;
    link.download = `${fileName}_${date}.sql`;
    link.click();
    URL.revokeObjectURL(url);
};
