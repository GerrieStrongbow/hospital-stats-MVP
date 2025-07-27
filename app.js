// Hospital Stats MVP - Main Application
'use strict';

// Global app state
const app = {
    supabase: null,
    currentUser: null,
    currentRoute: null,
    syncQueue: [],
    isOnline: navigator.onLine
};

// Initialize Supabase client
async function initSupabase() {
    // For MVP, we'll use a config object that can be easily changed
    // In production, this would be injected during build time
    const config = window.APP_CONFIG || {
        SUPABASE_URL: 'https://qnipfhctucuvqbpazmbh.supabase.co',
        SUPABASE_ANON_KEY: '' // Will be set in config.js
    };

    // Check if we have credentials
    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
        console.warn('Supabase credentials not configured. Running in demo mode.');
        return false;
    }

    try {
        if (typeof supabase === 'undefined') {
            console.error('Supabase library not loaded');
            return false;
        }
        app.supabase = supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        
        // Also set in State for modules to access
        if (typeof State !== 'undefined') {
            State.set('supabase', app.supabase);
        }
        
        console.log('Supabase client created successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        Views.showError('Failed to connect to database.');
        return false;
    }
}

// Use the Router module from js/ui/router.js
const router = window.Router;

// View rendering is now handled by the Router module

// Sign out functionality
async function signOut() {
    if (!app.supabase) return;

    try {
        const { error } = await app.supabase.auth.signOut();
        if (error) throw error;

        app.currentUser = null;
        State.set('user', null);
        if (window.Router) {
            window.Router.navigate('landing');
        }
        Views.showMessage('You have been signed out');
    } catch (error) {
        console.error('Sign out error:', error);
        Views.showError('Failed to sign out');
    }
}

// Event listener attachment
function attachEventListeners(viewName) {
    const handlers = {
        'patientForm': attachPatientFormListeners
        // Note: login and register listeners now handled by respective modules
    };

    const handler = handlers[viewName];
    if (handler) {
        handler();
    }
}

// Authentication listeners now handled by auth modules
// - js/auth/login.js handles login form submission  
// - js/auth/register.js handles register form submission

function attachPatientFormListeners() {
    const patientForm = document.getElementById('patient-form');
    if (!patientForm) return;

    patientForm.addEventListener('submit', handlePatientForm);
    setupPatientFormValidation();
}

function setupPatientFormValidation() {
    const patientId = document.getElementById('patient-identifier');
    const appointmentDate = document.getElementById('appointment-date');
    const duration = document.getElementById('duration-minutes');

    if (patientId) {
        patientId.addEventListener('input', Validation.validatePatientIdField);
    }

    if (appointmentDate) {
        appointmentDate.addEventListener('input', Validation.validateDateField);
    }

    if (duration) {
        duration.addEventListener('input', Validation.validateDurationField);
    }
}

// Patient form submission handler
async function handlePatientForm(event) {
    event.preventDefault();
    
    try {
        // Use PatientCRUD module for form handling
        await PatientCRUD.handleFormSubmission(event.target);
    } catch (error) {
        console.error('Patient form submission error:', error);
        Views.showError('Failed to save patient record');
    }
}

// Online/offline detection
window.addEventListener('online', () => {
    app.isOnline = true;
    console.log('App is online');
    State.set('isOnline', true);
    // Attempt to sync pending records
    if (typeof Sync !== 'undefined') {
        Sync.attemptSync();
    }
});

window.addEventListener('offline', () => {
    app.isOnline = false;
    console.log('App is offline');
    State.set('isOnline', false);
});

// Session management
async function initializeAuth() {
    if (!app.supabase) return;

    try {
        const { data: { session } } = await app.supabase.auth.getSession();
        
        if (session) {
            app.currentUser = session.user;
            State.set('user', session.user);
            console.log('User session restored:', session.user.email);
        }

        // Listen for auth changes
        app.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session?.user?.email);
            
            if (session) {
                app.currentUser = session.user;
                State.set('user', session.user);
                
                if (event === 'SIGNED_IN') {
                    if (window.Router) {
                        window.Router.navigate('dashboard');
                    }
                }
            } else {
                app.currentUser = null;
                State.set('user', null);
                
                if (event === 'SIGNED_OUT') {
                    if (window.Router) {
                        window.Router.navigate('landing');
                    }
                }
            }
        });
    } catch (error) {
        console.error('Auth initialization error:', error);
    }
}

// Initialize app
async function initializeApp() {
    console.log('Initializing Hospital Stats MVP...');
    
    try {
        // Initialize Supabase
        const supabaseInitialized = await initSupabase();
        
        // Initialize authentication
        if (supabaseInitialized) {
            await initializeAuth();
        }
        
        // Initialize router
        if (window.Router) {
            window.Router.init();
        } else {
            console.error('Router module not available');
        }
        
        console.log('App initialized successfully');
        
        // Initialize sync system if available
        if (typeof Sync !== 'undefined' && app.isOnline) {
            Sync.init();
        }
        
    } catch (error) {
        console.error('App initialization failed:', error);
        Views.showError('Failed to initialize application');
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initializeApp);

// Export global functions for legacy compatibility
window.app = app;
window.router = window.Router; // Use the Router module
window.signOut = signOut;