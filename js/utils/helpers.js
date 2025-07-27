/**
 * Utility Helper Functions
 * General-purpose utility functions used across the application
 */
(function(window) {
    'use strict';

    const Helpers = {
        /**
         * Format date for display
         */
        formatDate(date, format = 'short') {
            if (!date) return '';
            
            const d = new Date(date);
            if (isNaN(d.getTime())) return '';
            
            switch (format) {
                case 'short':
                    return d.toLocaleDateString();
                case 'long':
                    return d.toLocaleDateString('en-ZA', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    });
                case 'time':
                    return d.toLocaleTimeString();
                case 'datetime':
                    return d.toLocaleString();
                case 'iso':
                    return d.toISOString().split('T')[0];
                default:
                    return d.toLocaleDateString();
            }
        },

        /**
         * Format time duration in minutes to human readable
         */
        formatDuration(minutes) {
            if (!minutes || minutes <= 0) return '';
            
            const mins = parseInt(minutes);
            if (mins < 60) {
                return `${mins} min${mins === 1 ? '' : 's'}`;
            }
            
            const hours = Math.floor(mins / 60);
            const remainingMins = mins % 60;
            
            if (remainingMins === 0) {
                return `${hours} hour${hours === 1 ? '' : 's'}`;
            }
            
            return `${hours}h ${remainingMins}m`;
        },

        /**
         * Generate unique ID for local records
         */
        generateLocalId() {
            return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * Generate timestamp for records
         */
        getCurrentTimestamp() {
            return new Date().toISOString();
        },

        /**
         * Debounce function calls
         */
        debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Throttle function calls
         */
        throttle(func, limit) {
            let lastFunc;
            let lastRan;
            return function executedFunction(...args) {
                if (!lastRan) {
                    func(...args);
                    lastRan = Date.now();
                } else {
                    clearTimeout(lastFunc);
                    lastFunc = setTimeout(() => {
                        if ((Date.now() - lastRan) >= limit) {
                            func(...args);
                            lastRan = Date.now();
                        }
                    }, limit - (Date.now() - lastRan));
                }
            };
        },

        /**
         * Deep clone an object
         */
        deepClone(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(item => this.deepClone(item));
            if (typeof obj === 'object') {
                const clonedObj = {};
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        clonedObj[key] = this.deepClone(obj[key]);
                    }
                }
                return clonedObj;
            }
        },

        /**
         * Check if value is empty (null, undefined, empty string, empty array, empty object)
         */
        isEmpty(value) {
            if (value === null || value === undefined) return true;
            if (typeof value === 'string') return value.trim() === '';
            if (Array.isArray(value)) return value.length === 0;
            if (typeof value === 'object') return Object.keys(value).length === 0;
            return false;
        },

        /**
         * Sanitize HTML to prevent XSS
         */
        sanitizeHTML(html) {
            const temp = document.createElement('div');
            temp.textContent = html;
            return temp.innerHTML;
        },

        /**
         * Escape HTML entities
         */
        escapeHTML(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        },

        /**
         * Convert string to title case
         */
        toTitleCase(str) {
            if (!str) return '';
            return str.replace(/\w\S*/g, (txt) => 
                txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        },

        /**
         * Convert camelCase to readable text
         */
        camelToReadable(str) {
            if (!str) return '';
            return str
                .replace(/([A-Z])/g, ' $1')
                .replace(/^./, (str) => str.toUpperCase())
                .trim();
        },

        /**
         * Convert snake_case to readable text
         */
        snakeToReadable(str) {
            if (!str) return '';
            return str
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
        },

        /**
         * Generate a hash from string (simple hash for non-cryptographic use)
         */
        simpleHash(str) {
            let hash = 0;
            if (str.length === 0) return hash;
            for (let i = 0; i < str.length; i++) {
                const char = str.charCodeAt(i);
                hash = ((hash << 5) - hash) + char;
                hash = hash & hash; // Convert to 32-bit integer
            }
            return Math.abs(hash).toString(36);
        },

        /**
         * Check if device is mobile
         */
        isMobile() {
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        },

        /**
         * Check if device is touch enabled
         */
        isTouchDevice() {
            return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        },

        /**
         * Get device orientation
         */
        getOrientation() {
            if (screen.orientation) {
                return screen.orientation.angle === 0 || screen.orientation.angle === 180 ? 'portrait' : 'landscape';
            }
            return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
        },

        /**
         * Check if browser supports a feature
         */
        supportsFeature(feature) {
            const features = {
                localStorage: () => {
                    try {
                        const test = 'test';
                        localStorage.setItem(test, test);
                        localStorage.removeItem(test);
                        return true;
                    } catch (e) {
                        return false;
                    }
                },
                webWorkers: () => typeof Worker !== 'undefined',
                serviceWorker: () => 'serviceWorker' in navigator,
                geolocation: () => 'geolocation' in navigator,
                notification: () => 'Notification' in window
            };
            
            return features[feature] ? features[feature]() : false;
        },

        /**
         * Smooth scroll to element
         */
        scrollToElement(element, offset = 0) {
            if (typeof element === 'string') {
                element = document.querySelector(element);
            }
            
            if (element) {
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - offset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        },

        /**
         * Copy text to clipboard
         */
        async copyToClipboard(text) {
            if (navigator.clipboard && window.isSecureContext) {
                try {
                    await navigator.clipboard.writeText(text);
                    return true;
                } catch (err) {
                    console.error('Failed to copy to clipboard:', err);
                    return false;
                }
            } else {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                
                try {
                    const successful = document.execCommand('copy');
                    document.body.removeChild(textArea);
                    return successful;
                } catch (err) {
                    console.error('Failed to copy to clipboard:', err);
                    document.body.removeChild(textArea);
                    return false;
                }
            }
        },

        /**
         * Format file size in human readable format
         */
        formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        /**
         * Calculate percentage
         */
        calculatePercentage(value, total) {
            if (total === 0) return 0;
            return Math.round((value / total) * 100);
        },

        /**
         * Retry function with exponential backoff
         */
        async retry(fn, maxAttempts = 3, backoffMs = 1000) {
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                try {
                    return await fn();
                } catch (error) {
                    if (attempt === maxAttempts) {
                        throw error;
                    }
                    
                    const delay = backoffMs * Math.pow(2, attempt - 1);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        },

        /**
         * Create delay/sleep function
         */
        sleep(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },

        /**
         * Parse URL parameters
         */
        parseURLParams(url = window.location.search) {
            const params = new URLSearchParams(url);
            const result = {};
            for (const [key, value] of params) {
                result[key] = value;
            }
            return result;
        },

        /**
         * Build URL with parameters
         */
        buildURL(base, params = {}) {
            const url = new URL(base, window.location.origin);
            Object.entries(params).forEach(([key, value]) => {
                if (value !== null && value !== undefined) {
                    url.searchParams.set(key, value);
                }
            });
            return url.toString();
        }
    };

    // Export to global scope
    window.Helpers = Helpers;

})(window);