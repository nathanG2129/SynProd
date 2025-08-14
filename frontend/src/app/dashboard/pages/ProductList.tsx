import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { productAPI } from '../../../services/api';
import { Product, getProductTypeDisplayName, getProductBaseWeightDisplay } from '../../../types/product';
import { useAuth } from '../../../contexts/AuthContext';
import { ProductFilters, SearchFilters } from '../components/ProductFilters';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeFilters, setActiveFilters] = useState<SearchFilters>({});
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'productType'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; product: Product | null }>({ show: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const canManageProducts = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const canDeleteProducts = user?.role === 'ADMIN';

  // Redirect if user cannot manage products
  if (!canManageProducts) {
    return (
      <div className="dashboard-home">
        <div className="page-header">
          <h1 className="page-title">Access Denied</h1>
        </div>
        
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3>Access Denied</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            You need Manager or Admin privileges to access product management.
          </p>
          <Link to="/dashboard/recipes" className="btn btn-primary">
            View Recipes Instead
          </Link>
        </div>
      </div>
    );
  }

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    // Check for success message from navigation state
    if (location.state?.message) {
      // You could show a toast notification here
      console.log(location.state.message);
    }
  }, [location.state]);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError('');
      const response = await productAPI.getAllProducts();
      setProducts(response.data);
    } catch (err: any) {
      setError('Failed to load products');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdvancedSearch = async (filters: SearchFilters) => {
    try {
      setIsSearching(true);
      setError('');
      setActiveFilters(filters);
      
      const response = await productAPI.searchProductsAdvanced(filters);
      setSearchResults(response.data);
    } catch (err: any) {
      setError('Search failed');
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearSearch = () => {
    setSearchResults([]);
    setActiveFilters({});
    setIsSearching(false);
  };

  const handleDeleteProduct = async () => {
    if (!deleteConfirm.product || !canDeleteProducts) return;

    try {
      setIsDeleting(true);
      await productAPI.deleteProduct(deleteConfirm.product.id);
      
      // Remove from local state
      setProducts(products.filter(p => p.id !== deleteConfirm.product!.id));
      setSearchResults(searchResults.filter(p => p.id !== deleteConfirm.product!.id));
      
      setDeleteConfirm({ show: false, product: null });
    } catch (err: any) {
      setError('Failed to delete product');
      console.error('Error deleting product:', err);
    } finally {
      setIsDeleting(false);
    }
  };

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

  const hasActiveSearch = Object.keys(activeFilters).length > 0;
  const displayProducts = sortProducts(hasActiveSearch ? searchResults : products);

  if (isLoading) {
    return (
      <div className="dashboard-home">
        <div className="page-header">
          <h1 className="page-title">Products & Recipes</h1>
          <p className="page-subtitle">Loading products...</p>
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
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 className="page-title">Product Management</h1>
            <p className="page-subtitle">Create, edit, and manage product recipes</p>
          </div>
          
          {canManageProducts && (
            <Link to="/dashboard/products/new" className="btn btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Product
            </Link>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message" style={{ marginBottom: '24px' }}>
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <ProductFilters
        onSearch={handleAdvancedSearch}
        onClear={handleClearSearch}
        isSearching={isSearching}
      />

      {/* Sorting Options */}
      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#445c3c' }}>
            {hasActiveSearch ? `Search Results (${displayProducts.length})` : `All Products (${displayProducts.length})`}
          </h3>
          
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <label style={{ fontSize: '0.875rem', color: '#64748b' }}>Sort by:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'createdAt' | 'productType')}
              style={{
                padding: '6px 8px',
                border: '1px solid #e2e8f0',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}
            >
              <option value="name">Name</option>
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
      </div>

      {/* Products Grid */}
      {displayProducts.length === 0 ? (
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#91b029" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
          <h3>No Products Found</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            {hasActiveSearch 
              ? 'No products found matching your search criteria.'
              : 'No products have been created yet.'
            }
          </p>
          {canManageProducts && !hasActiveSearch && (
            <Link to="/dashboard/products/new" className="btn btn-primary">
              Create First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="products-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '24px'
        }}>
          {displayProducts.map((product) => (
            <div key={product.id} className="content-card product-card" style={{
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              height: 'fit-content'
            }}>
              <Link 
                to={`/dashboard/products/${product.id}`} 
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
                    marginBottom: '12px'
                  }}>
                    <span style={{
                      background: 'linear-gradient(135deg, #f1f6e8, #e8f5c8)',
                      color: '#445c3c',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
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
                      {getProductBaseWeightDisplay(product.productType)}
                    </span>
                    
                    {product.compositions && product.compositions.length > 0 && (
                      <span style={{
                        color: '#718096',
                        fontSize: '0.75rem'
                      }}>
                        {product.compositions.length} component{product.compositions.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    
                    {product.additionalIngredients && product.additionalIngredients.length > 0 && (
                      <span style={{
                        color: '#718096',
                        fontSize: '0.75rem'
                      }}>
                        {product.additionalIngredients.length} ingredient{product.additionalIngredients.length !== 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

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
                borderTop: '2px solid #e2e8f0',
                paddingTop: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <Link 
                    to={`/dashboard/products/${product.id}/edit`}
                    className="btn btn-primary"
                    style={{ flex: 1, fontSize: '0.75rem', padding: '8px 12px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                    </svg>
                    Edit Product
                  </Link>
                  <Link 
                    to={`/dashboard/products/${product.id}`}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.75rem', padding: '8px 12px' }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    View Details
                  </Link>
                </div>
                {canDeleteProducts && (
                  <button 
                    className="btn btn-danger"
                    style={{ fontSize: '0.75rem', padding: '8px 12px', width: '100%' }}
                    onClick={(e) => {
                      e.preventDefault();
                      setDeleteConfirm({ show: true, product });
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                    </svg>
                    Delete Product
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && deleteConfirm.product && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>
              Delete Product
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#64748b' }}>
              Are you sure you want to delete "{deleteConfirm.product.name}"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setDeleteConfirm({ show: false, product: null })}
                className="btn btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDeleteProduct}
                className="btn btn-danger"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Product'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
