// Build Configuration for Hospital Stats MVP
// Simple build utilities for production optimization

const BuildConfig = {
    // Environment detection
    isDevelopment: () => {
        return window.APP_CONFIG?.APP_ENV === 'development' || 
               window.location.hostname === 'localhost' ||
               window.location.protocol === 'file:';
    },
    
    // Production-safe logging
    log: (...args) => {
        if (BuildConfig.isDevelopment()) {
            console.log(...args);
        }
    },
    
    warn: (...args) => {
        if (BuildConfig.isDevelopment()) {
            console.warn(...args);
        }
    },
    
    error: (...args) => {
        // Always log errors, even in production
        console.error(...args);
    },
    
    // Performance monitoring (development only)
    time: (label) => {
        if (BuildConfig.isDevelopment()) {
            console.time(label);
        }
    },
    
    timeEnd: (label) => {
        if (BuildConfig.isDevelopment()) {
            console.timeEnd(label);
        }
    },
    
    // Development assertions
    assert: (condition, message) => {
        if (BuildConfig.isDevelopment() && !condition) {
            console.error('Assertion failed:', message);
        }
    }
};

// Export to global scope
window.BuildConfig = BuildConfig;

// For backward compatibility, replace console methods in production
// Only override after DOM is fully loaded to avoid breaking early initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (!BuildConfig.isDevelopment()) {
            overrideConsoleMethods();
        }
    });
} else {
    if (!BuildConfig.isDevelopment()) {
        overrideConsoleMethods();
    }
}

function overrideConsoleMethods() {
    const originalConsole = { ...console };
    console.log = () => {}; // Silent in production
    console.warn = () => {}; // Silent in production
    console.error = originalConsole.error; // Keep errors
    console.info = () => {}; // Silent in production
    console.debug = () => {}; // Silent in production
    
    // Keep essential methods
    console.time = originalConsole.time;
    console.timeEnd = originalConsole.timeEnd;
}