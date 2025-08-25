import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../../../services/api';
import { Product, ProductType, getProductTypeDisplayName, getProductBaseWeightDisplay, PRODUCT_TYPE_INFO } from '../../../types/product';
import { useAuth } from '../../../contexts/AuthContext';

interface OrderCapacityConfig {
  unit: string;
  multiplier: number;
  label: string;
}

interface OrderCapacityOption {
  [key: string]: OrderCapacityConfig;
}

const ORDER_CAPACITY_OPTIONS: Record<ProductType, OrderCapacityOption> = {
  [ProductType.CHEESE]: {
    tubs: { unit: 'tubs', multiplier: 1, label: 'Tubs' }
  },
  [ProductType.GREEK_YOGURT]: {
    tubs: { unit: 'tubs', multiplier: 1, label: 'Tubs' }
  },
  [ProductType.DRINKS]: {
    bottles: { unit: 'bottles', multiplier: 1, label: 'Bottles' },
    pouches: { unit: 'pouches', multiplier: 5.5, label: 'Pouches' }
  }
};

export function RecipeDetail() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [selectedCapacityType, setSelectedCapacityType] = useState<string>('');
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadProduct(parseInt(id));
    }
  }, [id]);

  useEffect(() => {
    if (product) {
      // Set default capacity type based on product type
      const options = ORDER_CAPACITY_OPTIONS[product.productType];
      const firstOptionKey = Object.keys(options)[0];
      setSelectedCapacityType(firstOptionKey);
    }
  }, [product]);

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

  const calculateTotalWeight = () => {
    if (!product || !selectedCapacityType) return 0;
    
    const baseWeight = PRODUCT_TYPE_INFO[product.productType].baseWeight;
    const capacityConfig = ORDER_CAPACITY_OPTIONS[product.productType][selectedCapacityType];
    
    return baseWeight * orderQuantity * capacityConfig.multiplier;
  };

  const calculateComponentWeight = (percentage: number) => {
    const totalWeight = calculateTotalWeight();
    return (totalWeight * percentage) / 100;
  };

  const calculateIngredientForWeight = (quantity: number, unit: string, baseWeight: number) => {
    const totalWeight = calculateTotalWeight();
    const ratio = totalWeight / baseWeight;
    return quantity * ratio;
  };

  const toTwoDecimals = (value: number) => Math.round(value * 100) / 100;

  const handleQuantityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const parsed = parseFloat(raw);
    if (isNaN(parsed)) {
      setOrderQuantity(0);
      return;
    }
    const clamped = Math.max(0, parsed);
    setOrderQuantity(toTwoDecimals(clamped));
  };

  const handleTotalWeightInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product || !selectedCapacityType) return;
    const raw = e.target.value;
    const parsed = parseFloat(raw);
    if (isNaN(parsed)) return;
    const total = Math.max(0, parsed);
    const baseWeight = PRODUCT_TYPE_INFO[product.productType].baseWeight;
    const capacityConfig = ORDER_CAPACITY_OPTIONS[product.productType][selectedCapacityType];
    const newQuantity = total / (baseWeight * capacityConfig.multiplier);
    setOrderQuantity(toTwoDecimals(newQuantity));
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
          <Link to="/dashboard/recipes" className="btn btn-primary">
            Back to Recipe Library
          </Link>
        </div>
      </div>
    );
  }

  const capacityOptions = ORDER_CAPACITY_OPTIONS[product.productType];
  const totalWeight = calculateTotalWeight();
  const baseWeight = PRODUCT_TYPE_INFO[product.productType].baseWeight;

  return (
    <div className="dashboard-home">
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
              <Link 
                to="/dashboard/recipes" 
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
                Back to Recipe Library
              </Link>
            </div>
            <h1 className="page-title">{product.name} Recipe</h1>
            <p className="page-subtitle">Production Recipe & Order Calculator</p>
          </div>
        </div>
      </div>

      {/* Order Capacity Calculator */}
      <div className="content-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h2 style={{ margin: 0 }}>Order Capacity Calculator</h2>
          <span style={{ 
            color: '#445c3c',
            background: 'linear-gradient(135deg, #f1f6e8, #e8f5c8)',
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid rgba(145, 176, 41, 0.2)',
            fontSize: '0.875rem',
            fontWeight: '600'
          }}>
            {getProductTypeDisplayName(product.productType)}
          </span>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', alignItems: 'end' }}>
          <div className="form-group">
            <label htmlFor="orderQuantity">Quantity</label>
            <input
              type="number"
              id="orderQuantity"
              min="0"
              step="0.01"
              value={orderQuantity}
              onChange={handleQuantityInputChange}
              style={{
                padding: '12px 16px',
                border: '2px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                textAlign: 'center',
                fontWeight: '600'
              }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacityType">Unit Type</label>
            <select
              id="capacityType"
              value={selectedCapacityType}
              onChange={(e) => setSelectedCapacityType(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '500'
              }}
            >
              {Object.entries(capacityOptions).map(([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Total Weight</label>
            <input
              type="number"
              min="0"
              step="1"
              value={Number.isFinite(totalWeight) ? Number(totalWeight.toFixed(0)) : 0}
              onChange={handleTotalWeightInputChange}
              style={{ 
                background: 'linear-gradient(135deg, #91b029, #7a9a1f)',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '6px',
                textAlign: 'center',
                fontWeight: '600',
                fontSize: '1rem',
                border: 'none'
              }}
            />
          </div>
        </div>
      </div>

      {/* Recipe Composition & Additional Ingredients (side-by-side on wide, stacked on narrow) */}
      {(product.compositions && product.compositions.length > 0) || (product.additionalIngredients && product.additionalIngredients.length > 0) ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '16px', alignItems: 'start' }}>
          {product.compositions && product.compositions.length > 0 && (
            <div className="content-card" style={{ padding: '16px' }}>
              <h2 style={{ marginTop: 0 }}>Recipe Composition & Calculated Weights</h2>
              <div className="composition-list">
                {product.compositions
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((composition, index) => {
                    const componentWeight = calculateComponentWeight(composition.percentage);
                    return (
                      <div 
                        key={composition.id || index} 
                        className="composition-item"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr',
                          gap: '12px',
                          alignItems: 'center',
                          padding: '12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          background: 'linear-gradient(135deg, #ffffff 0%, #fefffe 100%)'
                        }}
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
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          textAlign: 'center'
                        }}>
                          {composition.percentage.toFixed(2)}%
                        </div>
                        
                        <div style={{
                          background: 'linear-gradient(135deg, #f1f6e8, #e8f5c8)',
                          color: '#445c3c',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          border: '1px solid rgba(145, 176, 41, 0.2)',
                          textAlign: 'center'
                        }}>
                          {componentWeight.toFixed(1)}g
                        </div>
                      </div>
                    );
                  })}
                
                {/* Total Composition Check */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr',
                  gap: '12px',
                  alignItems: 'center',
                  padding: '10px 12px',
                  background: 'linear-gradient(135deg, #f1f6e8, #e8f5c8)',
                  border: '1px solid #91b029',
                  borderRadius: '8px',
                  fontWeight: '600',
                  color: '#445c3c'
                }}>
                  <span>Total Composition:</span>
                  <span style={{ textAlign: 'center' }}>
                    {product.compositions.reduce((sum, comp) => sum + comp.percentage, 0).toFixed(1)}%
                  </span>
                  <span style={{ textAlign: 'center' }}>
                    {totalWeight.toFixed(1)}g
                  </span>
                </div>
              </div>
            </div>
          )}

          {product.additionalIngredients && product.additionalIngredients.length > 0 && (
            <div className="content-card" style={{ padding: '16px' }}>
              <h2 style={{ marginTop: 0 }}>Additional Ingredients & Calculated Amounts</h2>
              <div className="ingredients-list">
                {product.additionalIngredients
                  .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
                  .map((ingredient, index) => {
                    const calculatedAmount = calculateIngredientForWeight(ingredient.quantity, ingredient.unit, baseWeight);
                    return (
                      <div 
                        key={ingredient.id || index}
                        className="ingredient-item"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: '2fr 1fr 1fr',
                          gap: '12px',
                          alignItems: 'center',
                          padding: '12px',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          marginBottom: '8px',
                          background: 'linear-gradient(135deg, #ffffff 0%, #fefffe 100%)'
                        }}
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
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontWeight: '600',
                          fontSize: '0.85rem',
                          border: '1px solid rgba(145, 176, 41, 0.2)',
                          textAlign: 'center'
                        }}>
                          {ingredient.quantity} {ingredient.unit}
                          <div style={{ fontSize: '0.75rem', fontWeight: '400', color: '#64748b' }}>
                            per {baseWeight}g
                          </div>
                        </div>
                        
                        <div style={{
                          background: 'linear-gradient(135deg, #91b029, #7a9a1f)',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontWeight: '600',
                          fontSize: '0.95rem',
                          textAlign: 'center'
                        }}>
                          {calculatedAmount.toFixed(2)} {ingredient.unit}
                        </div>
                      </div>
                    );
                  })}
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
          <Link to="/dashboard/products" className="btn btn-primary">
            View in Product Management
          </Link>
        </div>
      )}
    </div>
  );
}
