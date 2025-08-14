import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productAPI } from '../../../services/api';
import { Product, getProductTypeDisplayName, getProductBaseWeightDisplay } from '../../../types/product';
import { useAuth } from '../../../contexts/AuthContext';

export function RecipeList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'productType'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const { user } = useAuth();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await productAPI.getAllProducts();
      setProducts(response.data);
    } catch (err: any) {
      setError('Failed to load recipes');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.description && product.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const sortProducts = (productsToSort: Product[]) => {
    return [...productsToSort].sort((a, b) => {
      let aValue: any, bValue: any;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt);
          bValue = new Date(b.createdAt);
          break;
        case 'productType':
          aValue = getProductTypeDisplayName(a.productType);
          bValue = getProductTypeDisplayName(b.productType);
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const displayProducts = sortProducts(filteredProducts);

  if (isLoading) {
    return (
      <div className="dashboard-home">
        <div className="page-header">
          <h1 className="page-title">Recipe Library</h1>
          <p className="page-subtitle">Loading recipes...</p>
        </div>
        
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #91b029',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <div>
          <h1 className="page-title">Recipe Library</h1>
          <p className="page-subtitle">Browse and view production recipes</p>
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <div className="content-card">
        <h3 style={{ margin: '0 0 16px 0', color: '#445c3c' }}>Search Recipes</h3>
        
        <div className="form-group">
          <label htmlFor="recipeSearch">Search by name or description</label>
          <input
            type="text"
            id="recipeSearch"
            placeholder="Search recipes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '2px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '1rem'
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '16px' }}>
          <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'productType')}
            style={{
              padding: '6px 8px',
              border: '2px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '0.875rem'
            }}
          >
            <option value="name">Recipe Name</option>
            <option value="createdAt">Date Created</option>
            <option value="productType">Product Type</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
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
        </div>
      </div>

      {/* Recipe Count */}
      <div className="content-card">
        <h3 style={{ margin: 0, color: '#445c3c' }}>
          {searchTerm ? `Search Results (${displayProducts.length})` : `All Recipes (${displayProducts.length})`}
        </h3>
      </div>

      {/* Recipes Grid */}
      {displayProducts.length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#91b029" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
          <h3>No Recipes Found</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            {searchTerm 
              ? 'No recipes found matching your search.'
              : 'No recipes are available yet.'
            }
          </p>
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="btn btn-secondary"
            >
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className="recipes-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {displayProducts.map((product) => (
            <div key={product.id} className="content-card recipe-card" style={{
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              height: 'fit-content'
            }}>
              <Link 
                to={`/dashboard/recipes/${product.id}`} 
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ 
                    margin: '0 0 8px 0', 
                    fontSize: '1.25rem',
                    background: 'linear-gradient(135deg, #445c3c, #91b029)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}>
                    {product.name}
                  </h3>
                  
                  {product.description && (
                    <p style={{ 
                      color: '#64748b', 
                      fontSize: '0.875rem',
                      margin: '0 0 12px 0',
                      lineHeight: '1.4'
                    }}>
                      {product.description}
                    </p>
                  )}
                  
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    marginBottom: '12px',
                    flexWrap: 'wrap'
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #f1f6e8, #e8f5c8)',
                      color: '#445c3c',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      border: '1px solid rgba(145, 176, 41, 0.2)'
                    }}>
                      {getProductTypeDisplayName(product.productType)}
                    </span>
                    
                    <span style={{
                      color: '#6b7a42',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      marginLeft: '8px'
                    }}>
                      Base: {getProductBaseWeightDisplay(product.productType)}
                    </span>
                    
                    {product.compositions && product.compositions.length > 0 && (
                      <span style={{
                        background: 'linear-gradient(135deg, #91b029, #7a9a1f)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        {product.compositions.length} Component{product.compositions.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    
                    {product.additionalIngredients && product.additionalIngredients.length > 0 && (
                      <span style={{
                        background: 'linear-gradient(135deg, #445c3c, #5a6e42)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: '500'
                      }}>
                        +{product.additionalIngredients.length} Ingredient{product.additionalIngredients.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  {/* Recipe composition preview */}
                  {product.compositions && product.compositions.length > 0 && (
                    <div style={{ marginBottom: '12px' }}>
                      <h4 style={{ 
                        fontSize: '0.8rem', 
                        fontWeight: '600', 
                        color: '#445c3c',
                        margin: '0 0 6px 0',
                        textTransform: 'uppercase',
                        letterSpacing: '0.025em'
                      }}>
                        Main Components:
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {product.compositions.slice(0, 3).map((comp, index) => (
                          <span
                            key={index}
                            style={{
                              fontSize: '0.7rem',
                              background: 'rgba(145, 176, 41, 0.1)',
                              color: '#445c3c',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              border: '1px solid rgba(145, 176, 41, 0.2)'
                            }}
                          >
                            {comp.componentName} ({comp.percentage}%)
                          </span>
                        ))}
                        {product.compositions.length > 3 && (
                          <span style={{
                            fontSize: '0.7rem',
                            color: '#718096',
                            padding: '2px 6px'
                          }}>
                            +{product.compositions.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {product.createdByName && (
                    <p style={{ 
                      color: '#a0aec0',
                      fontSize: '0.75rem',
                      margin: '0',
                      fontStyle: 'italic'
                    }}>
                      Created by {product.createdByName}
                    </p>
                  )}
                </div>
              </Link>
              
              <div style={{
                borderTop: '1px solid #e2e8f0',
                paddingTop: '12px',
                textAlign: 'center'
              }}>
                <Link 
                  to={`/dashboard/recipes/${product.id}`}
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem', padding: '8px 16px', width: '100%' }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                  View Recipe
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
