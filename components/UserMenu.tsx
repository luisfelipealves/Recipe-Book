
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const UserMenu: React.FC = () => {
    const { user, signOut } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!user) {
        return (
            <div className="flex items-center gap-2">
                <button
                    onClick={() => navigate('/login')}
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                >
                    Sign In
                </button>
                <button
                    onClick={() => navigate('/signup')}
                    className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all active:scale-95"
                >
                    Sign Up
                </button>
            </div>
        );
    }

    const userInitial = user.email?.[0].toUpperCase() || '?';

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/20 transition-colors border-2 border-transparent active:border-primary/30"
            >
                <span className="font-bold">{userInitial}</span>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                        <p className="text-xs font-black uppercase tracking-wider text-gray-400">Account</p>
                        <p className="text-sm font-bold text-text-dark truncate mt-0.5">{user.email}</p>
                    </div>

                    <button
                        onClick={() => { navigate('/profile'); setIsOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">person</span>
                        Profile
                    </button>
                    <button
                        onClick={() => { navigate('/new'); setIsOpen(false); }}
                        className="w-full px-4 py-2.5 text-left text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-3 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                        New Recipe
                    </button>

                    <div className="my-1 border-t border-gray-50"></div>

                    <button
                        onClick={async () => { await signOut(); setIsOpen(false); navigate('/'); }}
                        className="w-full px-4 py-2.5 text-left text-sm font-bold text-red-500 hover:bg-red-50 flex items-center gap-3 transition-colors"
                    >
                        <span className="material-symbols-outlined text-lg">logout</span>
                        Logout
                    </button>
                </div>
            )}
        </div>
    );
};
