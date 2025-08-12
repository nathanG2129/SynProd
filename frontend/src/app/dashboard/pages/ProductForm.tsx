import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { productAPI } from '../../../services/api';
import { Product, ProductComposition, ProductIngredient, CreateProductRequest } from '../../../types/product';
import { useAuth } from '../../../contexts/AuthContext';
import { useFormValidation } from '../../../hooks/useFormValidation';

export function ProductForm() {
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form data
  const [compositions, setCompositions] = useState<ProductComposition[]>([]);
  const [ingredients, setIngredients] = useState<ProductIngredient[]>([]);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isEditing = !!id && id !== 'new';
  const canManageProducts = user?.role === 'MANAGER' || user?.role === 'ADMIN';

  // Form validation
  const validationRules = {
    name: { required: true },
    baseWeight: { required: true },
    baseWeightUnit: { required: true }
  };

  const {
    formData,
    updateField,
    handleBlur,
    handleSubmit,
    getFieldError,
    getFieldValidationState,
    resetForm
  } = useFormValidation(
    { 
      name: '', 
      description: '', 
      baseWeight: '100', 
      baseWeightUnit: 'kg' 
    },
    validationRules,
    { validateOnBlur: true, validateOnSubmit: true }
  );

  useEffect(() => {
    if (!canManageProducts) {
      navigate('/dashboard/products');
      return;
    }

    if (isEditing) {
      loadProduct();
    }
  }, [id, canManageProducts]);

  const loadProduct = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      setError('');
      const response = await productAPI.getProductById(parseInt(id));
      const productData = response.data;
      
      setProduct(productData);
      
      // Update form with product data
      updateField('name', productData.name);
      updateField('description', productData.description || '');
      updateField('baseWeight', productData.baseWeight.toString());
      updateField('baseWeightUnit', productData.baseWeightUnit);
      
      // Set compositions and ingredients
      setCompositions(productData.compositions || []);
      setIngredients(productData.additionalIngredients || []);
      
    } catch (err: any) {
      setError('Failed to load product details');
      console.error('Error loading product:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const addComposition = () => {
    setCompositions([...compositions, {
      componentName: '',
      percentage: 0,
      notes: ''
    }]);
  };

  const updateComposition = (index: number, field: keyof ProductComposition, value: string | number) => {
    const updated = [...compositions];
    updated[index] = { ...updated[index], [field]: value };
    setCompositions(updated);
  };

  const removeComposition = (index: number) => {
    setCompositions(compositions.filter((_, i) => i !== index));
  };

  const addIngredient = () => {
    setIngredients([...ingredients, {
      ingredientName: '',
      quantity: 0,
      unit: '',
      notes: ''
    }]);
  };

  const updateIngredient = (index: number, field: keyof ProductIngredient, value: string | number) => {
    const updated = [...ingredients];
    updated[index] = { ...updated[index], [field]: value };
    setIngredients(updated);
  };

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const getTotalPercentage = () => {
    return compositions.reduce((sum, comp) => sum + (comp.percentage || 0), 0);
  };

  const validateCompositions = () => {
    if (compositions.length === 0) return true;
    
    // Check if all compositions have required fields
    const hasInvalidComposition = compositions.some(comp => 
      !comp.componentName.trim() || comp.percentage <= 0
    );
    
    if (hasInvalidComposition) {
      setError('All composition components must have a name and percentage greater than 0');
      return false;
    }

    // Check if total percentage equals 100%
    const total = getTotalPercentage();
    if (Math.abs(total - 100) > 0.01) {
      setError(`Total composition percentage must equal 100%. Current total: ${total.toFixed(1)}%`);
      return false;
    }

    return true;
  };

  const validateIngredients = () => {
    if (ingredients.length === 0) return true;
    
    const hasInvalidIngredient = ingredients.some(ing => 
      !ing.ingredientName.trim() || ing.quantity <= 0 || !ing.unit.trim()
    );
    
    if (hasInvalidIngredient) {
      setError('All ingredients must have a name, quantity greater than 0, and unit');
      return false;
    }

    return true;
  };

  const onSubmit = async (data: Record<string, string>) => {
    setError('');
    setSuccess('');

    // Validate compositions and ingredients
    if (!validateCompositions() || !validateIngredients()) {
      return;
    }

    const requestData: CreateProductRequest = {
      name: data.name,
      description: data.description || undefined,
      baseWeight: parseFloat(data.baseWeight),
      baseWeightUnit: data.baseWeightUnit,
      compositions: compositions.length > 0 ? compositions : undefined,
      additionalIngredients: ingredients.length > 0 ? ingredients : undefined
    };

    try {
      setIsSubmitting(true);
      
      if (isEditing && product) {
        await productAPI.updateProduct(product.id, requestData);
        setSuccess('Product updated successfully!');
        setTimeout(() => {
          navigate(`/dashboard/products/${product.id}`);
        }, 1500);
      } else {
        const response = await productAPI.createProduct(requestData);
        setSuccess('Product created successfully!');
        setTimeout(() => {
          navigate(`/dashboard/products/${response.data.id}`);
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} product`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!canManageProducts) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="dashboard-home">
        <div className="page-header">
          <h1 className="page-title">Loading...</h1>
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
          <p>Loading product data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="page-header">
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
          <h1 className="page-title">
            {isEditing ? `Edit ${product?.name || 'Product'}` : 'Create New Product'}
          </h1>
          <p className="page-subtitle">
            {isEditing ? 'Update product recipe and details' : 'Add a new product with recipe information'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="product-form">
        {error && (
          <div className="error-message" style={{ marginBottom: '24px' }}>
            {error}
          </div>
        )}

        {success && (
          <div className="success-message" style={{ marginBottom: '24px' }}>
            {success}
          </div>
        )}

        {/* Basic Product Information */}
        <div className="content-card">
          <h2>Product Information</h2>
          
          <div className="form-group">
            <label htmlFor="name">Product Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={(e) => updateField('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              className={getFieldValidationState('name')}
              placeholder="Enter product name"
              required
            />
            {getFieldError('name') && (
              <div className="validation-message error">
                {getFieldError('name')}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              onBlur={() => handleBlur('description')}
              className={getFieldValidationState('description')}
              placeholder="Enter product description (optional)"
              rows={3}
              style={{
                padding: '12px 16px',
                border: '1px solid #e2e8f0',
                borderRadius: '6px',
                fontSize: '1rem',
                width: '100%',
                resize: 'vertical',
                fontFamily: 'inherit'
              }}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="baseWeight">Base Weight *</label>
              <input
                type="number"
                id="baseWeight"
                name="baseWeight"
                value={formData.baseWeight}
                onChange={(e) => updateField('baseWeight', e.target.value)}
                onBlur={() => handleBlur('baseWeight')}
                className={getFieldValidationState('baseWeight')}
                placeholder="100"
                min="0"
                step="0.01"
                required
              />
              {getFieldError('baseWeight') && (
                <div className="validation-message error">
                  {getFieldError('baseWeight')}
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="baseWeightUnit">Unit *</label>
              <select
                id="baseWeightUnit"
                name="baseWeightUnit"
                value={formData.baseWeightUnit}
                onChange={(e) => updateField('baseWeightUnit', e.target.value)}
                onBlur={() => handleBlur('baseWeightUnit')}
                className={getFieldValidationState('baseWeightUnit')}
                required
                style={{
                  padding: '12px 16px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  width: '100%'
                }}
              >
                <option value="kg">Kilograms (kg)</option>
                <option value="g">Grams (g)</option>
                <option value="lb">Pounds (lb)</option>
                <option value="oz">Ounces (oz)</option>
                <option value="%">Percentage (%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Composition Section */}
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Recipe Composition</h2>
            <button
              type="button"
              onClick={addComposition}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Component
            </button>
          </div>

          {compositions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>No composition components added yet.</p>
              <p style={{ fontSize: '0.875rem' }}>Add components to define the recipe composition.</p>
            </div>
          ) : (
            <>
              {compositions.map((comp, index) => (
                <div key={index} className="composition-form-item" style={{
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '12px',
                  background: '#fafafa'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, color: '#1e293b' }}>Component {index + 1}</h4>
                    <button
                      type="button"
                      onClick={() => removeComposition(index)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#dc2626',
                        cursor: 'pointer',
                        padding: '4px'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18"/>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                      </svg>
                    </button>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Component Name *</label>
                      <input
                        type="text"
                        value={comp.componentName}
                        onChange={(e) => updateComposition(index, 'componentName', e.target.value)}
                        placeholder="e.g., Yogurt, Yacon"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Percentage *</label>
                      <input
                        type="number"
                        value={comp.percentage}
                        onChange={(e) => updateComposition(index, 'percentage', parseFloat(e.target.value) || 0)}
                        placeholder="0"
                        min="0"
                        max="100"
                        step="0.1"
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Notes</label>
                    <input
                      type="text"
                      value={comp.notes || ''}
                      onChange={(e) => updateComposition(index, 'notes', e.target.value)}
                      placeholder="Optional notes about this component"
                    />
                  </div>
                </div>
              ))}

              {/* Total Percentage Display */}
              <div style={{
                padding: '12px 16px',
                background: getTotalPercentage() === 100 ? 
                  'linear-gradient(135deg, #e8f5c8, #d4f1a8)' : 
                  'linear-gradient(135deg, #fef3c7, #fde68a)',
                border: `1px solid ${getTotalPercentage() === 100 ? '#91b029' : '#f59e0b'}`,
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontWeight: '600',
                color: getTotalPercentage() === 100 ? '#445c3c' : '#92400e'
              }}>
                <span>Total Composition:</span>
                <span>{getTotalPercentage().toFixed(1)}%</span>
              </div>

              {getTotalPercentage() !== 100 && compositions.length > 0 && (
                <p style={{ 
                  fontSize: '0.875rem', 
                  color: '#f59e0b', 
                  margin: '8px 0 0 0',
                  fontStyle: 'italic'
                }}>
                  ⚠️ Total percentage must equal 100% for valid composition
                </p>
              )}
            </>
          )}
        </div>

        {/* Additional Ingredients Section */}
        <div className="content-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2>Additional Ingredients</h2>
            <button
              type="button"
              onClick={addIngredient}
              className="btn btn-secondary"
              style={{ fontSize: '0.875rem' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Add Ingredient
            </button>
          </div>

          {ingredients.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
              <p>No additional ingredients added yet.</p>
              <p style={{ fontSize: '0.875rem' }}>Add ingredients with specific quantities and units.</p>
            </div>
          ) : (
            ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-form-item" style={{
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '12px',
                background: '#fafafa'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: '#1e293b' }}>Ingredient {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#dc2626',
                      cursor: 'pointer',
                      padding: '4px'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18"/>
                      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                    </svg>
                  </button>
                </div>

                <div className="form-row three-col">
                  <div className="form-group">
                    <label>Ingredient Name *</label>
                    <input
                      type="text"
                      value={ingredient.ingredientName}
                      onChange={(e) => updateIngredient(index, 'ingredientName', e.target.value)}
                      placeholder="e.g., Salt, Sugar, Vanilla"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      value={ingredient.quantity}
                      onChange={(e) => updateIngredient(index, 'quantity', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Unit *</label>
                    <select
                      value={ingredient.unit}
                      onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                      required
                      style={{
                        padding: '12px 16px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '1rem',
                        width: '100%'
                      }}
                    >
                      <option value="">Select unit</option>
                      <option value="g">Grams (g)</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="ml">Milliliters (ml)</option>
                      <option value="l">Liters (l)</option>
                      <option value="tsp">Teaspoons (tsp)</option>
                      <option value="tbsp">Tablespoons (tbsp)</option>
                      <option value="cup">Cups</option>
                      <option value="oz">Ounces (oz)</option>
                      <option value="lb">Pounds (lb)</option>
                      <option value="pieces">Pieces</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Notes</label>
                  <input
                    type="text"
                    value={ingredient.notes || ''}
                    onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                    placeholder="Optional notes about this ingredient"
                  />
                </div>
              </div>
            ))
          )}
        </div>

        {/* Form Actions */}
        <div className="content-card">
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Link to="/dashboard/products" className="btn btn-secondary">
              Cancel
            </Link>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 
                (isEditing ? 'Updating...' : 'Creating...') : 
                (isEditing ? 'Update Product' : 'Create Product')
              }
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
