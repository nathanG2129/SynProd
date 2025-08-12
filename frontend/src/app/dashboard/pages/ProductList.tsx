import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { productAPI } from '../../../services/api';
import { Product } from '../../../types/product';
import { useAuth } from '../../../contexts/AuthContext';

export function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; product: Product | null }>({ show: false, product: null });
  const [isDeleting, setIsDeleting] = useState(false);
  const { user } = useAuth();
  const location = useLocation();

  const canManageProducts = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const canDeleteProducts = user?.role === 'ADMIN';

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

  const handleSearch = async (term: string) => {
    setSearchTerm(term);
    
    if (!term.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    try {
      setIsSearching(true);
      const response = await productAPI.searchProducts(term);
      setSearchResults(response.data);
    } catch (err: any) {
      console.error('Search error:', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
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

  const displayProducts = searchTerm.trim() ? searchResults : products;

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
            <h1 className="page-title">Products & Recipes</h1>
            <p className="page-subtitle">Browse and search product recipes</p>
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

      {/* Search Bar */}
      <div className="content-card">
        <div className="form-group">
          <label htmlFor="search">Search Products</label>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              id="search"
              placeholder="Search by product name..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 40px 12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
            />
            <div style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#718096'
            }}>
              {isSearching ? (
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid #e2e8f0',
                  borderTop: '2px solid #91b029',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              )}
            </div>
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
            {searchTerm.trim() 
              ? `No products found matching "${searchTerm}"`
              : 'No products have been created yet.'
            }
          </p>
          {canManageProducts && !searchTerm.trim() && (
            <Link to="/dashboard/products/new" className="btn btn-primary">
              Create First Product
            </Link>
          )}
        </div>
      ) : (
        <div className="products-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
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
                      fontWeight: '500'
                    }}>
                      {product.baseWeight} {product.baseWeightUnit}
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
              
              {canManageProducts && (
                <div style={{
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '12px',
                  display: 'flex',
                  gap: '8px'
                }}>
                  <Link 
                    to={`/dashboard/products/${product.id}/edit`}
                    className="btn btn-secondary"
                    style={{ flex: 1, fontSize: '0.75rem', padding: '6px 12px' }}
                  >
                    Edit
                  </Link>
                  {canDeleteProducts && (
                    <button 
                      className="btn btn-danger"
                      style={{ flex: 1, fontSize: '0.75rem', padding: '6px 12px' }}
                      onClick={(e) => {
                        e.preventDefault();
                        setDeleteConfirm({ show: true, product });
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
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
