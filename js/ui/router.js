// Hospital Stats MVP - SPA Router
(function(window) {
    'use strict';
    
    const Router = {
        // Router state
        isFileProtocol: window.location.protocol === 'file:',
        currentRoute: null,
        
        // Initialize router
        init() {
            console.log('Router initializing...');
            this.setupEventListeners();
            this.handleInitialRoute();
        },
        
        // Set up event listeners
        setupEventListeners() {
            // Listen for hash changes
            window.addEventListener('hashchange', this.handleRouteChange.bind(this));
            
            // Listen for back/forward buttons
            window.addEventListener('popstate', this.handleRouteChange.bind(this));
        },
        
        // Handle initial route on page load
        handleInitialRoute() {
            const hash = window.location.hash || '#landing';
            this.handleRoute(hash);
        },
        
        // Handle route changes
        handleRouteChange() {
            const hash = window.location.hash || '#landing';
            this.handleRoute(hash);
        },
        
        // Main route handler
        handleRoute(hash) {
            console.log('Handling route:', hash);
            
            // Parse route and parameters
            const { route, params } = this.parseRoute(hash);
            this.currentRoute = { route, params };
            
            // Update state
            State.set('currentView', route);
            
            // Route to appropriate view
            switch (route) {
                case 'landing':
                    this.renderView('landing');
                    break;
                case 'login':
                    // Redirect authenticated users away from login page
                    if (State.get('user')) {
                        this.navigate('dashboard');
                        return;
                    }
                    this.renderView('login');
                    break;
                case 'register':
                    // Redirect authenticated users away from register page
                    if (State.get('user')) {
                        this.navigate('dashboard');
                        return;
                    }
                    this.renderView('register');
                    break;
                case 'dashboard':
                    this.requireAuth(() => this.renderView('dashboard'));
                    break;
                case 'patients':
                    this.requireAuth(() => this.renderView('patients'));
                    break;
                case 'patientForm':
                    this.requireAuth(() => this.renderView('patientForm', params.patientId));
                    break;
                case 'patient':
                    // Handle patient/:id route
                    this.requireAuth(() => {
                        const patientId = params.id;
                        const source = params.source || 'supabase';
                        this.renderView('patientForm', patientId, source);
                    });
                    break;
                default:
                    console.warn('Unknown route:', route);
                    this.navigate('landing');
            }
        },
        
        // Parse route string into route and parameters
        parseRoute(hash) {
            // Remove # from hash
            const cleanHash = hash.replace('#', '');
            
            // Split route and query parameters
            const [routePart, queryPart] = cleanHash.split('?');
            const routeSegments = routePart.split('/');
            const route = routeSegments[0] || 'landing';
            
            // Parse parameters
            const params = {};
            
            // Handle route parameters (e.g., patient/123)
            if (routeSegments.length > 1) {
                params.id = routeSegments[1];
            }
            
            // Parse query parameters
            if (queryPart) {
                const searchParams = new URLSearchParams(queryPart);
                for (const [key, value] of searchParams) {
                    params[key] = value;
                }
            }
            
            return { route, params };
        },
        
        // Navigate to a new route
        navigate(route, params = {}) {
            console.log('Navigating to:', route, params);
            
            let hash = '#' + route;
            
            // Add route parameters (for patient/:id)
            if (params.id) {
                hash += '/' + params.id;
                delete params.id;  // Remove from query params
            }
            
            // Add query parameters
            const queryParams = new URLSearchParams(params);
            if (queryParams.toString()) {
                hash += '?' + queryParams.toString();
            }
            
            // Update URL
            window.location.hash = hash;
        },
        
        // Require authentication for protected routes
        requireAuth(callback) {
            const user = State.get('user');
            if (!user) {
                console.log('Authentication required, redirecting to login');
                this.navigate('login');
                return;
            }
            callback();
        },
        
        // Render view using Views module
        async renderView(viewName, ...args) {
            console.log('Rendering view:', viewName, args);
            
            if (!window.Views) {
                console.error('Views module not available');
                return;
            }

            const appContainer = document.getElementById('app');
            if (!appContainer) {
                console.error('App container not found');
                return;
            }

            try {
                let htmlContent = '';

                switch (viewName) {
                    case 'landing':
                        htmlContent = Views.renderLanding();
                        break;
                    case 'login':
                        htmlContent = Views.renderLogin();
                        break;
                    case 'register':
                        htmlContent = Views.renderRegister();
                        break;
                    case 'dashboard':
                        htmlContent = await Views.renderDashboard();
                        break;
                    case 'patients':
                        htmlContent = await Views.renderPatientList();
                        break;
                    case 'patientForm':
                        const patientId = args[0] || 'new';
                        const source = args[1] || 'new';
                        
                        // Load patient data if editing
                        if (patientId !== 'new' && window.PatientForm) {
                            await window.PatientForm.loadPatientData(patientId, source);
                        }
                        
                        if (window.PatientForm && window.PatientForm.renderView) {
                            htmlContent = await window.PatientForm.renderView(patientId);
                        } else {
                            htmlContent = '<div class="error">Patient form not available</div>';
                        }
                        break;
                    default:
                        console.warn('Unknown view:', viewName);
                        htmlContent = '<div class="error">View not found</div>';
                }

                // Render the content
                appContainer.innerHTML = htmlContent;

                // Setup search functionality if on patient list
                if (viewName === 'patients') {
                    const searchInput = document.getElementById('search-patients');
                    if (searchInput && window.PatientList && window.PatientList.filterPatients) {
                        searchInput.addEventListener('input', (e) => {
                            window.PatientList.filterPatients(e.target.value);
                        });
                    }
                }

                // Setup form listeners if on patient form
                if (viewName === 'patientForm') {
                    if (window.PatientForm && window.PatientForm.setupFormListeners) {
                        window.PatientForm.setupFormListeners();
                    }
                }

                // Emit route change event for other modules
                const event = new CustomEvent('routeChange', {
                    detail: {
                        view: viewName,
                        args: args,
                        params: this.currentRoute?.params || {}
                    }
                });
                
                document.dispatchEvent(event);

            } catch (error) {
                console.error('Error rendering view:', error);
                appContainer.innerHTML = `<div class="error">Error loading view: ${error.message}</div>`;
            }
        },
        
        // Get current route information
        getCurrentRoute() {
            return this.currentRoute;
        },
        
        // Get route parameters
        getParams() {
            return this.currentRoute?.params || {};
        }
    };
    
    // Export to global scope
    window.Router = Router;
    
    // Debug info
    console.log('Router module loaded');
    
})(window);