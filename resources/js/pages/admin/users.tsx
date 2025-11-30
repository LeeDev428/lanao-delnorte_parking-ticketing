import AdminLayout from '@/layouts/admin/admin-layout';
import { Head, router, useForm } from '@inertiajs/react';
import { UserPlus, Edit, Trash2, Shield, User as UserIcon, Search, Ban, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import InputError from '@/components/input-error';
import { Spinner } from '@/components/ui/spinner';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'agent';
    is_active: boolean;
    created_at: string;
}

interface UsersProps {
    users: User[];
}

export default function Users({ users }: UsersProps) {
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'agent'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

    // Mock users data
    const mockUsers: User[] = users || [
        {
            id: 1,
            name: 'Admin User',
            email: 'admin@parking.com',
            role: 'admin',
            is_active: true,
            created_at: '2025-01-15',
        },
        {
            id: 2,
            name: 'John Doe',
            email: 'john@parking.com',
            role: 'agent',
            is_active: true,
            created_at: '2025-01-20',
        },
        {
            id: 3,
            name: 'Jane Smith',
            email: 'jane@parking.com',
            role: 'agent',
            is_active: false,
            created_at: '2025-02-01',
        },
    ];

    // Filter users based on search and filters
    const filteredUsers = mockUsers.filter(user => {
        const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || user.role === roleFilter;
        const matchesStatus = statusFilter === 'all' || 
                            (statusFilter === 'active' && user.is_active) ||
                            (statusFilter === 'inactive' && !user.is_active);
        return matchesSearch && matchesRole && matchesStatus;
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        role: 'agent' as 'admin' | 'agent',
    });

    const editFormData = useForm({
        name: '',
        email: '',
        role: 'agent' as 'admin' | 'agent',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/admin/users', {
            onSuccess: () => {
                reset();
                setShowModal(false);
            },
        });
    };

    const handleEditUser = (user: User) => {
        setEditingUser(user);
        editFormData.setData({
            name: user.name,
            email: user.email,
            role: user.role as 'admin' | 'agent',
        });
        setShowEditModal(true);
    };

    const handleUpdateUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingUser) {
            editFormData.patch(`/admin/users/${editingUser.id}`, {
                onSuccess: () => {
                    setShowEditModal(false);
                    setEditingUser(null);
                    editFormData.reset();
                },
            });
        }
    };

    const toggleUserStatus = (userId: number) => {
        if (confirm('Are you sure you want to change this user\'s status?')) {
            router.patch(`/admin/users/${userId}/toggle-status`);
        }
    };

    return (
        <AdminLayout title="User Management">
            <Head title="User Management" />

            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage admin and agent accounts
                    </p>
                    <Button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2"
                    >
                        <UserPlus className="h-4 w-4" />
                        Add New User
                    </Button>
                </div>

                {/* Filters and Search */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {/* Search */}
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Role Filter */}
                            <div>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value as 'all' | 'admin' | 'agent')}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Roles</option>
                                    <option value="admin">Admin</option>
                                    <option value="agent">Agent</option>
                                </select>
                            </div>

                            {/* Status Filter */}
                            <div>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">All Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Users Grid */}
                {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {mockUsers.map((user) => (
                        <UserCard
                            key={user.id}
                            user={user}
                            onToggleStatus={toggleUserStatus}
                        />
                    ))}
                </div> */}

                {/* Users Table (Alternative View) */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            All Users
                        </h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => (
                                        <tr
                                            key={user.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {user.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {user.email}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <RoleBadge role={user.role} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <StatusBadge isActive={user.is_active} />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {new Date(user.created_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex gap-2">
                                                    <button 
                                                        onClick={() => handleEditUser(user)}
                                                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                        title="Edit User"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => toggleUserStatus(user.id)}
                                                        className={user.is_active 
                                                            ? "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" 
                                                            : "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                                                        }
                                                        title={user.is_active ? "Deactivate User" : "Activate User"}
                                                    >
                                                        {user.is_active ? <Ban className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                                            No users found matching your filters.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                Add New User
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Create a new admin or agent account
                            </p>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <Label htmlFor="name">Full Name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    required
                                    placeholder="John Doe"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div>
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                    placeholder="john@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div>
                                <Label htmlFor="role">Role</Label>
                                <select
                                    id="role"
                                    value={data.role}
                                    onChange={(e) =>
                                        setData('role', e.target.value as 'admin' | 'agent')
                                    }
                                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="agent">Agent</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <InputError message={errors.role} />
                            </div>

                            <div>
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password} />
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={data.password_confirmation}
                                    onChange={(e) =>
                                        setData('password_confirmation', e.target.value)
                                    }
                                    required
                                    placeholder="••••••••"
                                />
                                <InputError message={errors.password_confirmation} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowModal(false);
                                        reset();
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={processing} className="flex-1">
                                    {processing && <Spinner />}
                                    Create User
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && editingUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md mx-4">
                        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Edit User
                            </h2>
                        </div>
                        <form onSubmit={handleUpdateUser} className="p-6 space-y-4">
                            <div>
                                <Label htmlFor="edit_name">Name</Label>
                                <Input
                                    id="edit_name"
                                    type="text"
                                    value={editFormData.data.name}
                                    onChange={(e) => editFormData.setData('name', e.target.value)}
                                    required
                                    placeholder="Enter full name"
                                />
                                <InputError message={editFormData.errors.name} />
                            </div>

                            <div>
                                <Label htmlFor="edit_email">Email</Label>
                                <Input
                                    id="edit_email"
                                    type="email"
                                    value={editFormData.data.email}
                                    onChange={(e) => editFormData.setData('email', e.target.value)}
                                    required
                                    placeholder="user@example.com"
                                />
                                <InputError message={editFormData.errors.email} />
                            </div>

                            <div>
                                <Label htmlFor="edit_role">Role</Label>
                                <select
                                    id="edit_role"
                                    value={editFormData.data.role}
                                    onChange={(e) =>
                                        editFormData.setData('role', e.target.value as 'admin' | 'agent')
                                    }
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                >
                                    <option value="agent">Agent</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <InputError message={editFormData.errors.role} />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setShowEditModal(false);
                                        setEditingUser(null);
                                        editFormData.reset();
                                    }}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={editFormData.processing} className="flex-1">
                                    {editFormData.processing && <Spinner />}
                                    Update User
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}

function UserCard({
    user,
    onToggleStatus,
}: {
    user: User;
    onToggleStatus: (id: number) => void;
}) {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
                <div
                    className={`p-3 rounded-lg ${
                        user.role === 'admin'
                            ? 'bg-purple-100 dark:bg-purple-900/30'
                            : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}
                >
                    {user.role === 'admin' ? (
                        <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    ) : (
                        <UserIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    )}
                </div>
                <StatusBadge isActive={user.is_active} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {user.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{user.email}</p>
            <div className="flex items-center justify-between">
                <RoleBadge role={user.role} />
                <div className="flex gap-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                        <Edit className="h-4 w-4" />
                    </button>
                    <button
                        onClick={() => onToggleStatus(user.id)}
                        className="p-2 text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function RoleBadge({ role }: { role: 'admin' | 'agent' }) {
    return (
        <span
            className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${
                role === 'admin'
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                    : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}
        >
            {role}
        </span>
    );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
    return (
        <span
            className={`px-3 py-1 text-xs font-medium rounded-full ${
                isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
            }`}
        >
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
}
