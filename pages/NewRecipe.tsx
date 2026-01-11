
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { recipeService } from '../services/supabase';
import { Tag, Ingredient, Step } from '../types';

export const NewRecipe: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  
  // Form State
  const [title, setTitle] = useState('');
  const [prepTime, setPrepTime] = useState<number>(20);
  const [servings, setServings] = useState<number>(4);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [ingredientsRaw, setIngredientsRaw] = useState('');
  const [stepsRaw, setStepsRaw] = useState('');

  useEffect(() => {
    recipeService.getTags().then(setAvailableTags);
  }, []);

  const handleSave = async () => {
    if (!title.trim()) return alert('Please enter a recipe title');
    
    setLoading(true);
    try {
      // Parse ingredients and steps
      const ingredients: Ingredient[] = ingredientsRaw
        .split('\n')
        .filter(line => line.trim())
        .map((line, idx) => ({
          name: line.trim(),
          quantity: '',
          unit: '',
          order_index: idx
        }));

      const steps: Step[] = stepsRaw
        .split('\n')
        .filter(line => line.trim())
        .map((line, idx) => ({
          description: line.trim(),
          order_index: idx
        }));

      await recipeService.createRecipe(
        { 
          title, 
          prep_time_mins: prepTime, 
          servings, 
          image_url: imageUrl || 'https://picsum.photos/800/600?random=' + Math.random(),
          rating: 4.5
        },
        ingredients,
        steps,
        selectedTagIds
      );
      
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Error saving recipe');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <div className="flex flex-col flex-1 pb-32">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-100">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-400">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h2 className="font-bold text-lg">New Recipe</h2>
        <span className="text-primary text-xs font-bold uppercase tracking-wider">Draft</span>
      </div>

      <div className="p-6 space-y-8">
        {/* Title Input */}
        <textarea 
          placeholder="Recipe Title"
          rows={1}
          className="w-full text-4xl font-bold border-none focus:ring-0 p-0 placeholder:text-gray-200 resize-none leading-tight"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* Cover Photo Placeholder */}
        <div 
          onClick={() => {
            const url = prompt('Enter image URL:');
            if (url) setImageUrl(url);
          }}
          className="aspect-video w-full rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group"
        >
          {imageUrl ? (
            <img src={imageUrl} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            <>
              <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-primary transition-colors">add_a_photo</span>
              <p className="text-sm font-medium text-gray-400 mt-2">Add a cover photo</p>
            </>
          )}
        </div>

        {/* Basic Info */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Basic Info</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-semibold mb-2 text-text-dark">Prep Time (mins)</p>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-xl">schedule</span>
                <input 
                  type="number" 
                  className="w-full h-12 pl-12 rounded-xl border-gray-200 focus:ring-primary/20 focus:border-primary"
                  value={prepTime}
                  onChange={(e) => setPrepTime(Number(e.target.value))}
                />
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold mb-2 text-text-dark">Servings</p>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-xl">restaurant</span>
                <input 
                  type="number" 
                  className="w-full h-12 pl-12 rounded-xl border-gray-200 focus:ring-primary/20 focus:border-primary"
                  value={servings}
                  onChange={(e) => setServings(Number(e.target.value))}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Categories</h3>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button 
                key={tag.id}
                onClick={() => toggleTag(tag.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                  selectedTagIds.includes(tag.id) 
                    ? 'bg-primary text-white scale-105 shadow-md' 
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {tag.name}
              </button>
            ))}
            <button className="px-4 py-2 border border-dashed border-gray-300 rounded-full text-xs text-gray-400 flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-sm">add</span> Add Tag
            </button>
          </div>
        </div>

        {/* Ingredients */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Ingredients</h3>
          <textarea 
            placeholder="List your ingredients here (one per line)..."
            className="w-full min-h-[150px] rounded-2xl border-gray-200 p-4 focus:ring-primary/20 focus:border-primary text-sm leading-relaxed"
            value={ingredientsRaw}
            onChange={(e) => setIngredientsRaw(e.target.value)}
          />
        </div>

        {/* Preparation Steps */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Preparation Steps</h3>
          <textarea 
            placeholder="Step 1: Prep your ingredients... (one per line)"
            className="w-full min-h-[200px] rounded-2xl border-gray-200 p-4 focus:ring-primary/20 focus:border-primary text-sm leading-relaxed"
            value={stepsRaw}
            onChange={(e) => setStepsRaw(e.target.value)}
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 flex gap-4 z-30">
        <button 
          onClick={handleSave}
          disabled={loading}
          className="flex-1 h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Recipe'}
        </button>
        <button 
          onClick={() => navigate('/')}
          className="flex-1 h-14 bg-gray-100 text-text-dark font-bold rounded-2xl active:scale-95 transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
