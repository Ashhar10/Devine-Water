import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import {
    FiPlus, FiSearch, FiUser, FiBriefcase,
    FiDollarSign, FiCalendar, FiCheckSquare
} from 'react-icons/fi';
import Modal from '../../common/Modal';
import DataGrid from '../../common/DataGrid';

const EmployeeManagement = () => {
    const [employees, setEmployees] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        // Mock data
        setEmployees([
            {
                id: 1,
                name: 'John Doe',
                designation: 'Support Agent',
                department: 'Customer Service',
                status: 'active',
                joiningDate: '2024-01-01',
                email: 'john@devinewater.com'
            },
            {
                id: 2,
                name: 'Sarah Connor',
                designation: 'Field Technician',
                department: 'Maintenance',
                status: 'on_leave',
                joiningDate: '2023-11-15',
                email: 'sarah@devinewater.com'
            }
        ]);
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Management</h1>
                    <p className="text-gray-600 dark:text-gray-400">Manage staff details, roles and permissions</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                    <FiPlus /> Add Employee
                </button>
            </div>

            {/* Employee List - Using LyteNyte DataGrid */}
            <DataGrid
                data={employees}
                columns={[
                    { field: 'name', headerName: 'Employee', width: 200 },
                    { field: 'designation', headerName: 'Role', width: 150 },
                    { field: 'department', headerName: 'Department', width: 150 },
                    { field: 'status', headerName: 'Status', width: 100 },
                    { field: 'joiningDate', headerName: 'Joined', width: 120 },
                    { field: 'email', headerName: 'Email', width: 200 },
                ]}
                height={400}
            />

            {/* Add Employee Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Employee">
                <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="label">Full Name</label>
                            <input type="text" className="input" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="label">Email</label>
                            <input type="email" className="input" placeholder="john@example.com" />
                        </div>
                    </div>

                    {/* Access Control Section */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Access Permissions</h4>
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input type="checkbox" className="rounded text-primary-600" />
                                <span>Dashboard Access</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input type="checkbox" className="rounded text-primary-600" />
                                <span>Manage Customers</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input type="checkbox" className="rounded text-primary-600" />
                                <span>View Reports</span>
                            </label>
                            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                                <input type="checkbox" className="rounded text-primary-600" />
                                <span>Edit Settings</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary">Create Employee</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default EmployeeManagement;
