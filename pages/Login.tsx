
import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';

export const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const location = useLocation();

    const from = location.state?.from?.pathname || '/';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'Failed to login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col flex-1 items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center mb-10">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-primary text-4xl">menu_book</span>
                    </div>
                    <h1 className="text-3xl font-black text-text-dark">Welcome back</h1>
                    <p className="text-gray-400 mt-2 text-center text-sm font-medium">Log in to your ChefBook account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-semibold mb-6 animate-shake flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1 mb-1.5 block">Email</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">mail</span>
                            <input
                                type="email"
                                required
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                                placeholder="chef@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-center ml-1 mb-1.5 ">
                            <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 block">Password</label>
                            <Link to="/forgot-password" size="tiny" variant="ghost" className="text-[10px] uppercase tracking-widest font-black text-primary hover:underline">Forgot?</Link>
                        </div>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                            <input
                                type="password"
                                required
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 mt-8 shadow-lg shadow-primary/20 active:scale-95 transition-all hover:bg-primary-dark disabled:opacity-50"
                    >
                        {loading ? 'Logging in...' : (
                            <>
                                Sign In <span className="material-symbols-outlined text-xl">arrow_forward</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-8 border-t border-gray-50 flex flex-col items-center gap-4">
                    <p className="text-gray-500 text-sm font-medium">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-primary font-bold hover:underline">Sign Up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
