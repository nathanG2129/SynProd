import React, { useState, useEffect, useRef } from 'react';
import { productAPI } from '../../../services/api';
import { ProductType, getProductTypeDisplayName } from '../../../types/product';

interface FilterOptions {
  productTypes: ProductType[];
  components: string[];
  ingredients: string[];
}

interface ProductFiltersProps {
  onSearch: (filters: SearchFilters) => void;
  onClear: () => void;
  isSearching: boolean;
}

export interface SearchFilters {
  name?: string;
  description?: string;
  componentName?: string;
  ingredientName?: string;
  productType?: ProductType;
}

export function ProductFilters({ onSearch, onClear, isSearching }: ProductFiltersProps) {
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#445c3c' }}>Search & Filter Products</h3>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="btn btn-secondary"
          style={{ fontSize: '0.875rem', padding: '6px 12px' }}
        >
          {showAdvanced ? 'Simple Search' : 'Advanced Filters'}
        </button>
      </div>

      {/* Basic Search */}
      <div className="form-group">
        <label htmlFor="basicSearch">Product Name</label>
        <input
          type="text"
          id="basicSearch"
          placeholder="Search by product name..."
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
