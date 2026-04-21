import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import { Form, Head, Link, router, usePage } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { Lock, Mail, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({
    status,
    canResetPassword,
}: LoginProps) {
    const { systemSettings } = usePage<SharedData>().props;
    const [globalError, setGlobalError] = useState<string | null>(null);

    // Listen for Inertia errors
    useEffect(() => {
        const removeErrorListener = router.on('error', (event) => {
            console.error('Inertia error:', event);
            setGlobalError('A network error occurred. Please check your connection.');
        });

        const removeExceptionListener = router.on('exception', (event) => {
            console.error('Inertia exception:', event);
            setGlobalError('An unexpected error occurred. Please try again.');
        });

        return () => {
            removeErrorListener();
            removeExceptionListener();
        };
    }, []);
    return (
        <>
            <Head title="Staff Login" />
            
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <div className="w-full max-w-md">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <Link href="/" className="inline-flex items-center justify-center space-x-3 mb-6">
                            <img
                                src="/assets/img/dakiri-logo.png"
                                alt="Dakiri IT Solutions"
                                className="h-14 w-auto object-contain"
                            />
                            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                {systemSettings.shortName}
                            </span>
                        </Link>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                            Staff Login
                        </h1>
                        <p className="text-gray-600 dark:text-gray-400">
                            Enter your credentials to access the parking system
                        </p>
                    </div>

                    {/* Login Card */}
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-8">
                        {status && (
                            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                                <p className="text-sm text-green-600 dark:text-green-400 text-center">
                                    {status}
                                </p>
                            </div>
                        )}

                        {globalError && (
                            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    {globalError}
                                </p>
                            </div>
                        )}

                        <Form
                            {...store.form()}
                            resetOnSuccess={['password']}
                            className="space-y-6"
                            onError={(errors) => {
                                console.error('Form errors:', errors);
                                setGlobalError(null); // Clear network error if we got form errors
                            }}
                            onStart={() => {
                                setGlobalError(null);
                            }}
                        >
                            {({ processing, errors }) => (
                                <>
                                    {/* Email Field */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="email"
                                                type="email"
                                                name="email"
                                                required
                                                autoFocus
                                                tabIndex={1}
                                                autoComplete="email"
                                                placeholder="admin@parking.com"
                                                className="pl-10 h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <InputError message={errors.email} />
                                    </div>

                                    {/* Password Field */}
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">
                                                Password
                                            </Label>
                                            {canResetPassword && (
                                                <TextLink
                                                    href={request()}
                                                    className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                                                    tabIndex={5}
                                                >
                                                    Forgot password?
                                                </TextLink>
                                            )}
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <Input
                                                id="password"
                                                type="password"
                                                name="password"
                                                required
                                                tabIndex={2}
                                                autoComplete="current-password"
                                                placeholder="••••••••"
                                                className="pl-10 h-12 bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <InputError message={errors.password} />
                                    </div>

                                    {/* Remember Me */}
                                    <div className="flex items-center space-x-3">
                                        {/* <Checkbox
                                            id="remember"
                                            name="remember"
                                            tabIndex={3}
                                            className="border-gray-300 dark:border-gray-600"
                                        /> */}
                                        {/* <Label 
                                            htmlFor="remember" 
                                            className="text-sm text-gray-600 dark:text-gray-400 cursor-pointer"
                                        >
                                            Remember me for 30 days
                                        </Label> */}
                                    </div>

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                                        tabIndex={4}
                                        disabled={processing}
                                        data-test="login-button"
                                    >
                                        {processing && <Spinner className="mr-2" />}
                                        {processing ? 'Signing in...' : 'Sign In'}
                                    </Button>
                                </>
                            )}
                        </Form>
                    </div>

                    {/* Footer */}
                    {/* <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                        Having trouble logging in?{' '}
                        <Link href="/" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                            Back to Home
                        </Link>
                    </p> */}
                </div>
            </div>
        </>
    );
}
