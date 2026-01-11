
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
  order_index: number;
}

export interface Step {
  id?: string;
  recipe_id?: string;
  description: string;
  order_index: number;
}

export interface Recipe {
  id: string;
  title: string;
  image_url: string;
  prep_time_mins: number;
  servings: number;
  rating: number;
  created_at: string;
  user_id?: string;
  tags?: Tag[];
  ingredients?: Ingredient[];
  steps?: Step[];
}

export type NewRecipe = Omit<Recipe, 'id' | 'created_at' | 'tags' | 'ingredients' | 'steps'>;
