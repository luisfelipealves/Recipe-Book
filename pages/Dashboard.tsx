
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../services/supabase';
import { Recipe, Tag } from '../types';
import { RecipeCard } from '../components/RecipeCard';

export const Dashboard: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recipesData, tagsData] = await Promise.all([
          recipeService.getAllRecipes(),
          recipeService.getTags()
        ]);
        setRecipes(recipesData);
        setTags(tagsData);
      } catch (err) {
        console.error("Failed to load recipes", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    const matchesTag = !activeTag || r.tags?.some(t => t.id === activeTag);
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex flex-col flex-1 pb-24">
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-text-dark">My Recipes</h1>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined">person</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
          <input 
            type="text" 
            placeholder="Search recipes..." 
            className="w-full h-12 pl-12 pr-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Filter Tags */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4">
          <button 
            onClick={() => setActiveTag(null)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${!activeTag ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-500'}`}
          >
            All
          </button>
          {tags.map(tag => (
            <button 
              key={tag.id}
              onClick={() => setActiveTag(tag.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${activeTag === tag.id ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-gray-100 text-gray-500'}`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="px-6 grid grid-cols-1 gap-6">
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-50 h-64 rounded-2xl"></div>
          ))
        ) : filteredRecipes.length > 0 ? (
          filteredRecipes.map(recipe => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))
        ) : (
          <div className="text-center py-20 text-gray-400">
            <span className="material-symbols-outlined text-6xl mb-4">no_meals</span>
            <p>No recipes found</p>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={() => navigate('/new')}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[432px] max-w-[90%] h-14 bg-primary text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-primary/30 active:scale-95 transition-transform"
      >
        <span className="material-symbols-outlined">add</span>
        New Recipe
      </button>
    </div>
  );
};
