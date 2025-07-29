// Hospital Stats MVP - Application Bootstrap
(function(window) {
    'use strict';
    
    const App = {
        // Application state
        supabase: null,
        initialized: false,
        
        // Initialize the application
        async init() {
            console.log('Hospital Stats MVP starting...');
            
            try {
                // Initialize Supabase client
                await this.initSupabase();
                
                // Initialize core modules
                this.initModules();
                
                // Check for existing session
                await this.checkExistingSession();
                
                // Initialize router (this will handle initial route)
                Router.init();
                
                // Set up global event listeners
                this.setupGlobalEvents();
                
                // Mark as initialized
                this.initialized = true;
                console.log('App initialization complete');
                
            } catch (error) {
                console.error('App initialization failed:', error);
                this.showError('Failed to initialize application: ' + error.message);
            }
        },
        
        // Initialize Supabase client
        async initSupabase() {
            console.log('Initializing Supabase...');
            
            if (!window.APP_CONFIG) {
                console.error('APP_CONFIG not found. Please check config.js');
                return false;
            }

            const config = window.APP_CONFIG;

            // Check if we have credentials
            if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
                console.warn('Supabase credentials not configured. Running in demo mode.');
                console.log('Config values:', {
                    hasUrl: !!config.SUPABASE_URL,
                    hasKey: !!config.SUPABASE_ANON_KEY,
                    keyLength: config.SUPABASE_ANON_KEY?.length || 0
                });
                return false;
            }

            try {
                if (typeof supabase === 'undefined') {
                    console.error('Supabase library not loaded');
                    return false;
                }
                
                const { createClient } = supabase;
                this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
                
                // Store in global state for modules to access
                State.set('supabase', this.supabase);
                
                // Also set in legacy global app object for compatibility
                if (window.app) {
                    window.app.supabase = this.supabase;
                }
                
                console.log('Supabase client initialized');
                return true;
            } catch (error) {
                console.error('Failed to initialize Supabase:', error);
                this.showError('Failed to connect to database.');
                return false;
            }
        },
        
        // Initialize core modules
        initModules() {
            console.log('Initializing modules...');
            
            // State is already initialized when module loads
            // Router will be initialized after this
            // Other modules will be initialized as needed
            
            console.log('Core modules initialized');
        },
        
        // Check for existing authentication session
        async checkExistingSession() {
            console.log('Checking for existing session...');
            
            try {
                const { data: { session }, error } = await this.supabase.auth.getSession();
                
                if (error) {
                    console.error('Session check error:', error);
                    return;
                }
                
                if (session?.user) {
                    console.log('Found existing session for:', session.user.email);
                    
                    // Set user in state
                    State.set('user', session.user);
                    
                    // Load user profile if we have auth module
                    if (window.AuthService) {
                        await window.AuthService.loadUserProfile(session.user);
                    }
                }
                
            } catch (error) {
                console.error('Session check failed:', error);
            }
        },
        
        // Set up global event listeners
        setupGlobalEvents() {
            // Listen for auth state changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event, session?.user?.email);
                
                if (event === 'SIGNED_IN' && session?.user) {
                    State.set('user', session.user);
                } else if (event === 'SIGNED_OUT') {
                    State.set('user', null);
                    State.reset();  // Clear all state on logout
                    Router.navigate('landing');
                }
            });
            
            // Listen for online/offline events
            window.addEventListener('online', this.handleOnline.bind(this));
            window.addEventListener('offline', this.handleOffline.bind(this));
            
            // Listen for route changes (when view modules are loaded)
            document.addEventListener('routeChange', this.handleRouteChange.bind(this));
        },
        
        // Handle coming back online
        handleOnline() {
            console.log('App came online');
            State.update('syncStatus.online', true);
            
            // Trigger sync if sync module is available
            if (window.SyncService) {
                window.SyncService.triggerSync();
            }
        },
        
        // Handle going offline
        handleOffline() {
            console.log('App went offline');
            State.update('syncStatus.online', false);
        },
        
        // Handle route changes (bridge to old view system during migration)
        handleRouteChange(event) {
            const { view, args, params } = event.detail;
            // Removed verbose logging to reduce console noise
            
            // During migration, we'll bridge to the old view rendering
            // This will be removed once all views are extracted to modules
            if (window.renderView) {
                window.renderView(view, ...args);
            }
        },
        
        // Show error message
        showError(message) {
            console.error(message);
            
            // Try to use the UI helper if available
            if (window.showError) {
                window.showError(message);
            } else {
                // Fallback to alert
                alert('Error: ' + message);
            }
        },
        
        // Get Supabase client
        getSupabase() {
            return this.supabase;
        }
    };
    
    // Export to global scope
    window.App = App;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => App.init());
    } else {
        App.init();
    }
    
    console.log('App module loaded');
    
})(window);