
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { recipeService } from '../services/supabase';

export const Profile: React.FC = () => {
    const { user, signOut } = useAuth();
    const [stats, setStats] = useState({ recipeCount: 0 });
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            recipeService.getAllRecipes().then(recipes => {
                const myRecipes = recipes.filter(r => r.user_id === user.id);
                setStats({ recipeCount: myRecipes.length });
            });
        }
    }, [user]);

    if (!user) return null;

    return (
        <div className="flex flex-col flex-1 p-6 lg:p-12 bg-background">
            <div className="max-w-2xl mx-auto w-full">
                <div className="flex items-center gap-6 mb-10">
                    <div className="w-24 h-24 bg-primary/10 rounded-3xl flex items-center justify-center text-primary border-4 border-white shadow-sm">
                        <span className="text-4xl font-black">{user.email?.[0].toUpperCase()}</span>
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-text-dark">{user.email?.split('@')[0]}</h1>
                        <p className="text-gray-500 font-medium">{user.email}</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">My Recipes</p>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-black text-text-dark">{stats.recipeCount}</span>
                            <span className="text-gray-400 font-bold mb-1 text-sm underline decoration-primary/30">Created</span>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-[10px] uppercase tracking-widest font-black text-gray-400 mb-2">Member Since</p>
                        <div className="flex items-end gap-2">
                            <span className="text-xl font-bold text-text-dark">
                                {new Date(user.created_at).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                        <h3 className="font-black text-text-dark uppercase tracking-tight">Account Settings</h3>
                    </div>
                    <div className="p-4 space-y-2">
                        <button
                            onClick={() => navigate('/tags')}
                            className="w-full p-4 text-left hover:bg-gray-50 rounded-2xl flex items-center justify-between transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">label</span>
                                <span className="font-bold text-gray-600">Manage My Tags</span>
                            </div>
                            <span className="material-symbols-outlined text-gray-300">chevron_right</span>
                        </button>
                        <button
                            onClick={async () => { await signOut(); navigate('/'); }}
                            className="w-full p-4 text-left hover:bg-red-50 rounded-2xl flex items-center justify-between transition-colors group"
                        >
                            <div className="flex items-center gap-4 text-red-500">
                                <span className="material-symbols-outlined">logout</span>
                                <span className="font-bold">Sign Out</span>
                            </div>
                            <span className="material-symbols-outlined text-red-200">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
