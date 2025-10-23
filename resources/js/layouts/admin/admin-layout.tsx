import { type SharedData } from '@/types';
import { Link, router, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Ticket,
    DollarSign,
    UserPlus,
    LogOut,
    Menu,
    X,
    Car,
    Settings,
} from 'lucide-react';
import { useState } from 'react';

interface AdminLayoutProps {
    children: React.ReactNode;
    title?: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
    const { auth, ziggy } = usePage<SharedData>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const currentUrl = window.location.pathname;

    const navigation = [
        {
            name: 'Dashboard',
            href: '/admin/dashboard',
            icon: LayoutDashboard,
            current: currentUrl === '/admin/dashboard',
        },
        {
            name: 'Ticket Management',
            href: '/admin/tickets',
            icon: Ticket,
            current: currentUrl === '/admin/tickets',
        },
        {
            name: 'Rate Settings',
            href: '/admin/rate-settings',
            icon: Settings,
            current: currentUrl === '/admin/rate-settings',
        },
        {
            name: 'Revenue Reports',
            href: '/admin/revenue',
            icon: DollarSign,
            current: currentUrl === '/admin/revenue',
        },
        {
            name: 'User Management',
            href: '/admin/users',
            icon: UserPlus,
            current: currentUrl === '/admin/users',
        },
    ];

    const handleLogout = () => {
        router.post('/logout');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white dark:bg-gray-800 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                } border-r border-gray-200 dark:border-gray-700`}
            >
                <div className="flex h-full flex-col">
                    {/* Logo */}
                    <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Car className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                                Parking System
                            </span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                                {auth.user?.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-900 dark:text-white">
                                    {auth.user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                                    {String(auth.user?.role || 'User')}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
                        {navigation.map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                                    item.current
                                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-200'
                                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                            >
                                <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                                {item.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Logout */}
                    <div className="border-t border-gray-200 dark:border-gray-700 p-3">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        >
                            <LogOut className="mr-3 h-5 w-5" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        {title && (
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {title}
                            </h1>
                        )}
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {new Date().toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </span>
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="p-4 sm:p-6 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
