export interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  message: string;
}

export class FormValidator {
  // Email validation regex
  private static emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Field name mapping for user-friendly error messages
  private static fieldNameMap: Record<string, string> = {
    firstName: 'First name',
    lastName: 'Last name',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password'
  };

  // Password validation rules
  private static passwordRules: ValidationRule[] = [
    {
      test: (value: string) => value.length >= 8,
      message: 'Password must be at least 8 characters long'
    },
    {
      test: (value: string) => /[A-Z]/.test(value),
      message: 'Password must contain at least one uppercase letter'
    },
    {
      test: (value: string) => /[a-z]/.test(value),
      message: 'Password must contain at least one lowercase letter'
    },
    {
      test: (value: string) => /\d/.test(value),
      message: 'Password must contain at least one number'
    },
    {
      test: (value: string) => /[!@#$%^&*(),.?":{}|<>]/.test(value),
      message: 'Password must contain at least one special character'
    }
  ];

  /**
   * Validates email format
   */
  static validateEmail(email: string): ValidationResult {
    if (!email.trim()) {
      return {
        isValid: false,
        message: 'Email is required'
      };
    }

    if (!this.emailRegex.test(email)) {
      return {
        isValid: false,
        message: 'Please enter a valid email address'
      };
    }

    return {
      isValid: true,
      message: ''
    };
  }

  /**
   * Validates password strength
   */
  static validatePassword(password: string): ValidationResult {
    if (!password.trim()) {
      return {
        isValid: false,
        message: 'Password is required'
      };
    }

    // Check all password rules
    for (const rule of this.passwordRules) {
      if (!rule.test(password)) {
        return {
          isValid: false,
          message: rule.message
        };
      }
    }

    return {
      isValid: true,
      message: ''
    };
  }

  /**
   * Gets user-friendly field name
   */
  private static getFieldDisplayName(fieldName: string): string {
    return this.fieldNameMap[fieldName] || fieldName;
  }

  /**
   * Validates required fields
   */
  static validateRequired(value: string, fieldName: string): ValidationResult {
    if (!value.trim()) {
      return {
        isValid: false,
        message: `${this.getFieldDisplayName(fieldName)} is required`
      };
    }

    return {
      isValid: true,
      message: ''
    };
  }

  /**
   * Validates minimum length
   */
  static validateMinLength(value: string, minLength: number, fieldName: string): ValidationResult {
    if (value.length < minLength) {
      return {
        isValid: false,
        message: `${this.getFieldDisplayName(fieldName)} must be at least ${minLength} characters long`
      };
    }

    return {
      isValid: true,
      message: ''
    };
  }

  /**
   * Validates password confirmation
   */
  static validatePasswordConfirmation(password: string, confirmPassword: string): ValidationResult {
    if (password !== confirmPassword) {
      return {
        isValid: false,
        message: 'Passwords do not match'
      };
    }

    return {
      isValid: true,
      message: ''
    };
  }

  /**
   * Gets password strength indicator with enhanced scoring algorithm
   */
  static getPasswordStrength(password: string): {
    strength: 'weak' | 'medium' | 'strong';
    score: number;
    passedRules: number;
    totalRules: number;
  } {
    if (!password) {
      return {
        strength: 'weak',
        score: 0,
        passedRules: 0,
        totalRules: this.passwordRules.length
      };
    }

    // Enhanced scoring algorithm adapted from the sample
    let score = 0;
    
    // Length check (up to 25 points)
    const lengthScore = Math.min(password.length * 3, 25);
    score += lengthScore;
    
    // Character variety (up to 60 points)
    if (/[A-Z]/.test(password)) score += 10; // Uppercase
    if (/[a-z]/.test(password)) score += 10; // Lowercase
    if (/[0-9]/.test(password)) score += 10; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) score += 15; // Symbols
    
    // Additional complexity checks
    const variationCount = 
      (/[A-Z]/.test(password) ? 1 : 0) +
      (/[a-z]/.test(password) ? 1 : 0) +
      (/[0-9]/.test(password) ? 1 : 0) +
      (/[^A-Za-z0-9]/.test(password) ? 1 : 0);
    
    score += variationCount * 8;
    
    // Cap the score at 100
    score = Math.min(score, 100);
    
    // Calculate passed rules for backward compatibility
    const passedRules = this.passwordRules.filter(rule => rule.test(password)).length;
    const totalRules = this.passwordRules.length;
    
    // Enhanced strength thresholds based on the new scoring
    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 70) {
      strength = 'strong';
    } else if (score >= 40) {
      strength = 'medium';
    }

    return {
      strength,
      score,
      passedRules,
      totalRules
    };
  }

  /**
   * Validates form data object
   */
  static validateForm(formData: Record<string, string>, rules: Record<string, ValidationRule[]>): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    for (const [fieldName, fieldRules] of Object.entries(rules)) {
      const value = formData[fieldName] || '';
      let isValid = true;
      let message = '';

      for (const rule of fieldRules) {
        if (!rule.test(value)) {
          isValid = false;
          message = rule.message;
          break;
        }
      }

      results[fieldName] = {
        isValid,
        message
      };
    }

    return results;
  }
} 