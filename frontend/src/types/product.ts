export interface ProductComposition {
  id?: number;
  componentName: string;
  percentage: number;
  notes?: string;
  sortOrder?: number;
}

export interface ProductIngredient {
  id?: number;
  ingredientName: string;
  quantity: number;
  unit: string;
  notes?: string;
  sortOrder?: number;
}

export interface Product {
  id: number;
  name: string;
  description?: string;
  baseWeight: number;
  baseWeightUnit: string;
  compositions: ProductComposition[];
  additionalIngredients: ProductIngredient[];
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
  totalCompositionPercentage?: number;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  baseWeight: number;
  baseWeightUnit: string;
  compositions?: ProductComposition[];
  additionalIngredients?: ProductIngredient[];
}

export interface ProductSearchParams {
  name?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}
