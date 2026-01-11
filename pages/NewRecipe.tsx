
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
  const [error, setError] = useState<string | null>(null);

  // Dynamic Lists State
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: '', quantity: '', unit: 'unidade', order_index: 0 }
  ]);
  const [steps, setSteps] = useState<Step[]>([
    { description: '', order_index: 0 }
  ]);

  useEffect(() => {
    recipeService.getTags().then(setAvailableTags);
  }, []);

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) {
      setError('Please enter a recipe title');
      return;
    }

    // Validation
    const validIngredients = ingredients.filter(i => i.name.trim());
    const validSteps = steps.filter(s => s.description.trim());

    if (validIngredients.length === 0) {
      setError('Please add at least one ingredient');
      return;
    }
    if (validSteps.length === 0) {
      setError('Please add at least one preparation step');
      return;
    }

    setLoading(true);
    try {
      // Re-index before saving to ensure sequential order
      const finalIngredients = validIngredients.map((ing, idx) => ({
        ...ing,
        order_index: idx
      }));

      const finalSteps = validSteps.map((step, idx) => ({
        ...step,
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
        finalIngredients,
        finalSteps,
        selectedTagIds
      );

      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Error saving recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleTag = (id: string) => {
    setSelectedTagIds(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  // Ingredient Helpers
  const updateIngredient = (index: number, field: keyof Ingredient, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = { ...newIngredients[index], [field]: value };
    setIngredients(newIngredients);
  };

  const addIngredient = () => {
    setIngredients([...ingredients, { name: '', quantity: '', unit: 'unidade', order_index: ingredients.length }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    } else {
      // If deleting the last one, just clear it
      setIngredients([{ name: '', quantity: '', unit: 'unidade', order_index: 0 }]);
    }
  };

  // Step Helpers
  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index] = { ...newSteps[index], description: value };
    setSteps(newSteps);
  };

  const addStep = () => {
    setSteps([...steps, { description: '', order_index: steps.length }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      setSteps(steps.filter((_, i) => i !== index));
    } else {
      setSteps([{ description: '', order_index: 0 }]);
    }
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
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

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
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedTagIds.includes(tag.id)
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
          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={index} className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Item"
                  className="flex-1 h-10 rounded-lg border-gray-200 focus:ring-primary/20 focus:border-primary text-sm"
                  value={ingredient.name}
                  onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                />
                <input
                  type="number"
                  placeholder="Qty"
                  className="w-16 h-10 rounded-lg border-gray-200 focus:ring-primary/20 focus:border-primary text-sm"
                  value={ingredient.quantity}
                  onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                />
                <select
                  className="w-24 h-10 rounded-lg border-gray-200 focus:ring-primary/20 focus:border-primary text-sm"
                  value={ingredient.unit}
                  onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                >
                  <option value="unidade">unid</option>
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="l">L</option>
                  <option value="xícara">xíc</option>
                  <option value="colher sopa">c.sopa</option>
                  <option value="colher chá">c.chá</option>
                  <option value="a gosto">a gosto</option>
                </select>
                <button
                  onClick={() => removeIngredient(index)}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <span className="material-symbols-outlined text-xl">delete</span>
                </button>
              </div>
            ))}
            <button
              onClick={addIngredient}
              className="mt-2 text-primary font-bold text-sm flex items-center gap-1 hover:text-primary-dark transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span> Add Ingredient
            </button>
          </div>
        </div>

        {/* Preparation Steps */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Preparation Steps</h3>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div key={index} className="relative pl-8">
                <div className="absolute left-0 top-0 font-bold text-gray-300 text-sm">
                  {index + 1}
                </div>
                <div className="relative">
                  <textarea
                    placeholder={`Describe step ${index + 1}...`}
                    className="w-full min-h-[80px] rounded-2xl border-gray-200 p-4 focus:ring-primary/20 focus:border-primary text-sm leading-relaxed pr-10"
                    value={step.description}
                    onChange={(e) => updateStep(index, e.target.value)}
                  />
                  <button
                    onClick={() => removeStep(index)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={addStep}
              className="mt-2 text-primary font-bold text-sm flex items-center gap-1 hover:text-primary-dark transition-colors"
            >
              <span className="material-symbols-outlined text-lg">add</span> Add Step
            </button>
          </div>
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
