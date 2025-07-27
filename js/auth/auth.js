// Hospital Stats MVP - Authentication Module
(function(window) {
    'use strict';
    
    const Auth = {
        // Module state
        currentUser: null,
        isInitialized: false,
        
        // Initialize the auth module
        init() {
            console.log('Auth module initializing...');
            this.setupAuthStateListener();
            this.checkExistingSession();
        },
        
        // Setup Supabase auth state listener
        setupAuthStateListener() {
            const supabase = State.get('supabase');
            if (!supabase) {
                console.warn('Supabase not available for auth state listener');
                return;
            }
            
            supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event, session?.user?.email);
                
                if (event === 'SIGNED_IN' && session) {
                    this.handleSignIn(session.user);
                } else if (event === 'SIGNED_OUT') {
                    this.handleSignOut();
                }
            });
            
            console.log('Auth state listener setup complete');
        },
        
        // Check for existing session on init
        async checkExistingSession() {
            const supabase = State.get('supabase');
            if (!supabase) {
                console.warn('Supabase not available for session check');
                return;
            }
            
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error('Session check error:', error);
                    return;
                }
                
                if (session?.user) {
                    console.log('Existing session found for:', session.user.email);
                    await this.handleSignIn(session.user);
                } else {
                    console.log('No existing session found');
                }
                
            } catch (error) {
                console.error('Failed to check existing session:', error);
            } finally {
                this.isInitialized = true;
                State.set('authInitialized', true);
            }
        },
        
        // Handle successful sign in
        async handleSignIn(user) {
            console.log('Handling sign in for user:', user.email);
            
            try {
                // Load user profile
                const profile = await this.loadUserProfile(user.id);
                
                // Set current user with profile
                this.currentUser = {
                    ...user,
                    profile: profile
                };
                
                // Update global state
                State.set('user', this.currentUser);
                State.set('isAuthenticated', true);
                
                // Update legacy app state for compatibility
                if (window.app) {
                    window.app.currentUser = this.currentUser;
                }
                
                console.log('User sign in completed:', this.currentUser.email);
                
            } catch (error) {
                console.error('Error handling sign in:', error);
                this.showError('Failed to load user profile: ' + error.message);
            }
        },
        
        // Handle sign out
        handleSignOut() {
            console.log('Handling sign out');
            
            this.currentUser = null;
            
            // Update global state
            State.set('user', null);
            State.set('isAuthenticated', false);
            
            // Update legacy app state for compatibility
            if (window.app) {
                window.app.currentUser = null;
            }
            
            // Navigate to landing page
            if (window.Router) {
                Router.navigate('landing');
            }
            
            console.log('User sign out completed');
        },
        
        // Load user profile from database
        async loadUserProfile(userId) {
            const supabase = State.get('supabase');
            if (!supabase) {
                throw new Error('Supabase not available');
            }
            
            try {
                const { data: profile, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                
                if (error) {
                    // If profile doesn't exist, that's ok - user might not have completed registration
                    if (error.code === 'PGRST116') {
                        console.log('No user profile found - may be incomplete registration');
                        return null;
                    }
                    throw error;
                }
                
                console.log('User profile loaded successfully');
                return profile;
                
            } catch (error) {
                console.error('Failed to load user profile:', error);
                throw error;
            }
        },
        
        // Sign in with email and password
        async signIn(email, password) {
            const supabase = State.get('supabase');
            if (!supabase) {
                throw new Error('Database connection not available');
            }
            
            console.log('Attempting sign in for:', email);
            
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password: password
                });
                
                if (error) throw error;
                
                console.log('Sign in successful');
                return data;
                
            } catch (error) {
                console.error('Sign in error:', error);
                throw error;
            }
        },
        
        // Sign up new user
        async signUp(userData) {
            const supabase = State.get('supabase');
            if (!supabase) {
                throw new Error('Database connection not available');
            }
            
            console.log('Attempting sign up for:', userData.email);
            
            try {
                // Register user with Supabase Auth
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email: userData.email,
                    password: userData.password,
                    options: {
                        data: {
                            first_name: userData.firstName,
                            last_name: userData.lastName
                        }
                    }
                });
                
                if (authError) throw authError;
                
                // Create user profile if registration successful
                if (authData.user) {
                    await this.createUserProfile(authData.user.id, userData);
                }
                
                console.log('Sign up successful');
                return authData;
                
            } catch (error) {
                console.error('Sign up error:', error);
                throw error;
            }
        },
        
        // Create user profile in database
        async createUserProfile(userId, userData) {
            const supabase = State.get('supabase');
            if (!supabase) {
                throw new Error('Supabase not available');
            }
            
            try {
                const { error } = await supabase
                    .from('user_profiles')
                    .insert([{
                        id: userId,
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        email: userData.email,
                        therapist_type: userData.therapistType,
                        employment_status: userData.employmentStatus,
                        sub_district: userData.subDistrict
                    }]);
                
                if (error) {
                    console.error('Profile creation error:', error);
                    console.error('Profile creation error details:', {
                        code: error.code,
                        message: error.message,
                        details: error.details,
                        hint: error.hint
                    });
                    // Throw the error so registration fails properly
                    throw new Error(`Profile creation failed: ${error.message}`);
                }
                
                console.log('User profile created successfully');
                
            } catch (error) {
                console.error('Failed to create user profile:', error);
                // Re-throw the error so registration fails properly
                throw error;
            }
        },
        
        // Sign out current user
        async signOut() {
            const supabase = State.get('supabase');
            if (!supabase) {
                console.warn('Supabase not available for sign out');
                return;
            }
            
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                
                console.log('Sign out successful');
                
            } catch (error) {
                console.error('Sign out error:', error);
                // Still clear local state even if API call fails
                this.handleSignOut();
                throw error;
            }
        },
        
        // Check if user is authenticated
        isAuthenticated() {
            return !!this.currentUser && State.get('isAuthenticated');
        },
        
        // Get current user
        getCurrentUser() {
            return this.currentUser;
        },
        
        // Check if user has required permissions
        hasPermission(permission) {
            if (!this.isAuthenticated()) {
                return false;
            }
            
            // For MVP, all authenticated users have all permissions
            // In production, this would check user roles/permissions
            return true;
        },
        
        // Require authentication for protected routes
        requireAuth() {
            if (!this.isAuthenticated()) {
                console.log('Authentication required, redirecting to login');
                if (window.Router) {
                    Router.navigate('login');
                }
                return false;
            }
            return true;
        },
        
        // Show error message
        showError(message) {
            console.error('Auth error:', message);
            
            if (window.showError) {
                window.showError(message);
            } else {
                alert('Authentication Error: ' + message);
            }
        },
        
        // Show success message
        showSuccess(message) {
            console.log('Auth success:', message);
            
            if (window.showError) {
                // Use error function with success styling if available
                window.showError(message, 'success');
            } else if (window.showMessage) {
                window.showMessage(message);
            } else {
                alert('Success: ' + message);
            }
        },

        // Handle login form submission
        async handleLogin(formData) {
            try {
                if (window.Views && window.Views.showLoading) {
                    window.Views.showLoading(true);
                }

                const { data, error } = await this.signIn(formData.email, formData.password);
                
                if (error) throw error;

                // Success is handled by the auth state listener
                if (window.Views && window.Views.showMessage) {
                    window.Views.showMessage('Welcome back!');
                }

                // Navigate to dashboard
                if (window.router) {
                    window.router.navigate('dashboard');
                }

            } catch (error) {
                console.error('Login error:', error);
                let errorMessage = 'Login failed';
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = 'Invalid email or password. Please check your credentials and try again.';
                } else if (error.message.includes('Email not confirmed')) {
                    errorMessage = 'Please check your email and click the confirmation link before signing in.';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                if (window.Views && window.Views.showError) {
                    window.Views.showError(errorMessage);
                }
            } finally {
                if (window.Views && window.Views.showLoading) {
                    window.Views.showLoading(false);
                }
            }
        },

        // Handle registration form submission
        async handleRegister(formData) {
            try {
                if (window.Views && window.Views.showLoading) {
                    window.Views.showLoading(true);
                }

                // Validate passwords match
                if (formData.password !== formData.confirmPassword) {
                    throw new Error('Passwords do not match');
                }

                // Validate email domain
                if (!formData.email.endsWith('@westerncape.gov.za')) {
                    throw new Error('Please use a valid @westerncape.gov.za email address');
                }

                const { data, error } = await this.signUp(formData);
                
                if (error) throw error;

                if (window.Views && window.Views.showMessage) {
                    window.Views.showMessage('Registration successful! Please check your email to confirm your account.');
                }

                // Navigate to login
                if (window.router) {
                    window.router.navigate('login');
                }

            } catch (error) {
                console.error('Registration error:', error);
                let errorMessage = 'Registration failed';
                if (error.message.includes('already been registered')) {
                    errorMessage = 'This email address is already registered. Please sign in instead.';
                } else if (error.message.includes('Invalid email')) {
                    errorMessage = 'Please use a valid @westerncape.gov.za email address.';
                } else if (error.message.includes('Password')) {
                    errorMessage = 'Password must be at least 6 characters long.';
                } else if (error.message) {
                    errorMessage = error.message;
                }
                
                if (window.Views && window.Views.showError) {
                    window.Views.showError(errorMessage);
                }
            } finally {
                if (window.Views && window.Views.showLoading) {
                    window.Views.showLoading(false);
                }
            }
        }
    };
    
    // Export to global scope
    window.Auth = Auth;
    
    // Auto-initialize when Supabase is available
    const initWhenReady = () => {
        const supabase = State.get('supabase');
        if (supabase && !Auth.isInitialized) {
            Auth.init();
        } else if (!supabase) {
            // Check again in 100ms
            setTimeout(initWhenReady, 100);
        }
    };
    
    // Start initialization check
    initWhenReady();
    
    console.log('Auth module loaded');
    
})(window);