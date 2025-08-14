export enum ProductType {
  GREEK_YOGURT = 'GREEK_YOGURT',
  CHEESE = 'CHEESE',
  DRINKS = 'DRINKS'
}

export interface ProductTypeInfo {
  displayName: string;
  baseWeight: number;
  baseWeightUnit: string;
}

export const PRODUCT_TYPE_INFO: Record<ProductType, ProductTypeInfo> = {
  [ProductType.GREEK_YOGURT]: {
    displayName: 'Greek Yogurt',
    baseWeight: 380,
    baseWeightUnit: 'g'
  },
  [ProductType.CHEESE]: {
    displayName: 'Cheese',
    baseWeight: 400,
    baseWeightUnit: 'g'
  },
  [ProductType.DRINKS]: {
    displayName: 'Drinks',
    baseWeight: 220,
    baseWeightUnit: 'g'
  }
};

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
  productType: ProductType;
  compositions: ProductComposition[];
  additionalIngredients: ProductIngredient[];
  createdAt: string;
  updatedAt: string;
  createdByName?: string;
  totalCompositionPercentage?: number;
  // Convenience properties (calculated from productType)
  baseWeight?: number;
  baseWeightUnit?: string;
  baseWeightDisplay?: string;
}

export interface CreateProductRequest {
  name: string;
  description?: string;
  productType: ProductType;
  compositions?: ProductComposition[];
  additionalIngredients?: ProductIngredient[];
}

export interface ProductSearchParams {
  name?: string;
  sortBy?: 'name' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

// Helper functions
export const getProductTypeInfo = (productType: ProductType): ProductTypeInfo => {
  return PRODUCT_TYPE_INFO[productType];
};

export const getProductTypeDisplayName = (productType: ProductType): string => {
  return PRODUCT_TYPE_INFO[productType].displayName;
};

export const getProductBaseWeight = (productType: ProductType): number => {
  return PRODUCT_TYPE_INFO[productType].baseWeight;
};

export const getProductBaseWeightUnit = (productType: ProductType): string => {
  return PRODUCT_TYPE_INFO[productType].baseWeightUnit;
};

export const getProductBaseWeightDisplay = (productType: ProductType): string => {
  const info = PRODUCT_TYPE_INFO[productType];
  return `${info.baseWeight}${info.baseWeightUnit}`;
};
