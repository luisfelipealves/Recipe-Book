import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { recipeService } from '../services/supabase';
import { Recipe } from '../types';

export const RecipeDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRecipe = async () => {
            if (!id) return;
            try {
                const data = await recipeService.getRecipeById(id);
                setRecipe(data);
            } catch (err) {
                console.error('Failed to fetch recipe', err);
                setError('Recipe not found');
            } finally {
                setLoading(false);
            }
        };

        fetchRecipe();
    }, [id]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white">
                <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
                <p className="text-gray-500 font-medium">Loading recipe...</p>
            </div>
        );
    }

    if (error || !recipe) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-white text-center">
                <span className="material-symbols-outlined text-6xl text-gray-200 mb-4">sentiment_dissatisfied</span>
                <h2 className="text-2xl font-bold text-text-dark mb-2">Oops!</h2>
                <p className="text-gray-500 mb-6">{error || 'Recipe not found'}</p>
                <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white min-h-screen flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <button
                    onClick={() => navigate('/')}
                    className="w-10 h-10 flex items-center justify-center -ml-2 text-gray-400 hover:text-text-dark transition-colors"
                >
                    <span className="material-symbols-outlined">arrow_back_ios</span>
                </button>
                <h1 className="font-bold text-lg text-text-dark line-clamp-1 flex-1 text-center px-4">{recipe.title}</h1>
                <div className="w-10"></div> {/* Spacer for symmetry */}
            </div>

            <div className="flex-1 lg:max-w-4xl lg:mx-auto w-full">
                {/* Hero Section */}
                <div className="relative aspect-video sm:aspect-[21/9] lg:rounded-2xl lg:mt-6 lg:mx-6 overflow-hidden bg-gray-100 shadow-lg">
                    {recipe.image_url ? (
                        <img
                            src={recipe.image_url}
                            alt={recipe.title}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <span className="material-symbols-outlined text-6xl">restaurant</span>
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-6 space-y-8">
                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">schedule</span>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Prep Time</p>
                                <p className="font-bold text-text-dark">{recipe.prep_time_minutes} min</p>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-2xl flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">group</span>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Servings</p>
                                <p className="font-bold text-text-dark">{recipe.servings} ppl</p>
                            </div>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        {recipe.tags?.map(tag => (
                            <span
                                key={tag.id}
                                className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border"
                                style={{ backgroundColor: `${tag.color}05`, color: tag.color, borderColor: `${tag.color}30` }}
                            >
                                {tag.name}
                            </span>
                        ))}
                    </div>

                    <div className="grid lg:grid-cols-5 gap-10">
                        {/* Ingredients */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">shopping_basket</span>
                                Ingredients
                            </h2>
                            <div className="space-y-3">
                                {recipe.ingredients?.map((ing, i) => (
                                    <label key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors group">
                                        <input
                                            type="checkbox"
                                            className="mt-1 w-5 h-5 rounded-md border-gray-200 text-primary focus:ring-primary/20 transition-all cursor-pointer"
                                        />
                                        <div className="flex-1">
                                            <p className="font-bold text-text-dark group-has-[:checked]:text-gray-300 group-has-[:checked]:line-through transition-all capitalize">
                                                {ing.name}
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Steps */}
                        <div className="lg:col-span-3 space-y-4">
                            <h2 className="text-xl font-bold text-text-dark flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">restaurant_menu</span>
                                Preparation
                            </h2>
                            <div className="space-y-6">
                                {recipe.steps?.map((step, i) => (
                                    <div key={i} className="flex gap-4 group">
                                        <div className="flex flex-col items-center shrink-0">
                                            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm shadow-md shadow-primary/20 z-10 shrink-0">
                                                {i + 1}
                                            </div>
                                            {i < (recipe.steps?.length || 0) - 1 && (
                                                <div className="w-0.5 flex-1 bg-gray-100 my-1"></div>
                                            )}
                                        </div>
                                        <div className="pb-6">
                                            <p className="text-text-dark leading-relaxed font-medium">
                                                {step.description}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};
