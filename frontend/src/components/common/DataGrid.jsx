import { useMemo } from 'react';
import { LyteNyteGrid, useGridState } from '@1771technologies/lytenyte-core';
import '@1771technologies/lytenyte-core/grid.css';

/**
 * DataGrid - High-performance data grid wrapper using LyteNyte Grid
 * 
 * @param {Object} props
 * @param {Array} props.data - Array of row data objects
 * @param {Array} props.columns - Column definitions [{ field, headerName, width?, sortable? }]
 * @param {Function} props.onRowClick - Callback when a row is clicked
 * @param {string} props.className - Additional CSS classes
 */
const DataGrid = ({
    data = [],
    columns = [],
    onRowClick,
    className = '',
    height = 500,
    ...rest
}) => {
    // Transform columns to LyteNyte format
    const columnDefs = useMemo(() => columns.map(col => ({
        field: col.field,
        headerName: col.headerName || col.field,
        width: col.width || 150,
        sortable: col.sortable !== false,
        filter: col.filter !== false,
        ...col, // Allow overrides
    })), [columns]);

    // Initialize grid state
    const gridState = useGridState({
        columnDefs,
        rowData: data,
        defaultColDef: {
            sortable: true,
            filter: true,
            resizable: true,
        },
    });

    return (
        <div
            className={`data-grid-wrapper ${className}`}
            style={{
                height: `${height}px`,
                width: '100%',
                borderRadius: 'var(--radius-lg, 12px)',
                overflow: 'hidden',
                border: '1px solid var(--glass-border, rgba(255,255,255,0.1))',
            }}
        >
            <LyteNyteGrid
                state={gridState}
                onRowClick={onRowClick}
                {...rest}
            />
        </div>
    );
};

export default DataGrid;
