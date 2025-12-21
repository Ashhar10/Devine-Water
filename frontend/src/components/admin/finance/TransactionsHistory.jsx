import { useState } from 'react';
import { FiArrowUpRight, FiArrowDownLeft, FiFilter, FiDownload } from 'react-icons/fi';

const TransactionsHistory = () => {
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

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                    <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase font-medium text-gray-500 dark:text-gray-400">
                        <tr>
                            <th className="px-6 py-4">Transaction ID</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4">Type</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4 text-right">Amount</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 font-mono text-xs">TXN-2024-00{i}</td>
                                <td className="px-6 py-4">
                                    <div className="font-medium text-gray-900 dark:text-white">
                                        {i % 2 === 0 ? 'Bill Payment - John Doe' : 'Chemical Purchase'}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`flex items-center gap-1 text-xs font-medium ${i % 2 === 0 ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {i % 2 === 0 ? <FiArrowDownLeft /> : <FiArrowUpRight />}
                                        {i % 2 === 0 ? 'Incoming' : 'Outgoing'}
                                    </span>
                                </td>
                                <td className="px-6 py-4">Dec {20 - i}, 2024</td>
                                <td className={`px-6 py-4 text-right font-medium ${i % 2 === 0 ? 'text-green-600' : 'text-gray-900 dark:text-white'
                                    }`}>
                                    {i % 2 === 0 ? '+' : '-'}₨ {i * 1500}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs">Completed</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TransactionsHistory;
