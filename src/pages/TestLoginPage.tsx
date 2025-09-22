import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { LoadingSpinner } from '../components/Common/LoadingSpinner';

export const TestLoginPage: React.FC = () => {
    const { user, signIn, loading } = useAuth();
    const [email, setEmail] = useState('admin@sufiessences.com');
    const [password, setPassword] = useState('admin123');
    const [testLoading, setTestLoading] = useState(false);
    const [testResults, setTestResults] = useState<string[]>([]);
    const [loginError, setLoginError] = useState<string | null>(null);

    const addTestResult = (message: string) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    };

    const testConnection = async () => {
        setTestLoading(true);
        setTestResults([]);

        try {
            addTestResult('🔍 Testing Supabase connection...');

            // Test basic connection
            const { data, error } = await supabase
                .from('profiles')
                .select('count')
                .limit(1);

            if (error) {
                addTestResult(`❌ Connection test failed: ${error.message}`);
            } else {
                addTestResult('✅ Basic connection successful');
            }

            // Test auth status
            addTestResult('🔍 Testing auth status...');
            const { data: { session } } = await supabase.auth.getSession();

            if (session) {
                addTestResult(`✅ Active session found for: ${session.user.email}`);
            } else {
                addTestResult('ℹ️ No active session');
            }

            // Test environment variables
            addTestResult('🔍 Testing environment variables...');
            const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
            const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

            if (supabaseUrl && supabaseKey) {
                addTestResult(`✅ Environment variables configured`);
                addTestResult(`📍 URL: ${supabaseUrl}`);
                addTestResult(`🔑 Key: ${supabaseKey.substring(0, 20)}...`);
            } else {
                addTestResult('❌ Environment variables missing');
            }

            // Test direct login mode
            const directLoginEnabled = import.meta.env.VITE_DIRECT_LOGIN_ENABLED;
            if (directLoginEnabled === 'true') {
                addTestResult('🔧 Direct login mode is ENABLED');
            } else {
                addTestResult('🔧 Direct login mode is DISABLED');
            }

        } catch (error) {
            addTestResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setTestLoading(false);
        }
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError(null);

        try {
            addTestResult(`🔐 Attempting login for: ${email}`);
            await signIn(email, password);
            addTestResult('✅ Login successful!');
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Login failed';
            setLoginError(errorMessage);
            addTestResult(`❌ Login failed: ${errorMessage}`);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            addTestResult('✅ Logout successful');
        } catch (error) {
            addTestResult(`❌ Logout failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <LoadingSpinner size="large" text="Loading authentication..." />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Authentication Test Page</h1>
                    <p className="mt-2 text-gray-600">Debug authentication issues and test login functionality</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Login Form */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Login Test</h2>

                        {user ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-green-50 border border-green-200 rounded-md">
                                    <h3 className="font-medium text-green-800">Logged in as:</h3>
                                    <p className="text-green-700">Email: {user.email}</p>
                                    <p className="text-green-700">Role: {user.role}</p>
                                    <p className="text-green-700">ID: {user.id}</p>
                                </div>
                                <button
                                    onClick={handleLogout}
                                    className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleLogin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Email</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Password</label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                                        required
                                    />
                                </div>
                                {loginError && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                        <p className="text-red-700 text-sm">{loginError}</p>
                                    </div>
                                )}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                                >
                                    {loading ? 'Signing in...' : 'Sign In'}
                                </button>
                            </form>
                        )}
                    </div>

                    {/* Connection Test */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h2 className="text-xl font-semibold mb-4">Connection Test</h2>

                        <button
                            onClick={testConnection}
                            disabled={testLoading}
                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 mb-4"
                        >
                            {testLoading ? 'Testing...' : 'Run Connection Test'}
                        </button>

                        <div className="bg-gray-50 rounded-md p-4 max-h-96 overflow-y-auto">
                            <h3 className="font-medium text-gray-800 mb-2">Test Results:</h3>
                            {testResults.length === 0 ? (
                                <p className="text-gray-500 text-sm">Click "Run Connection Test" to start</p>
                            ) : (
                                <div className="space-y-1">
                                    {testResults.map((result, index) => (
                                        <p key={index} className="text-sm font-mono text-gray-700">
                                            {result}
                                        </p>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <button
                            onClick={() => window.location.href = '/'}
                            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                        >
                            Go to Home
                        </button>
                        <button
                            onClick={() => window.location.href = '/dashboard'}
                            className="bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700"
                        >
                            Go to Dashboard
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
