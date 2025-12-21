import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    FiPlus, FiSearch, FiEdit2, FiTrash2,
    FiShoppingBag, FiPhone, FiMail, FiMapPin
} from 'react-icons/fi';
import Modal from '../../common/Modal';

const VendorManagement = () => {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingVendor, setEditingVendor] = useState(null);

    // Placeholder data - replace with API call
    useEffect(() => {
        setTimeout(() => {
            setVendors([
                {
                    id: 1,
                    name: 'AquaPure Supplies',
                    email: 'sales@aquapure.com',
                    phone: '+923009876543',
                    category: 'Chemicals',
                    contactPerson: 'Mr. Kamran',
                    status: 'active'
                },
                {
                    id: 2,
                    name: 'TechFlow Systems',
                    email: 'support@techflow.com',
                    phone: '+923008765432',
                    category: 'Equipment',
                    contactPerson: 'Ms. Sara',
                    status: 'active'
                }
            ]);
            setLoading(false);
        }, 1000);
    }, []);

    const handleSave = (e) => {
        e.preventDefault();
        toast.success(editingVendor ? 'Vendor updated successfully' : 'Vendor added successfully');
        setIsModalOpen(false);
        setEditingVendor(null);
    };

    const handleDelete = (id) => {
        if (window.confirm('Are you sure you want to delete this vendor?')) {
            toast.success('Vendor deleted successfully');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vendor Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage suppliers and procurement sources</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <FiPlus /> Add Vendor
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex-1 relative">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search vendors..."
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
                    <option value="all">All Categories</option>
                    <option value="chemicals">Chemicals</option>
                    <option value="equipment">Equipment</option>
                    <option value="maintenance">Maintenance</option>
                </select>
            </div>

            {/* Vendors Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {vendors.map((vendor) => (
                    <motion.div
                        key={vendor.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                                <FiShoppingBag size={24} />
                            </div>
                            <span className={`px-2 py-1 text-xs rounded-full ${vendor.status === 'active'
                                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                    : 'bg-red-100 text-red-700'
                                }`}>
                                {vendor.status}
                            </span>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{vendor.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{vendor.category}</p>

                        <div className="space-y-2 mb-6">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <FiPhone className="text-gray-400" /> {vendor.phone}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <FiMail className="text-gray-400" /> {vendor.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                                <FiMapPin className="text-gray-400" /> {vendor.contactPerson}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                            <button
                                onClick={() => { setEditingVendor(vendor); setIsModalOpen(true); }}
                                className="flex-1 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => handleDelete(vendor.id)}
                                className="px-3 py-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Add/Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingVendor(null); }}
                title={editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
            >
                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
                        <input type="text" className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                            <select className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                                <option>Chemicals</option>
                                <option>Equipment</option>
                                <option>Services</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                            <select className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700">
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                    </div>
                    {/* Add more fields as needed */}
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Vendor</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default VendorManagement;
