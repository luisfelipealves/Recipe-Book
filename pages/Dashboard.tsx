
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
    <div className="flex flex-col lg:flex-row flex-1 min-h-0 bg-background lg:bg-white">
      {/* Desktop Sidebar Filters */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gray-100 p-6 overflow-y-auto h-[calc(100vh-2rem)] sticky top-0">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-dark flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">menu_book</span>
            ChefBook
          </h1>
        </div>

        <div className="mb-6">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Categories</h3>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => setActiveTag(null)}
              className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${!activeTag ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              All Recipes
            </button>
            {tags.map(tag => (
              <button
                key={tag.id}
                onClick={() => setActiveTag(tag.id)}
                className={`text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all ${activeTag === tag.id ? 'bg-primary/10 text-primary' : 'text-gray-500 hover:bg-gray-50'}`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
          <button
            onClick={() => navigate('/tags')}
            className="w-full h-12 bg-gray-50 text-text-dark rounded-xl flex items-center justify-center gap-2 font-bold hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined">label</span>
            Manage Tags
          </button>
          <button
            onClick={() => navigate('/new')}
            className="w-full h-12 bg-primary text-white rounded-xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-colors"
          >
            <span className="material-symbols-outlined">add</span>
            New Recipe
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col pb-24 lg:pb-12">
        {/* Mobile Header & Search */}
        <div className="p-6 pb-2 lg:p-8 lg:pb-6">
          <div className="flex justify-between items-center mb-6 lg:mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-text-dark lg:hidden">My Recipes</h1>
            <h1 className="hidden lg:block text-3xl font-bold text-text-dark">
              {activeTag ? tags.find(t => t.id === activeTag)?.name : 'All Recipes'}
            </h1>
            <div className="flex items-center gap-3">
              <div
                onClick={() => navigate('/tags')}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 cursor-pointer hover:bg-gray-100 transition-colors lg:hidden"
              >
                <span className="material-symbols-outlined">label</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary/20 transition-colors">
                <span className="material-symbols-outlined">person</span>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-2xl">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">search</span>
            <input
              type="text"
              placeholder="Search recipes..."
              className="w-full h-12 pl-12 pr-4 bg-white lg:bg-gray-50 border border-gray-100 lg:border-none rounded-xl focus:ring-2 focus:ring-primary/20 text-sm transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Mobile Filter Tags */}
          <div className="lg:hidden flex gap-2 overflow-x-auto no-scrollbar pb-4">
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
        <div className="px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="animate-pulse bg-gray-50 aspect-[4/3] rounded-2xl"></div>
            ))
          ) : filteredRecipes.length > 0 ? (
            filteredRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))
          ) : (
            <div className="col-span-full text-center py-20 text-gray-400">
              <span className="material-symbols-outlined text-6xl mb-4">no_meals</span>
              <p>No recipes found</p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-4 text-primary font-bold text-sm hover:underline"
                >
                  Clear search
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Floating Action Button */}
      <button
        onClick={() => navigate('/new')}
        className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-[400px] h-14 bg-primary text-white rounded-2xl flex items-center justify-center gap-2 font-bold shadow-xl shadow-primary/30 active:scale-95 transition-transform z-30"
      >
        <span className="material-symbols-outlined">add</span>
        New Recipe
      </button>
    </div>
  );
};
