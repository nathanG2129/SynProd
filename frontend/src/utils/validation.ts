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
   * Gets password strength indicator
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

    const passedRules = this.passwordRules.filter(rule => rule.test(password)).length;
    const totalRules = this.passwordRules.length;
    const score = (passedRules / totalRules) * 100;

    let strength: 'weak' | 'medium' | 'strong' = 'weak';
    if (score >= 80) {
      strength = 'strong';
    } else if (score >= 60) {
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