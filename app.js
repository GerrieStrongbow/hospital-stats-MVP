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
        console.log('Supabase client created successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        showError('Failed to connect to database.');
        return false;
    }
}

// Router - Simple SPA routing
const router = {
    routes: {
        '': 'landing',
        'login': 'login',
        'register': 'register',
        'dashboard': 'dashboard',
        'patient/new': 'patientForm',
        'patient/:id': 'patientForm'
    },
    
    isFileProtocol: window.location.protocol === 'file:',
    
    navigate(path) {
        // Remove leading slash for hash routing
        path = path.replace(/^\//, '');
        
        if (this.isFileProtocol) {
            // Use hash-based routing for file:// protocol
            window.location.hash = '#' + path;
        } else {
            // Use pushState for http/https
            window.history.pushState({}, '', '/' + path);
            this.handleRoute();
        }
    },
    
    handleRoute() {
        let path;
        
        if (this.isFileProtocol) {
            // Extract path from hash
            path = window.location.hash.replace(/^#\/?/, '') || '';
        } else {
            // Extract path from pathname
            path = window.location.pathname.replace(/^\//, '') || '';
        }
        
        const route = this.matchRoute(path);
        
        if (!route) {
            this.navigate('');
            return;
        }
        
        app.currentRoute = route;
        
        // Check authentication for protected routes
        const protectedRoutes = ['dashboard', 'patientForm'];
        if (protectedRoutes.includes(route.handler) && !app.currentUser) {
            this.navigate('login');
            return;
        }
        
        // Render the appropriate view
        renderView(route.handler, route.params);
    },
    
    matchRoute(path) {
        for (const [pattern, handler] of Object.entries(this.routes)) {
            const regex = pattern.replace(/:[^/]+/g, '([^/]+)');
            const match = path.match(new RegExp(`^${regex}$`));
            
            if (match) {
                const params = {};
                const paramNames = pattern.match(/:[^/]+/g) || [];
                paramNames.forEach((name, index) => {
                    params[name.slice(1)] = match[index + 1];
                });
                
                return { handler, params };
            }
        }
        
        return null;
    }
};

// View rendering
async function renderView(viewName, params = {}) {
    showLoading(true);
    const appContainer = document.getElementById('app');
    
    try {
        let content = '';
        
        switch (viewName) {
            case 'landing':
                content = renderLanding();
                break;
            case 'login':
                content = renderLogin();
                break;
            case 'register':
                content = renderRegister();
                break;
            case 'dashboard':
                content = await renderDashboard();
                break;
            case 'patientForm':
                content = await renderPatientForm(params.id);
                break;
            default:
                content = '<div class="container"><h1>Page not found</h1></div>';
        }
        
        appContainer.innerHTML = content;
        attachEventListeners(viewName);
        
    } catch (error) {
        console.error('Error rendering view:', error);
        showError('Failed to load page');
    } finally {
        showLoading(false);
    }
}

// Landing page
function renderLanding() {
    return `
        <div class="container">
            <div style="text-align: center; padding: 60px 20px;">
                <h1 style="font-size: 32px; margin-bottom: 16px;">Hospital Stats</h1>
                <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 40px;">
                    Allied Healthcare Data Logger
                </p>
                <div style="max-width: 300px; margin: 0 auto;">
                    <button class="btn btn-primary btn-block mb-3" onclick="router.navigate('login')">
                        Sign In
                    </button>
                    <button class="btn btn-secondary btn-block" onclick="router.navigate('register')">
                        Register
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Login page
function renderLogin() {
    return `
        <div class="container">
            <div class="card" style="max-width: 400px; margin: 40px auto;">
                <h2 class="text-center mb-4">Sign In</h2>
                <form id="login-form">
                    <div class="form-group">
                        <label class="form-label">Email Address</label>
                        <input type="email" class="form-input" name="email" required>
                    </div>
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <div class="password-group">
                            <input type="password" class="form-input" name="password" required>
                            <button type="button" class="password-toggle" onclick="togglePassword(this)">
                                👁
                            </button>
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary btn-block">
                        Sign In
                    </button>
                </form>
                <p class="text-center mt-3">
                    Don't have an account? 
                    <a href="#" onclick="router.navigate('register'); return false;">Register</a>
                </p>
            </div>
        </div>
    `;
}

// Register page (placeholder - will be implemented in Phase 3)
function renderRegister() {
    return `
        <div class="container">
            <div class="card" style="max-width: 500px; margin: 40px auto;">
                <h2 class="text-center mb-4">Register</h2>
                <p class="text-center text-secondary">Registration form will be implemented in Phase 3</p>
                <button class="btn btn-secondary btn-block" onclick="router.navigate('login')">
                    Back to Login
                </button>
            </div>
        </div>
    `;
}

// Dashboard (placeholder - will be implemented in Phase 5)
async function renderDashboard() {
    return `
        <div class="header">
            <div class="nav">
                <h1 class="header-title">Patient Records</h1>
                <button class="btn" style="background: none; color: white;" onclick="signOut()">
                    Sign Out
                </button>
            </div>
        </div>
        <div class="container">
            <div class="sync-status synced mb-3">
                <span class="sync-status-icon"></span>
                <span>All records synced</span>
            </div>
            <div class="card">
                <p class="text-center text-secondary">Dashboard will be implemented in Phase 5</p>
            </div>
            <button class="fab" onclick="router.navigate('patient/new')">+</button>
        </div>
    `;
}

// Patient form (placeholder - will be implemented in Phase 4)
async function renderPatientForm(patientId) {
    return `
        <div class="header">
            <div class="nav">
                <button class="btn" style="background: none; color: white;" onclick="router.navigate('dashboard')">
                    ← Back
                </button>
                <h1 class="header-title">${patientId ? 'Edit Patient' : 'New Patient'}</h1>
            </div>
        </div>
        <div class="container">
            <div class="card">
                <p class="text-center text-secondary">Patient form will be implemented in Phase 4</p>
            </div>
        </div>
    `;
}

// Helper functions
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.toggle('active', show);
    }
}

function showError(message) {
    // For now, just alert. Will improve in later phases
    alert(message);
}

function togglePassword(button) {
    const input = button.parentElement.querySelector('input');
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '👁‍🗨';
    } else {
        input.type = 'password';
        button.textContent = '👁';
    }
}

async function signOut() {
    if (!app.supabase) return;
    
    try {
        const { error } = await app.supabase.auth.signOut();
        if (error) throw error;
        
        app.currentUser = null;
        router.navigate('');
    } catch (error) {
        console.error('Sign out error:', error);
        showError('Failed to sign out');
    }
}

// Event listener attachment
function attachEventListeners(viewName) {
    if (viewName === 'login') {
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', handleLogin);
        }
    }
    // Add more conditions as we implement features
}

// Login handler (placeholder - will be implemented properly in Phase 3)
async function handleLogin(e) {
    e.preventDefault();
    
    // For now, just show a message
    showError('Login functionality will be implemented in Phase 3');
}

// Online/offline detection
window.addEventListener('online', () => {
    app.isOnline = true;
    // Trigger sync when coming online
    if (app.currentUser) {
        syncData();
    }
});

window.addEventListener('offline', () => {
    app.isOnline = false;
});

// Data sync (placeholder - will be implemented in Phase 5)
async function syncData() {
    // Will implement sync logic in Phase 5
    console.log('Sync functionality will be implemented in Phase 5');
}

// Initialize app on load
window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing app...');
    
    // Initialize Supabase
    const supabaseReady = await initSupabase();
    console.log('Supabase ready:', supabaseReady);
    
    // Set up routing
    if (router.isFileProtocol) {
        window.addEventListener('hashchange', () => router.handleRoute());
    } else {
        window.addEventListener('popstate', () => router.handleRoute());
    }
    
    // Check for existing session
    if (supabaseReady && app.supabase) {
        try {
            const { data: { session } } = await app.supabase.auth.getSession();
            if (session) {
                app.currentUser = session.user;
            }
        } catch (error) {
            console.log('Session check failed:', error);
        }
    }
    
    // Handle initial route
    console.log('Handling initial route...');
    router.handleRoute();
});

// Service Worker registration for PWA capabilities (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Will add service worker in future for full offline capabilities
        console.log('Service Worker support detected - will implement for production');
    });
}