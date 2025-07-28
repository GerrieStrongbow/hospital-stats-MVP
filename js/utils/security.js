// Hospital Stats MVP - Security Utilities
(function(window) {
    'use strict';
    
    const Security = {
        /**
         * Sanitize HTML to prevent XSS attacks
         * @param {string} html - HTML string to sanitize
         * @returns {string} - Sanitized HTML string
         */
        sanitizeHTML(html) {
            const temp = document.createElement('div');
            temp.textContent = html;
            return temp.innerHTML;
        },
        
        /**
         * Escape HTML special characters
         * @param {string} str - String to escape
         * @returns {string} - Escaped string
         */
        escapeHTML(str) {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        },
        
        /**
         * Create safe HTML element with text content
         * @param {string} tag - HTML tag name
         * @param {string} text - Text content
         * @param {Object} attributes - HTML attributes
         * @returns {HTMLElement} - Safe HTML element
         */
        createElement(tag, text = '', attributes = {}) {
            const element = document.createElement(tag);
            if (text) {
                element.textContent = text;
            }
            
            // Safely set attributes
            Object.keys(attributes).forEach(key => {
                if (key === 'className') {
                    element.className = attributes[key];
                } else if (key === 'innerHTML') {
                    // Prevent innerHTML usage
                    console.warn('Use textContent instead of innerHTML for security');
                } else {
                    element.setAttribute(key, attributes[key]);
                }
            });
            
            return element;
        },
        
        /**
         * Sanitize user input for database storage
         * @param {string} input - User input to sanitize
         * @returns {string} - Sanitized input
         */
        sanitizeInput(input) {
            if (typeof input !== 'string') {
                return input;
            }
            
            // Remove any script tags or javascript: protocols
            return input
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                .replace(/javascript:/gi, '')
                .replace(/on\w+\s*=/gi, '') // Remove event handlers
                .trim();
        },
        
        /**
         * Generate CSRF token
         * @returns {string} - CSRF token
         */
        generateCSRFToken() {
            const array = new Uint8Array(32);
            crypto.getRandomValues(array);
            return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
        },
        
        /**
         * Store CSRF token in session
         * @param {string} token - CSRF token
         */
        storeCSRFToken(token) {
            sessionStorage.setItem('csrf_token', token);
        },
        
        /**
         * Get stored CSRF token
         * @returns {string|null} - Stored CSRF token
         */
        getCSRFToken() {
            return sessionStorage.getItem('csrf_token');
        },
        
        /**
         * Validate CSRF token
         * @param {string} token - Token to validate
         * @returns {boolean} - Is token valid
         */
        validateCSRFToken(token) {
            const storedToken = this.getCSRFToken();
            return storedToken && storedToken === token;
        },
        
        /**
         * Sanitize URL to prevent injection
         * @param {string} url - URL to sanitize
         * @returns {string} - Sanitized URL
         */
        sanitizeURL(url) {
            try {
                const parsed = new URL(url, window.location.origin);
                // Only allow http(s) protocols
                if (!['http:', 'https:'].includes(parsed.protocol)) {
                    return '#';
                }
                return parsed.href;
            } catch {
                return '#';
            }
        },
        
        /**
         * Check if origin is trusted
         * @param {string} origin - Origin to check
         * @returns {boolean} - Is origin trusted
         */
        isTrustedOrigin(origin) {
            const trustedOrigins = [
                window.location.origin,
                'https://qnipfhctucuvqbpazmbh.supabase.co'
            ];
            
            return trustedOrigins.includes(origin);
        }
    };
    
    // Initialize CSRF token on load
    if (!Security.getCSRFToken()) {
        Security.storeCSRFToken(Security.generateCSRFToken());
    }
    
    // Export to global scope
    window.Security = Security;
    
    console.log('Security module loaded');
    
})(window);