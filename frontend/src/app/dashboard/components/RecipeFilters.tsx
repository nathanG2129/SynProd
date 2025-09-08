import React, { useState, useEffect, useRef } from 'react';
import { productAPI } from '../../../services/api';
import { ProductType, getProductTypeDisplayName } from '../../../types/product';

interface FilterOptions {
  productTypes: ProductType[];
  components: string[];
  ingredients: string[];
}

interface RecipeFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  isSearching: boolean;
  count?: number;
  sortBy?: 'name' | 'createdAt' | 'productType';
  sortOrder?: 'asc' | 'desc';
  onSortByChange?: (sortBy: 'name' | 'createdAt' | 'productType') => void;
  onSortOrderChange?: (sortOrder: 'asc' | 'desc') => void;
}

export interface SearchFilters {
  name?: string;
  description?: string;
  componentName?: string;
  ingredientName?: string;
  productType?: ProductType;
}

export function RecipeFilters({ 
  onSearch, 
  onClear, 
  isSearching, 
  count,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderChange
}: RecipeFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [options, setOptions] = useState<FilterOptions>({
    productTypes: [],
    components: [],
    ingredients: []
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      const response = await productAPI.getFilterOptions();
      setOptions(response.data);
    } catch (error) {
      console.error('Error loading filter options:', error);
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const updateFilter = (key: keyof SearchFilters, value: string | number | undefined) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSearch = () => {
    // Remove empty values
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== '' && value !== null) {
        acc[key as keyof SearchFilters] = value;
      }
      return acc;
    }, {} as SearchFilters);

    onSearch(cleanFilters);
  };

  const handleClear = () => {
    setFilters({});
    setShowAdvanced(false);
    onClear();
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  // Auto-search as user types (debounced)
  useEffect(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          acc[key as keyof SearchFilters] = value;
        }
        return acc;
      }, {} as SearchFilters);

      if (Object.keys(cleanFilters).length > 0) {
        onSearch(cleanFilters);
      } else {
        onClear();
      }
    }, 100);

    return () => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }
    };
  }, [filters]);

  return (
    <div className="content-card">
      <div className="filters-header" style={{ marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#445c3c' }}>
          {count !== undefined ? `All Recipes (${count})` : 'Search & Filter Recipes'}
        </h3>
        
        <div className="filters-actions">
          {sortBy && sortOrder && onSortByChange && onSortOrderChange && (
            <>
              <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => onSortByChange(e.target.value as 'name' | 'createdAt' | 'productType')}
                style={{
                  padding: '6px 8px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px',
                  fontSize: '0.875rem'
                }}
              >
                <option value="name">Recipe Name</option>
                <option value="createdAt">Date Created</option>
                <option value="productType">Product Type</option>
              </select>
              
              <button
                onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#91b029',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18"/>
                    <path d="M6 12h12"/>
                    <path d="M9 18h6"/>
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 6h6"/>
                    <path d="M6 12h12"/>
                    <path d="M3 18h18"/>
                  </svg>
                )}
              </button>
            </>
          )}
          
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="btn btn-secondary"
            style={{ fontSize: '0.875rem', padding: '6px 12px' }}
          >
            {showAdvanced ? 'Simple Search' : 'Advanced Filters'}
          </button>
        </div>
      </div>

      {/* Basic Search */}
      <div className="form-group">
        <label htmlFor="basicSearch">Recipe Name</label>
        <input
          type="text"
          id="basicSearch"
          placeholder="Search by recipe name..."
          value={filters.name || ''}
          onChange={(e) => updateFilter('name', e.target.value)}
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '2px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '1rem'
          }}
        />
      </div>

      {/* Advanced Filters */}
      {showAdvanced && (
        <div className="advanced-filters" style={{ 
          borderTop: '1px solid #e2e8f0', 
          paddingTop: '16px',
          marginTop: '16px'
        }}>
          <div className="form-row">
            <div className="form-group">
              <label>Description Contains</label>
              <input
                type="text"
                placeholder="Search in descriptions..."
                value={filters.description || ''}
                onChange={(e) => updateFilter('description', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Product Type</label>
              <select
                value={filters.productType || ''}
                onChange={(e) => updateFilter('productType', e.target.value || undefined)}
                style={{
                  padding: '12px 16px',
                  border: '2px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  width: '100%'
                }}
              >
                <option value="">All Product Types</option>
                {options.productTypes.map(productType => (
                  <option key={productType} value={productType}>
                    {getProductTypeDisplayName(productType)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Component Contains</label>
              <input
                type="text"
                placeholder="e.g., Yogurt, Milk..."
                value={filters.componentName || ''}
                onChange={(e) => updateFilter('componentName', e.target.value)}
                list="components-datalist"
              />
              <datalist id="components-datalist">
                {options.components.map(component => (
                  <option key={component} value={component} />
                ))}
              </datalist>
            </div>

            <div className="form-group">
              <label>Ingredient Contains</label>
              <input
                type="text"
                placeholder="e.g., Salt, Sugar..."
                value={filters.ingredientName || ''}
                onChange={(e) => updateFilter('ingredientName', e.target.value)}
                list="ingredients-datalist"
              />
              <datalist id="ingredients-datalist">
                {options.ingredients.map(ingredient => (
                  <option key={ingredient} value={ingredient} />
                ))}
              </datalist>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        justifyContent: 'flex-end',
        marginTop: '16px',
        paddingTop: '16px',
        borderTop: '1px solid #e2e8f0'
      }}>
        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary"
            style={{ fontSize: '0.875rem' }}
            disabled={isLoadingOptions}
          >
            Clear Filters
          </button>
        )}
      </div>
    </div>
  );
}
