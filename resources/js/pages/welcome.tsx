import { login } from '@/routes';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { Car, Shield, Clock, QrCode, BarChart3, Users } from 'lucide-react';

export default function Welcome() {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Public Parking Ticketing System">
                <link rel="preconnect" href="https://fonts.bunny.net" />
                <link
                    href="https://fonts.bunny.net/css?family=inter:400,500,600,700"
                    rel="stylesheet"
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
                {/* Navigation */}
                <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center h-16">
                            <div className="flex items-center space-x-3">
                                <div className="bg-blue-600 p-2 rounded-lg">
                                    <Car className="h-6 w-6 text-white" />
                                </div>
                                <span className="text-xl font-bold text-gray-900">
                                    Lanao del Norte
                                </span>
                            </div>
                            <div>
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="inline-flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <Link
                                        href={login()}
                                        className="inline-flex items-center px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
                                    >
                                        Staff Login
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center max-w-3xl mx-auto">
                            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                                Auto Ticketing System
                            </h1>
                            <p className="text-xl text-gray-600 mb-8">
                                Efficient, modern, and secure parking management for Lanao del Norte.
                                Streamline operations with digital ticketing and real-time monitoring.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link
                                    href={login()}
                                    className="inline-flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    Get Started
                                </Link>
                                <a
                                    href="#features"
                                    className="inline-flex items-center justify-center px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200"
                                >
                                    Learn More
                                </a>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                <div className="text-4xl font-bold text-blue-600 mb-2">24/7</div>
                                <div className="text-gray-600">System Availability</div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                <div className="text-4xl font-bold text-blue-600 mb-2">Real-time</div>
                                <div className="text-gray-600">Ticket Processing</div>
                            </div>
                            <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
                                <div className="text-4xl font-bold text-blue-600 mb-2">Secure</div>
                                <div className="text-gray-600">Payment System</div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Powerful Features
                            </h2>
                            <p className="text-lg text-gray-600">
                                Everything you need to manage parking operations efficiently
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={<QrCode className="h-8 w-8" />}
                                title="QR Code Receipts"
                                description="Generate instant QR code receipts for easy verification and tracking"
                            />
                            <FeatureCard
                                icon={<Clock className="h-8 w-8" />}
                                title="Time Tracking"
                                description="Automatic duration calculation with multiple rate types support"
                            />
                            <FeatureCard
                                icon={<Shield className="h-8 w-8" />}
                                title="Secure Access"
                                description="Role-based access control for admins and agents"
                            />
                            <FeatureCard
                                icon={<BarChart3 className="h-8 w-8" />}
                                title="Revenue Analytics"
                                description="Real-time revenue tracking and comprehensive reports"
                            />
                            <FeatureCard
                                icon={<Car className="h-8 w-8" />}
                                title="Plate Recognition"
                                description="Optional plate scanning for faster ticket generation"
                            />
                            <FeatureCard
                                icon={<Users className="h-8 w-8" />}
                                title="Agent Management"
                                description="Easy user registration and activity monitoring"
                            />
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 px-4 sm:px-6 lg:px-8">
                    <div className="max-w-4xl mx-auto text-center">
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl p-12 shadow-2xl">
                            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                                Ready to Get Started?
                            </h2>
                            <p className="text-blue-100 text-lg mb-8">
                                Join our parking management system and streamline your operations today.
                            </p>
                            <Link
                                href={login()}
                                className="inline-flex items-center justify-center px-8 py-3 bg-white hover:bg-gray-100 text-blue-600 font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Access System
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-t border-gray-200">
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <div className="bg-blue-600 p-2 rounded-lg">
                                <Car className="h-5 w-5 text-white" />
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                                Lanao del Norte Parking System
                            </span>
                        </div>
                        <p className="text-gray-600">
                            © {new Date().getFullYear()} All rights reserved.
                        </p>
                    </div>
                </footer>
            </div>
        </>
    );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
    return (
        <div className="bg-gray-50 rounded-2xl p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100">
            <div className="bg-blue-600 text-white rounded-lg p-3 w-fit mb-4">
                {icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {title}
            </h3>
            <p className="text-gray-600">
                {description}
            </p>
        </div>
    );
}

