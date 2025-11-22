package com.synprod.SynProd.util;

import org.springframework.stereotype.Component;

import java.util.regex.Pattern;

/**
 * Utility class for sanitizing user input to prevent XSS and injection attacks.
 * Removes potentially dangerous HTML/script content while preserving safe text.
 */
@Component
public class InputSanitizer {

    // Pattern to detect HTML tags
    private static final Pattern HTML_TAG_PATTERN = Pattern.compile("<[^>]*>");
    
    // Pattern to detect script tags and event handlers
    private static final Pattern SCRIPT_PATTERN = Pattern.compile(
        "(?i)<script[^>]*>.*?</script>|javascript:|on\\w+\\s*=",
        Pattern.CASE_INSENSITIVE | Pattern.DOTALL
    );
    
    // Pattern to detect SQL injection attempts
    private static final Pattern SQL_INJECTION_PATTERN = Pattern.compile(
        "(?i)(union|select|insert|update|delete|drop|create|alter|exec|execute|script|javascript|eval)\\s*\\(",
        Pattern.CASE_INSENSITIVE
    );

    /**
     * Sanitizes input by removing HTML tags and potentially dangerous content.
     * Use this for text fields that should contain plain text only.
     * 
     * @param input The input string to sanitize
     * @return Sanitized string with HTML tags and scripts removed
     */
    public String sanitize(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }

        String sanitized = input;
        
        // Remove script tags and event handlers first
        sanitized = SCRIPT_PATTERN.matcher(sanitized).replaceAll("");
        
        // Remove all HTML tags
        sanitized = HTML_TAG_PATTERN.matcher(sanitized).replaceAll("");
        
        // Decode HTML entities to prevent double encoding attacks
        sanitized = decodeHtmlEntities(sanitized);
        
        // Trim whitespace
        sanitized = sanitized.trim();
        
        return sanitized;
    }

    /**
     * Sanitizes input for use in descriptions or notes where some formatting might be needed.
     * More permissive than sanitize() but still removes dangerous content.
     * 
     * @param input The input string to sanitize
     * @return Sanitized string
     */
    public String sanitizeDescription(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }

        String sanitized = input;
        
        // Remove script tags and event handlers
        sanitized = SCRIPT_PATTERN.matcher(sanitized).replaceAll("");
        
        // Remove potentially dangerous SQL patterns
        sanitized = SQL_INJECTION_PATTERN.matcher(sanitized).replaceAll("");
        
        // Trim whitespace
        sanitized = sanitized.trim();
        
        return sanitized;
    }

    /**
     * Validates that input doesn't contain dangerous patterns.
     * Use this for validation before processing.
     * 
     * @param input The input to validate
     * @return true if input is safe, false otherwise
     */
    public boolean isSafe(String input) {
        if (input == null || input.isEmpty()) {
            return true;
        }

        // Check for script patterns
        if (SCRIPT_PATTERN.matcher(input).find()) {
            return false;
        }

        // Check for SQL injection patterns
        if (SQL_INJECTION_PATTERN.matcher(input).find()) {
            return false;
        }

        return true;
    }

    /**
     * Decodes common HTML entities to prevent double-encoding attacks.
     * 
     * @param input The input string
     * @return String with HTML entities decoded
     */
    private String decodeHtmlEntities(String input) {
        if (input == null) {
            return null;
        }
        
        return input
            .replace("&lt;", "<")
            .replace("&gt;", ">")
            .replace("&quot;", "\"")
            .replace("&#x27;", "'")
            .replace("&#x2F;", "/")
            .replace("&amp;", "&"); // This should be last
    }

    /**
     * Encodes special characters to prevent XSS when displaying user input.
     * Use this when rendering user input in responses.
     * 
     * @param input The input string
     * @return String with special characters encoded
     */
    public String encode(String input) {
        if (input == null || input.isEmpty()) {
            return input;
        }

        return input
            .replace("&", "&amp;")  // This should be first
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#x27;")
            .replace("/", "&#x2F;");
    }
}

