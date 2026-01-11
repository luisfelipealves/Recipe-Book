
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Recipe } from '../types';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/recipe/${recipe.id}`)}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow cursor-pointer group"
    >
      <div className="aspect-video sm:aspect-[4/3] lg:aspect-square relative overflow-hidden bg-gray-100">
        {recipe.image_url ? (
          <img
            src={recipe.image_url}
            alt={recipe.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <span className="material-symbols-outlined text-4xl">restaurant</span>
          </div>
        )}
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
            <span>{recipe.prep_time_minutes} mins</span>
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
