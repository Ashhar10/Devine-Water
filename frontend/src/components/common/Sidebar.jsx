import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
    FiHome, FiUsers, FiShoppingBag, FiBriefcase,
    FiDollarSign, FiActivity, FiPieChart, FiSettings,
    FiLogOut
} from 'react-icons/fi';
import config from '../../config';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();

    const isActive = (path) => location.pathname.startsWith(path);

    const menuItems = [
        { path: '/admin/dashboard', icon: <FiHome />, label: 'Dashboard', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/customers', icon: <FiUsers />, label: 'Customers', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/vendors', icon: <FiShoppingBag />, label: 'Vendors', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/employees', icon: <FiBriefcase />, label: 'Employees', roles: ['ADMIN', 'SUPER_ADMIN'] },
        {
            path: '/admin/finance', icon: <FiDollarSign />, label: 'Finance', roles: ['ADMIN', 'SUPER_ADMIN'], subItems: [
                { path: '/admin/finance/expenditure', label: 'Expenditure' },
                { path: '/admin/finance/transactions', label: 'Transactions' }
            ]
        },
        { path: '/admin/reports', icon: <FiPieChart />, label: 'Reports', roles: ['ADMIN', 'SUPER_ADMIN'] },
        { path: '/admin/settings', icon: <FiSettings />, label: 'Settings', roles: ['ADMIN', 'SUPER_ADMIN'] },

        // Customer Links
        { path: '/customer/dashboard', icon: <FiHome />, label: 'Dashboard', roles: ['CUSTOMER'] },
        { path: '/customer/billing', icon: <FiDollarSign />, label: 'Billing', roles: ['CUSTOMER'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen fixed left-0 top-0 overflow-y-auto z-50 hidden md:block">
            <div className="p-6">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
                        D
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
                        Devine Water
                    </span>
                </div>

                <nav className="space-y-1">
                    {filteredItems.map((item) => (
                        <div key={item.path}>
                            {item.subItems ? (
                                <div className="space-y-1">
                                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider mt-4">
                                        {item.label}
                                    </div>
                                    {item.subItems.map(sub => (
                                        <Link
                                            key={sub.path}
                                            to={sub.path}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(sub.path)
                                                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                                }`}
                                        >
                                            <span className="w-5" /> {/* Indent */}
                                            {sub.label}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.path)
                                            ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                                        }`}
                                >
                                    <span className="text-lg">{item.icon}</span>
                                    {item.label}
                                </Link>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 dark:border-gray-700">
                <button
                    onClick={logout}
                    className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                    <FiLogOut className="text-lg" />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
