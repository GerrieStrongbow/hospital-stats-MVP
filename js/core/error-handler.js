// Hospital Stats MVP - Centralized Error Handling
(function(window) {
    'use strict';
    
    const ErrorHandler = {
        // Error types
        ERROR_TYPES: {
            NETWORK: 'NETWORK_ERROR',
            AUTH: 'AUTH_ERROR',
            VALIDATION: 'VALIDATION_ERROR',
            DATABASE: 'DATABASE_ERROR',
            SYNC: 'SYNC_ERROR',
            PERMISSION: 'PERMISSION_ERROR',
            SESSION: 'SESSION_ERROR',
            UNKNOWN: 'UNKNOWN_ERROR'
        },
        
        // Error severity levels
        SEVERITY: {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
            CRITICAL: 'critical'
        },
        
        // Error log storage
        errorLog: [],
        maxLogSize: 100,
        
        /**
         * Initialize error handler
         */
        init() {
            console.log('ErrorHandler initializing...');
            this.setupGlobalErrorHandlers();
            this.loadErrorLog();
        },
        
        /**
         * Setup global error handlers
         */
        setupGlobalErrorHandlers() {
            // Handle uncaught errors
            window.addEventListener('error', (event) => {
                this.handleError({
                    type: this.ERROR_TYPES.UNKNOWN,
                    message: event.message,
                    stack: event.error?.stack,
                    filename: event.filename,
                    line: event.lineno,
                    column: event.colno
                });
            });
            
            // Handle unhandled promise rejections
            window.addEventListener('unhandledrejection', (event) => {
                this.handleError({
                    type: this.ERROR_TYPES.UNKNOWN,
                    message: event.reason?.message || 'Unhandled promise rejection',
                    error: event.reason
                });
                
                // Prevent default browser behavior
                event.preventDefault();
            });
        },
        
        /**
         * Main error handling function
         * @param {Object} error - Error details
         * @param {string} error.type - Error type from ERROR_TYPES
         * @param {string} error.message - Error message
         * @param {string} error.code - Error code (optional)
         * @param {string} error.severity - Error severity (optional)
         * @param {Object} error.context - Additional context (optional)
         * @param {Error} error.originalError - Original error object (optional)
         */
        handleError(error) {
            // Normalize error object
            const normalizedError = this.normalizeError(error);
            
            // Log error
            this.logError(normalizedError);
            
            // Display error to user based on severity
            this.displayError(normalizedError);
            
            // Report critical errors
            if (normalizedError.severity === this.SEVERITY.CRITICAL) {
                this.reportError(normalizedError);
            }
            
            // Return normalized error for further handling
            return normalizedError;
        },
        
        /**
         * Normalize error object
         * @param {Object|Error|string} error - Error to normalize
         * @returns {Object} - Normalized error
         */
        normalizeError(error) {
            const normalized = {
                id: this.generateErrorId(),
                timestamp: new Date().toISOString(),
                type: this.ERROR_TYPES.UNKNOWN,
                severity: this.SEVERITY.MEDIUM,
                message: 'An unknown error occurred',
                code: null,
                context: {},
                stack: null,
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            if (typeof error === 'string') {
                normalized.message = error;
            } else if (error instanceof Error) {
                normalized.message = error.message;
                normalized.stack = error.stack;
                normalized.type = this.categorizeError(error);
            } else if (typeof error === 'object') {
                Object.assign(normalized, error);
            }
            
            // Auto-categorize if type not specified
            if (normalized.type === this.ERROR_TYPES.UNKNOWN) {
                normalized.type = this.categorizeError(normalized);
            }
            
            // Auto-determine severity if not specified
            if (!error.severity) {
                normalized.severity = this.determineSeverity(normalized);
            }
            
            return normalized;
        },
        
        /**
         * Categorize error based on content
         * @param {Object|Error} error - Error to categorize
         * @returns {string} - Error type
         */
        categorizeError(error) {
            const message = error.message?.toLowerCase() || '';
            const code = error.code?.toLowerCase() || '';
            
            if (message.includes('network') || message.includes('fetch') || code === 'network_error') {
                return this.ERROR_TYPES.NETWORK;
            } else if (message.includes('auth') || message.includes('unauthorized') || code.includes('auth')) {
                return this.ERROR_TYPES.AUTH;
            } else if (message.includes('validation') || message.includes('invalid')) {
                return this.ERROR_TYPES.VALIDATION;
            } else if (message.includes('database') || message.includes('supabase') || code.includes('pgrst')) {
                return this.ERROR_TYPES.DATABASE;
            } else if (message.includes('sync')) {
                return this.ERROR_TYPES.SYNC;
            } else if (message.includes('permission') || message.includes('forbidden')) {
                return this.ERROR_TYPES.PERMISSION;
            } else if (message.includes('session') || message.includes('expired')) {
                return this.ERROR_TYPES.SESSION;
            }
            
            return this.ERROR_TYPES.UNKNOWN;
        },
        
        /**
         * Determine error severity
         * @param {Object} error - Normalized error
         * @returns {string} - Severity level
         */
        determineSeverity(error) {
            // Critical errors
            if (error.type === this.ERROR_TYPES.AUTH && error.message.includes('expired')) {
                return this.SEVERITY.CRITICAL;
            }
            if (error.type === this.ERROR_TYPES.DATABASE && error.code?.startsWith('5')) {
                return this.SEVERITY.CRITICAL;
            }
            
            // High severity
            if (error.type === this.ERROR_TYPES.PERMISSION) {
                return this.SEVERITY.HIGH;
            }
            if (error.type === this.ERROR_TYPES.DATABASE) {
                return this.SEVERITY.HIGH;
            }
            
            // Low severity
            if (error.type === this.ERROR_TYPES.VALIDATION) {
                return this.SEVERITY.LOW;
            }
            
            // Default to medium
            return this.SEVERITY.MEDIUM;
        },
        
        /**
         * Display error to user
         * @param {Object} error - Normalized error
         */
        displayError(error) {
            let userMessage = error.message;
            
            // Use user-friendly messages from constants
            if (window.Constants?.ERROR_MESSAGES) {
                const messageKey = error.type;
                if (window.Constants.ERROR_MESSAGES[messageKey]) {
                    userMessage = window.Constants.ERROR_MESSAGES[messageKey];
                }
            }
            
            // Display based on severity
            switch (error.severity) {
                case this.SEVERITY.CRITICAL:
                case this.SEVERITY.HIGH:
                    if (window.Views?.showError) {
                        window.Views.showError(userMessage);
                    } else {
                        alert('Error: ' + userMessage);
                    }
                    break;
                case this.SEVERITY.MEDIUM:
                    if (window.Views?.showError) {
                        window.Views.showError(userMessage);
                    } else {
                        console.error(userMessage);
                    }
                    break;
                case this.SEVERITY.LOW:
                    console.warn(userMessage);
                    break;
            }
        },
        
        /**
         * Log error to storage
         * @param {Object} error - Normalized error
         */
        logError(error) {
            // Add to in-memory log
            this.errorLog.unshift(error);
            
            // Trim log if too large
            if (this.errorLog.length > this.maxLogSize) {
                this.errorLog = this.errorLog.slice(0, this.maxLogSize);
            }
            
            // Save to localStorage
            try {
                localStorage.setItem('error_log', JSON.stringify(this.errorLog));
            } catch (e) {
                console.error('Failed to save error log:', e);
            }
            
            // Log to console in development
            if (window.APP_CONFIG?.ENABLE_LOGGING) {
                console.error('[ErrorHandler]', error);
            }
        },
        
        /**
         * Load error log from storage
         */
        loadErrorLog() {
            try {
                const stored = localStorage.getItem('error_log');
                if (stored) {
                    this.errorLog = JSON.parse(stored);
                }
            } catch (e) {
                console.error('Failed to load error log:', e);
            }
        },
        
        /**
         * Report critical errors (placeholder for future implementation)
         * @param {Object} error - Normalized error
         */
        reportError(error) {
            // In production, this would send error to monitoring service
            console.error('[CRITICAL ERROR]', error);
            
            // Could integrate with services like Sentry, LogRocket, etc.
            // Example:
            // if (window.Sentry) {
            //     window.Sentry.captureException(error.originalError || error);
            // }
        },
        
        /**
         * Generate unique error ID
         * @returns {string} - Error ID
         */
        generateErrorId() {
            return Date.now().toString(36) + Math.random().toString(36).substr(2);
        },
        
        /**
         * Get recent errors
         * @param {number} count - Number of errors to retrieve
         * @returns {Array} - Recent errors
         */
        getRecentErrors(count = 10) {
            return this.errorLog.slice(0, count);
        },
        
        /**
         * Clear error log
         */
        clearErrorLog() {
            this.errorLog = [];
            try {
                localStorage.removeItem('error_log');
            } catch (e) {
                console.error('Failed to clear error log:', e);
            }
        },
        
        /**
         * Wrap function with error handling
         * @param {Function} fn - Function to wrap
         * @param {Object} context - Error context
         * @returns {Function} - Wrapped function
         */
        wrapFunction(fn, context = {}) {
            return (...args) => {
                try {
                    const result = fn(...args);
                    // Handle promise-returning functions
                    if (result && typeof result.catch === 'function') {
                        return result.catch(error => {
                            this.handleError({
                                ...context,
                                originalError: error,
                                message: error.message
                            });
                            throw error; // Re-throw to maintain promise chain
                        });
                    }
                    return result;
                } catch (error) {
                    this.handleError({
                        ...context,
                        originalError: error,
                        message: error.message
                    });
                    throw error; // Re-throw to maintain error propagation
                }
            };
        }
    };
    
    // Export to global scope
    window.ErrorHandler = ErrorHandler;
    
    // Auto-initialize
    ErrorHandler.init();
    
    console.log('ErrorHandler module loaded');
    
})(window);