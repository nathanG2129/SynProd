import { useState, useCallback } from 'react';
import { FormValidator, ValidationResult } from '../utils/validation';

export interface ValidationState {
  [key: string]: ValidationResult;
}

export interface UseFormValidationOptions {
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  validateOnSubmit?: boolean;
}

export function useFormValidation(
  initialData: Record<string, string>,
  validationRules: Record<string, any>,
  options: UseFormValidationOptions = {}
) {
  const [formData, setFormData] = useState(initialData);
  const [validationState, setValidationState] = useState<ValidationState>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const {
    validateOnChange = false,
    validateOnBlur = true,
    validateOnSubmit = true
  } = options;

  // Validate a single field
  const validateField = useCallback((fieldName: string, value: string) => {
    let validationResult: ValidationResult = { isValid: true, message: '' };

    // Apply validation rules based on field type and context
    switch (fieldName) {
      case 'email':
        validationResult = FormValidator.validateEmail(value);
        break;
      case 'password':
        // Check if we should use strict password validation or just required
        if (validationRules[fieldName]?.strict !== false) {
          validationResult = FormValidator.validatePassword(value);
        } else {
          validationResult = FormValidator.validateRequired(value, fieldName);
        }
        break;
      case 'confirmPassword':
        if (formData.password) {
          validationResult = FormValidator.validatePasswordConfirmation(formData.password, value);
        }
        break;
      default:
        // For other fields, check if they're required
        if (validationRules[fieldName]?.required) {
          validationResult = FormValidator.validateRequired(value, fieldName);
        }
        break;
    }

    return validationResult;
  }, [formData, validationRules]);

  // Update form data and optionally validate
  const updateField = useCallback((fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));

    if (validateOnChange) {
      const validationResult = validateField(fieldName, value);
      setValidationState(prev => ({
        ...prev,
        [fieldName]: validationResult
      }));
    }
  }, [validateOnChange, validateField]);

  // Handle field blur
  const handleBlur = useCallback((fieldName: string) => {
    setTouchedFields(prev => new Set([...prev, fieldName]));

    if (validateOnBlur) {
      const value = formData[fieldName] || '';
      const validationResult = validateField(fieldName, value);
      setValidationState(prev => ({
        ...prev,
        [fieldName]: validationResult
      }));
    }
  }, [validateOnBlur, validateField, formData]);

  // Validate all fields
  const validateForm = useCallback(() => {
    const newValidationState: ValidationState = {};

    Object.keys(validationRules).forEach(fieldName => {
      const value = formData[fieldName] || '';
      newValidationState[fieldName] = validateField(fieldName, value);
    });

    setValidationState(newValidationState);
    return newValidationState;
  }, [validationRules, formData, validateField]);

  // Check if form is valid
  const isFormValid = useCallback(() => {
    const validationResults = validateForm();
    return Object.values(validationResults).every(result => result.isValid);
  }, [validateForm]);

  // Handle form submission
  const handleSubmit = useCallback((onSubmit: (data: Record<string, string>) => void) => {
    return (e: React.FormEvent) => {
      e.preventDefault();
      
      if (validateOnSubmit) {
        // Mark all fields as touched when submit is pressed
        const allFields = Object.keys(validationRules);
        setTouchedFields(new Set(allFields));
        
        const validationResults = validateForm();
        const isValid = Object.values(validationResults).every(result => result.isValid);
        
        if (isValid) {
          onSubmit(formData);
        }
      } else {
        onSubmit(formData);
      }
    };
  }, [validateOnSubmit, validateForm, validationRules, formData]);

  // Reset form
  const resetForm = useCallback(() => {
    setFormData(initialData);
    setValidationState({});
    setTouchedFields(new Set());
  }, [initialData]);

  // Get field error message
  const getFieldError = useCallback((fieldName: string) => {
    const isTouched = touchedFields.has(fieldName);
    const validation = validationState[fieldName];
    
    // Show error if field is touched or if validation state exists (from submit)
    return (isTouched || validation) && validation && !validation.isValid ? validation.message : '';
  }, [touchedFields, validationState]);

  // Get field validation state
  const getFieldValidationState = useCallback((fieldName: string) => {
    const isTouched = touchedFields.has(fieldName);
    const validation = validationState[fieldName];
    
    // Show validation state if field is touched or if validation state exists (from submit)
    if (!isTouched && !validation) return 'pristine';
    if (!validation) return 'pristine';
    return validation.isValid ? 'valid' : 'invalid';
  }, [touchedFields, validationState]);

  return {
    formData,
    validationState,
    touchedFields,
    updateField,
    handleBlur,
    validateForm,
    isFormValid,
    handleSubmit,
    resetForm,
    getFieldError,
    getFieldValidationState
  };
} 