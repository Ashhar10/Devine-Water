import { useState } from 'react';
import { FiPieChart, FiDollarSign, FiTrendingUp, FiDownload } from 'react-icons/fi';
import { Bar, Doughnut } from 'react-chartjs-2';

const ExpenditureTracking = () => {
    // Mock data for charts
    const expenseData = {
        labels: ['Chemicals', 'Maintenance', 'Salaries', 'Utility', 'Marketing'],
        datasets: [{
            data: [25000, 18000, 120000, 45000, 12000],
            backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'],
            borderWidth: 0
        }]
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenditure Tracking</h1>
                    <p className="text-gray-600 dark:text-gray-400">Monitor and categorize company expenses</p>
                </div>
                <button className="btn-primary flex items-center gap-2">
                    <FiDownload /> Export Report
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="text-gray-500 text-sm mb-1">Total Expenses (Dec)</div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">₨ 220,000</div>
                    <div className="text-green-500 text-xs mt-2 flex items-center">
                        <FiTrendingUp className="mr-1" /> +12% from last month
                    </div>
                </div>
                {/* Add more cards */}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Expense Breakdown</h3>
                    <div className="h-64 flex justify-center">
                        <Doughnut data={expenseData} options={{ maintainAspectRatio: false }} />
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold mb-6 text-gray-900 dark:text-white">Recent Expenses</h3>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center">
                                        <FiDollarSign />
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-900 dark:text-white">Chemical Purchase</div>
                                        <div className="text-xs text-gray-500">AquaPure Supplies • Dec 20</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-medium text-gray-900 dark:text-white">-₨ 25,000</div>
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-0.5 rounded-full">Approved</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-4 text-center text-primary-600 text-sm font-medium hover:underline">View All Expenses</button>
                </div>
            </div>
        </div>
    );
};

export default ExpenditureTracking;
