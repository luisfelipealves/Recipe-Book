
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
    <div className="flex flex-col flex-1 pb-32 lg:pb-0 min-h-screen bg-background lg:bg-white">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-100 lg:px-12 lg:py-6">
        <button onClick={() => navigate('/')} className="p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors">
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h2 className="font-bold text-lg lg:text-2xl">New Recipe</h2>
        <span className="text-primary text-xs font-bold uppercase tracking-wider bg-primary/10 px-3 py-1 rounded-full">Draft</span>
      </div>

      <div className="w-full max-w-5xl mx-auto p-6 lg:p-12 space-y-8 lg:space-y-12">
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm font-medium flex items-center gap-2 animate-shake">
            <span className="material-symbols-outlined text-lg">error</span>
            {error}
          </div>
        )}

        {/* Title Input */}
        <textarea
          placeholder="Recipe Title"
          rows={1}
          className="w-full text-4xl lg:text-5xl font-bold border-none focus:ring-0 p-0 placeholder:text-gray-200 resize-none leading-tight bg-transparent"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Left Column: Media & Basic Info */}
          <div className="lg:col-span-1 space-y-8">
            {/* Cover Photo Placeholder */}
            <div
              onClick={() => {
                const url = prompt('Enter image URL:');
                if (url) setImageUrl(url);
              }}
              className="aspect-video w-full rounded-2xl border-2 border-dashed border-gray-100 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors group relative overflow-hidden"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <>
                  <span className="material-symbols-outlined text-4xl text-gray-300 group-hover:text-primary transition-colors">add_a_photo</span>
                  <p className="text-sm font-medium text-gray-400 mt-2">Add a cover photo</p>
                </>
              )}
            </div>

            {/* Basic Info */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Basic Info</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold mb-2 text-text-dark">Prep Time</p>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-primary text-xl">schedule</span>
                    <input
                      type="number"
                      className="w-full h-12 pl-12 rounded-xl border-gray-200 focus:ring-primary/20 focus:border-primary"
                      value={prepTime}
                      onChange={(e) => setPrepTime(Number(e.target.value))}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium pointer-events-none">min</span>
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
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium pointer-events-none">ppl</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Categories</h3>
              <div className="flex flex-wrap gap-2">
                {availableTags.map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => toggleTag(tag.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${selectedTagIds.includes(tag.id)
                      ? 'bg-primary text-white scale-105 shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                  >
                    {tag.name}
                  </button>
                ))}
                <button className="px-4 py-2 border border-dashed border-gray-300 rounded-full text-xs text-gray-400 flex items-center gap-1 font-bold hover:border-primary hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-sm">add</span> Add Tag
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Ingredients & Steps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Ingredients */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Ingredients</h3>
              <div className="space-y-3">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="flex flex-col sm:flex-row gap-2 sm:items-center bg-gray-50/50 p-2 rounded-xl sm:bg-transparent sm:p-0">
                    <div className="flex gap-2 flex-1">
                      <input
                        type="text"
                        placeholder="Item name (e.g. Tomato)"
                        className="flex-[2] h-10 rounded-lg border-gray-200 focus:ring-primary/20 focus:border-primary text-sm"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                      />
                      <input
                        type="number"
                        placeholder="Qty"
                        className="w-20 h-10 rounded-lg border-gray-200 focus:ring-primary/20 focus:border-primary text-sm"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <select
                        className="flex-1 sm:w-28 h-10 rounded-lg border-gray-200 focus:ring-primary/20 focus:border-primary text-sm"
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      >
                        <option value="unidade">unid</option>
                        <option value="g">g</option>
                        <option value="kg">kg</option>
                        <option value="ml">ml</option>
                        <option value="l">L</option>
                        <option value="xícara">cup</option>
                        <option value="colher sopa">tbsp</option>
                        <option value="colher chá">tsp</option>
                        <option value="a gosto">to taste</option>
                      </select>
                      <button
                        onClick={() => removeIngredient(index)}
                        className="p-2 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg"
                      >
                        <span className="material-symbols-outlined text-xl">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addIngredient}
                  className="mt-2 text-primary font-bold text-sm flex items-center gap-1 hover:text-primary-dark transition-colors px-2 py-1 rounded-lg hover:bg-primary/5 w-max"
                >
                  <span className="material-symbols-outlined text-lg">add</span> Add Ingredient
                </button>
              </div>
            </div>

            {/* Preparation Steps */}
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-400 mb-4">Preparation Steps</h3>
              <div className="space-y-4">
                {steps.map((step, index) => (
                  <div key={index} className="relative pl-8 sm:pl-10 group">
                    <div className="absolute left-0 top-0 font-black text-gray-200 text-2xl select-none group-hover:text-primary/20 transition-colors">
                      {index + 1}
                    </div>
                    <div className="relative">
                      <textarea
                        placeholder={`Describe step ${index + 1}...`}
                        className="w-full min-h-[80px] rounded-2xl border-gray-200 p-4 focus:ring-primary/20 focus:border-primary text-sm leading-relaxed pr-10 resize-y"
                        value={step.description}
                        onChange={(e) => updateStep(index, e.target.value)}
                      />
                      <button
                        onClick={() => removeStep(index)}
                        className="absolute right-3 top-3 text-gray-400 hover:text-red-500 transition-colors hover:bg-red-50 rounded-lg p-1"
                      >
                        <span className="material-symbols-outlined text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addStep}
                  className="mt-2 text-primary font-bold text-sm flex items-center gap-1 hover:text-primary-dark transition-colors px-2 py-1 rounded-lg hover:bg-primary/5 w-max"
                >
                  <span className="material-symbols-outlined text-lg">add</span> Add Step
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 w-full p-6 bg-white/90 backdrop-blur-md border-t border-gray-100 flex gap-4 z-30 lg:static lg:bg-transparent lg:border-none lg:max-w-5xl lg:mx-auto lg:px-12 lg:pb-12 lg:pt-0">
        <button
          onClick={() => navigate('/')}
          className="flex-1 h-14 bg-gray-100 text-text-dark font-bold rounded-2xl active:scale-95 transition-all hover:bg-gray-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex-[2] h-14 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all disabled:opacity-50 hover:bg-primary-dark hover:shadow-primary/30"
        >
          {loading ? 'Saving...' : 'Save Recipe'}
        </button>
      </div>
    </div>
  );
};
