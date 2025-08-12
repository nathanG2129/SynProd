import React, { useState, useEffect } from 'react';
import { productAPI } from '../../../services/api';

interface FilterOptions {
  units: string[];
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
  minWeight?: number;
  maxWeight?: number;
  unit?: string;
}

export function ProductFilters({ onSearch, onClear, isSearching }: ProductFiltersProps) {
  const [filters, setFilters] = useState<SearchFilters>({});
  const [options, setOptions] = useState<FilterOptions>({
    units: [],
    components: [],
    ingredients: []
  });
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);

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
            border: '1px solid #e2e8f0',
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
              <label>Unit</label>
              <select
                value={filters.unit || ''}
                onChange={(e) => updateFilter('unit', e.target.value || undefined)}
                style={{
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  width: '100%'
                }}
              >
                <option value="">All Units</option>
                {options.units.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
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

          <div className="form-row">
            <div className="form-group">
              <label>Min Weight</label>
              <input
                type="number"
                placeholder="0"
                min="0"
                step="0.01"
                value={filters.minWeight || ''}
                onChange={(e) => updateFilter('minWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div className="form-group">
              <label>Max Weight</label>
              <input
                type="number"
                placeholder="1000"
                min="0"
                step="0.01"
                value={filters.maxWeight || ''}
                onChange={(e) => updateFilter('maxWeight', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
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
          >
            Clear Filters
          </button>
        )}
        
        <button
          type="button"
          onClick={handleSearch}
          className="btn btn-primary"
          disabled={isSearching || isLoadingOptions}
          style={{ fontSize: '0.875rem' }}
        >
          {isSearching ? (
            <>
              <div style={{ 
                width: '14px', 
                height: '14px', 
                border: '2px solid transparent',
                borderTop: '2px solid currentColor',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite',
                marginRight: '8px'
              }}></div>
              Searching...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Search Products
            </>
          )}
        </button>
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div style={{ 
          marginTop: '16px',
          padding: '12px',
          background: 'linear-gradient(135deg, #f1f6e8, #e8f5c8)',
          border: '1px solid rgba(145, 176, 41, 0.3)',
          borderRadius: '6px'
        }}>
          <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#445c3c', marginBottom: '8px' }}>
            Active Filters:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {Object.entries(filters).map(([key, value]) => {
              if (value === undefined || value === '' || value === null) return null;
              
              const displayKey = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
              return (
                <span
                  key={key}
                  style={{
                    background: 'white',
                    border: '1px solid rgba(145, 176, 41, 0.3)',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    fontSize: '0.75rem',
                    color: '#445c3c',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <strong>{displayKey}:</strong> {value}
                  <button
                    type="button"
                    onClick={() => updateFilter(key as keyof SearchFilters, undefined)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      padding: '0',
                      display: 'flex',
                      alignItems: 'center'
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18"/>
                      <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
