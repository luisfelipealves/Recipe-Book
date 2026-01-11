
import { createClient } from '@supabase/supabase-js';
import { Recipe, Tag, Ingredient, Step } from '../types';

const SUPABASE_URL = 'https://mwnokfbzpcfshqsynttt.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8YKw66mDFBAdOyBniD_E0w_cluwFbjv';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export const recipeService = {
  async getAllRecipes() {
    const { data, error } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_tags (
          tag_id,
          tags (id, name, color)
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data.map((r: any) => ({
      ...r,
      tags: r.recipe_tags.map((rt: any) => rt.tags)
    })) as Recipe[];
  },

  async getTags() {
    const { data, error } = await supabase.from('tags').select('*');
    if (error) throw error;
    return data as Tag[];
  },

  async createRecipe(recipe: Partial<Recipe>, ingredients: Ingredient[], steps: Step[], tagIds: string[]) {
    // 1. Insert Recipe
    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert([recipe])
      .select()
      .single();

    if (recipeError) throw recipeError;
    const recipeId = recipeData.id;

    // 2. Insert Ingredients
    if (ingredients.length > 0) {
      const ingredientsToInsert = ingredients.map((ing, idx) => ({
        ...ing,
        recipe_id: recipeId,
        order_index: idx
      }));
      const { error: ingError } = await supabase.from('ingredients').insert(ingredientsToInsert);
      if (ingError) throw ingError;
    }

    // 3. Insert Steps
    if (steps.length > 0) {
      const stepsToInsert = steps.map((step, idx) => ({
        ...step,
        recipe_id: recipeId,
        order_index: idx
      }));
      const { error: stepError } = await supabase.from('steps').insert(stepsToInsert);
      if (stepError) throw stepError;
    }

    // 4. Insert Tags
    if (tagIds.length > 0) {
      const tagsToInsert = tagIds.map(tagId => ({
        recipe_id: recipeId,
        tag_id: tagId
      }));
      const { error: tagError } = await supabase.from('recipe_tags').insert(tagsToInsert);
      if (tagError) throw tagError;
    }

    return recipeData;
  }
};
