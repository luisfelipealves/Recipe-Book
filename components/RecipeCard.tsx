
import React from 'react';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
      <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
        {recipe.image_url ? (
          <img 
            src={recipe.image_url} 
            alt={recipe.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
             <span className="material-symbols-outlined text-4xl">restaurant</span>
          </div>
        )}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <span className="material-symbols-outlined text-yellow-500 text-sm fill-current">star</span>
          <span className="text-xs font-bold">{recipe.rating || 0}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
          {recipe.tags?.map(tag => (
            <span 
              key={tag.id} 
              className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
            >
              {tag.name}
            </span>
          ))}
        </div>
        <h3 className="text-text-dark font-bold text-lg mb-1 line-clamp-1">{recipe.title}</h3>
        <div className="flex items-center gap-4 text-gray-500 text-xs">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">schedule</span>
            <span>{recipe.prep_time_mins} mins</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">group</span>
            <span>{recipe.servings} serving</span>
          </div>
        </div>
      </div>
    </div>
  );
};
