import { useState, useMemo } from 'react';
import { FiArrowUpRight, FiArrowDownLeft, FiFilter, FiDownload } from 'react-icons/fi';
import DataGrid from '../../common/DataGrid';

const TransactionsHistory = () => {
    // Mock transaction data
    const transactions = useMemo(() => [
        { id: 'TXN-2024-001', description: 'Bill Payment - John Doe', type: 'incoming', date: 'Dec 19, 2024', amount: 1500, status: 'Completed' },
        { id: 'TXN-2024-002', description: 'Chemical Purchase', type: 'outgoing', date: 'Dec 18, 2024', amount: -3000, status: 'Completed' },
        { id: 'TXN-2024-003', description: 'Bill Payment - Sarah Connor', type: 'incoming', date: 'Dec 17, 2024', amount: 4500, status: 'Completed' },
        { id: 'TXN-2024-004', description: 'Equipment Repair', type: 'outgoing', date: 'Dec 16, 2024', amount: -6000, status: 'Pending' },
        { id: 'TXN-2024-005', description: 'Bill Payment - Mike Ross', type: 'incoming', date: 'Dec 15, 2024', amount: 7500, status: 'Completed' },
    ], []);

    const columns = useMemo(() => [
        { field: 'id', headerName: 'Transaction ID', width: 150 },
        { field: 'description', headerName: 'Description', width: 250 },
        { field: 'type', headerName: 'Type', width: 100 },
        { field: 'date', headerName: 'Date', width: 130 },
        { field: 'amount', headerName: 'Amount (PKR)', width: 130 },
        { field: 'status', headerName: 'Status', width: 100 },
    ], []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h1>
                    <p className="text-gray-600 dark:text-gray-400">Financial records of all cash flows</p>
                </div>
                <div className="flex gap-2">
                    <button className="btn-secondary flex items-center gap-2">
                        <FiFilter /> Filter
                    </button>
                    <button className="btn-primary flex items-center gap-2">
                        <FiDownload /> Export CSV
                    </button>
                </div>
            </div>

            {/* Transactions Table - Using LyteNyte DataGrid */}
            <DataGrid
                data={transactions}
                columns={columns}
                height={450}
            />
        </div>
    );
};

export default TransactionsHistory;
