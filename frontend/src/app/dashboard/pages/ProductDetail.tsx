import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../../../services/api';
import { Product, getProductTypeDisplayName } from '../../../types/product';
import { useAuth } from '../../../contexts/AuthContext';

export function ProductDetail() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canManageProducts = user?.role === 'MANAGER' || user?.role === 'ADMIN';
  const canDeleteProducts = user?.role === 'ADMIN';

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)');
    const updateIsMobile = () => setIsMobile(mq.matches);
    updateIsMobile();
    mq.addEventListener?.('change', updateIsMobile);
    // @ts-ignore legacy Safari
    mq.addListener && mq.addListener(updateIsMobile);
    return () => {
      mq.removeEventListener?.('change', updateIsMobile);
      // @ts-ignore legacy Safari
      mq.removeListener && mq.removeListener(updateIsMobile);
    };
  }, []);

  const loadProduct = async (productId: number) => {
    try {
      setIsLoading(true);
      setError('');
      const response = await productAPI.getProductById(productId);
      setProduct(response.data);
    } catch (err: any) {
      setError('Failed to load product details');
      console.error('Error loading product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product || !canDeleteProducts) return;

    try {
      setIsDeleting(true);
      await productAPI.deleteProduct(product.id);
      navigate('/dashboard/products', { 
        state: { message: `Product "${product.name}" has been deleted successfully.` }
      });
    } catch (err: any) {
      setError('Failed to delete product');
      console.error('Error deleting product:', err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="dashboard-home">
        <div className="page-header">
          <h1 className="page-title">Loading Recipe...</h1>
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
          <p>Loading recipe details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="dashboard-home">
        <div className="page-header">
          <h1 className="page-title">Recipe Not Found</h1>
        </div>
        
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3>Recipe Not Found</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            {error || 'The requested product recipe could not be found.'}
          </p>
          <Link to="/dashboard/products" className="btn btn-primary">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <div className="list-controls">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Link 
                to="/dashboard/products" 
                style={{ 
                  color: '#91b029', 
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="m15 18-6-6 6-6"/>
                </svg>
                Back to Products
              </Link>
            </div>
            <h1 className="page-title">{product.name}</h1>
            <p className="page-subtitle">Production Recipe</p>
          </div>
          
          {canManageProducts && (
            <div 
              className="product-actions"
              style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center' }}
            >
              <Link 
                to={`/dashboard/products/${product.id}/edit`} 
                className="btn btn-secondary"
                style={isMobile ? { width: '100%' } : undefined}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                  <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>
                </svg>
                Edit Recipe
              </Link>
              
              {canDeleteProducts && (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="btn btn-danger"
                  style={isMobile ? { width: '100%' } : undefined}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                  </svg>
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <div className="content-card">
        <h2>Product Information</h2>
        <div className="product-info-grid">
          <div>
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#445c3c' }}>Product Type:</strong>
              <span style={{ 
                marginLeft: '8px', 
                color: '#445c3c',
                background: 'linear-gradient(135deg, #f1f6e8, #e8f5c8)',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid rgba(145, 176, 41, 0.2)',
                fontSize: '0.875rem',
                fontWeight: '500'
              }}>
                {getProductTypeDisplayName(product.productType)}
              </span>
            </div>

            
            {product.description && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#445c3c' }}>Description:</strong>
                <p style={{ margin: '4px 0 0 0', color: '#64748b', lineHeight: '1.5' }}>
                  {product.description}
                </p>
              </div>
            )}
          </div>
          
          <div>
            {product.createdByName && (
              <div style={{ marginBottom: '12px' }}>
                <strong style={{ color: '#445c3c' }}>Created by:</strong>
                <span style={{ marginLeft: '8px', color: '#64748b' }}>
                  {product.createdByName}
                </span>
              </div>
            )}
            
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#445c3c' }}>Created:</strong>
              <span style={{ marginLeft: '8px', color: '#64748b' }}>
                {new Date(product.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recipe Composition & Additional Ingredients side-by-side */}
      {(product.compositions && product.compositions.length > 0) || (product.additionalIngredients && product.additionalIngredients.length > 0) ? (
        <div className="recipe-sections-grid">
          {product.compositions && product.compositions.length > 0 && (
            <div className="content-card">
              <h2>Recipe Composition</h2>
              <div className="composition-list">
                {product.compositions
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((composition, index) => (
                    <div 
                      key={composition.id || index} 
                      className="composition-item"
                    >
                      <div>
                        <h4 style={{ 
                          margin: '0 0 4px 0', 
                          color: '#1e293b',
                          fontSize: '1rem'
                        }}>
                          {composition.componentName}
                        </h4>
                        {composition.notes && (
                          <p style={{ 
                            margin: '0',
                            fontSize: '0.875rem',
                            color: '#64748b',
                            fontStyle: 'italic'
                          }}>
                            {composition.notes}
                          </p>
                        )}
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #91b029, #7a9a1f)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        textAlign: 'center'
                      }}>
                        {composition.percentage.toFixed(2)}%
                      </div>
                    </div>
                  ))}
                
                {/* Total Percentage Check */}
                <div style={{
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, #f1f6e8, #e8f5c8)',
                  border: '1px solid #91b029',
                  borderRadius: '8px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontWeight: '600',
                  color: '#445c3c'
                }}>
                  <span>Total Composition:</span>
                  <span>
                    {product.compositions.reduce((sum, comp) => sum + comp.percentage, 0).toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>
          )}

          {product.additionalIngredients && product.additionalIngredients.length > 0 && (
            <div className="content-card">
              <h2>Additional Ingredients</h2>
              <div className="ingredients-list">
                {product.additionalIngredients
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((ingredient, index) => (
                    <div 
                      key={ingredient.id || index}
                      className="ingredient-item"
                    >
                      <div>
                        <h4 style={{ 
                          margin: '0 0 4px 0', 
                          color: '#1e293b',
                          fontSize: '1rem'
                        }}>
                          {ingredient.ingredientName}
                        </h4>
                        {ingredient.notes && (
                          <p style={{ 
                            margin: '0',
                            fontSize: '0.875rem',
                            color: '#64748b',
                            fontStyle: 'italic'
                          }}>
                            {ingredient.notes}
                          </p>
                        )}
                      </div>
                      <div style={{
                        background: 'linear-gradient(135deg, #f1f6e8, #e8f5c8)',
                        color: '#445c3c',
                        padding: '8px 16px',
                        borderRadius: '20px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        border: '1px solid rgba(145, 176, 41, 0.2)',
                        textAlign: 'center'
                      }}>
                        {ingredient.quantity} {ingredient.unit}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* No Recipe Data */}
      {(!product.compositions || product.compositions.length === 0) && 
       (!product.additionalIngredients || product.additionalIngredients.length === 0) && (
        <div className="content-card" style={{ textAlign: 'center', padding: '40px' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#91b029" strokeWidth="2" style={{ margin: '0 auto 16px' }}>
            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
          </svg>
          <h3>No Recipe Data</h3>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            This product doesn't have composition or ingredient data yet.
          </p>
          {canManageProducts && (
            <Link to={`/dashboard/products/${product.id}/edit`} className="btn btn-primary">
              Add Recipe Data
            </Link>
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
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
              Are you sure you want to delete "{product.name}"? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn btn-secondary"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={handleDelete}
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
