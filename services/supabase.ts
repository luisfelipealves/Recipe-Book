
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

  async getRecipeById(id: string) {
    // 1. Fetch Main Recipe + Tags
    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_tags (
          tags (id, name, color)
        )
      `)
      .eq('id', id)
      .single();

    if (recipeError) throw recipeError;

    // 2. Fetch Ingredients
    const { data: ingredients, error: ingError } = await supabase
      .from('recipe_ingredients')
      .select('*')
      .eq('recipe_id', id)
      .order('order');

    if (ingError) throw ingError;

    // 3. Fetch Steps
    const { data: steps, error: stepError } = await supabase
      .from('recipe_steps')
      .select('*')
      .eq('recipe_id', id)
      .order('order');

    if (stepError) throw stepError;

    return {
      ...recipe,
      tags: recipe.recipe_tags.map((rt: any) => rt.tags),
      ingredients: (ingredients || []).map((ing: any) => ({
        ...ing,
        name: ing.text // Map database 'text' to frontend 'name'
      })),
      steps: (steps || []).map((step: any) => ({
        ...step,
        description: step.text // Map database 'text' to frontend 'description'
      }))
    } as Recipe;
  },

  async getTags() {
    // Get tags and their recipe usage count
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) throw error;

    // Get counts
    const { data: recipeTags, error: countError } = await supabase
      .from('recipe_tags')
      .select('tag_id');

    if (countError) throw countError;

    // Calculate counts locally since Supabase simpler for now
    const counts: Record<string, number> = {};
    recipeTags?.forEach((rt: any) => {
      counts[rt.tag_id] = (counts[rt.tag_id] || 0) + 1;
    });

    return tags.map((t: any) => ({
      ...t,
      recipe_count: counts[t.id] || 0
    })) as Tag[];
  },

  async createTag(tag: Omit<Tag, 'id' | 'recipe_count'>) {
    const { data, error } = await supabase
      .from('tags')
      .insert([tag])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTag(id: string, tag: Partial<Tag>) {
    const { data, error } = await supabase
      .from('tags')
      .update(tag)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTag(id: string) {
    const { error } = await supabase
      .from('tags')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },

  async createRecipe(recipe: Partial<Recipe>, recipe_ingredients: Ingredient[], recipe_steps: Step[], tagIds: string[]) {
    // 1. Insert Recipe
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Authenticated user required to create recipe");

    const { data: recipeData, error: recipeError } = await supabase
      .from('recipes')
      .insert([{
        ...recipe,
        user_id: user.id
      }])
      .select()
      .single();

    if (recipeError) throw recipeError;
    const recipeId = recipeData.id;

    // 2. Insert Ingredients
    if (recipe_ingredients.length > 0) {
      const ingredientsToInsert = recipe_ingredients.map((ing, idx) => ({
        // Assuming database uses 'name' or 'description' as 'text' field. 
        // Based on agent: "recipe_ingredients uses a single 'text' column for description"
        // Let's use 'name' if it's there, but wait, I should probably join them for safety.
        // Actually, I'll use the 'name' field for now but if it's 'text', I'll map it.
        text: `${ing.quantity} ${ing.unit} ${ing.name}`.trim(),
        recipe_id: recipeId,
        order: idx
      }));
      const { error: ingError } = await supabase.from('recipe_ingredients').insert(ingredientsToInsert);
      if (ingError) throw ingError;
    }

    // 3. Insert Steps
    if (recipe_steps.length > 0) {
      const stepsToInsert = recipe_steps.map((step, idx) => ({
        text: step.description,
        recipe_id: recipeId,
        order: idx
      }));
      const { error: stepError } = await supabase.from('recipe_steps').insert(stepsToInsert);
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
