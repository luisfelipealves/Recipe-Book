
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

export const SignUp: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // Validation
        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    }
                }
            });

            if (error) throw error;
            setSuccess(true);
        } catch (err: any) {
            setError(err.message || 'Failed to sign up');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center p-6 bg-background">
                <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-green-500 text-4xl">mark_email_read</span>
                    </div>
                    <h1 className="text-2xl font-black text-text-dark mb-4">Check your email</h1>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        We've sent a verification link to <span className="text-text-dark font-bold">{email}</span>.
                        Please confirm your email to activate your account.
                    </p>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 mt-10 shadow-lg shadow-primary/20 active:scale-95 transition-all hover:bg-primary-dark"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col flex-1 items-center justify-center p-6 bg-background">
            <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-primary text-4xl">person_add</span>
                    </div>
                    <h1 className="text-3xl font-black text-text-dark">Create Account</h1>
                    <p className="text-gray-400 mt-2 text-center text-sm font-medium">Join the ChefBook community</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-semibold mb-6 animate-shake flex items-center gap-2">
                        <span className="material-symbols-outlined text-lg">error</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-4">
                    <div>
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1 mb-1.5 block">Full Name (Optional)</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">badge</span>
                            <input
                                type="text"
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                                placeholder="Full Name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                    </div>

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
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1 mb-1.5 block">Password</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock</span>
                            <input
                                type="password"
                                required
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                                placeholder="Mín. 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] uppercase tracking-widest font-black text-gray-400 ml-1 mb-1.5 block">Confirm Password</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">lock_reset</span>
                            <input
                                type="password"
                                required
                                className="w-full h-14 pl-12 pr-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 text-sm font-medium transition-all"
                                placeholder="Re-enter password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 bg-primary text-white rounded-2xl font-bold flex items-center justify-center gap-2 mt-8 shadow-lg shadow-primary/20 active:scale-95 transition-all hover:bg-primary-dark disabled:opacity-50"
                    >
                        {loading ? 'Creating Account...' : (
                            <>
                                Create Account <span className="material-symbols-outlined text-xl">person_add</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-50 flex flex-col items-center gap-4">
                    <p className="text-gray-500 text-sm font-medium">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-bold hover:underline">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};
