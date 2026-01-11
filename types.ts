
export interface Tag {
  id: string;
  name: string;
  color: string;
  recipe_count?: number;
}

export interface Ingredient {
  id?: string;
  recipe_id?: string;
  name: string;
  quantity: string;
  unit: string;
  order: number;
}

export interface Step {
  id?: string;
  recipe_id?: string;
  description: string;
  order: number;
}

export interface Recipe {
  id: string;
  title: string;
  image_url: string;
  prep_time_minutes: number;
  servings: number;
  created_at: string;
  user_id?: string;
  tags?: Tag[];
  ingredients?: Ingredient[];
  steps?: Step[];
}

export type NewRecipe = Omit<Recipe, 'id' | 'created_at' | 'tags' | 'ingredients' | 'steps' | 'prep_time_minutes'> & { prep_time_minutes: number };
