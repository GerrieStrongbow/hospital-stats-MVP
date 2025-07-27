// Hospital Stats MVP - Login Module
(function(window) {
    'use strict';
    
    const Login = {
        // Module state
        isProcessing: false,
        
        // Initialize the module
        init() {
            console.log('Login module initializing...');
            this.bindEvents();
        },
        
        // Bind event listeners
        bindEvents() {
            // Listen for form submissions
            document.addEventListener('submit', this.handleFormSubmit.bind(this));
            
            // Listen for route changes to login view
            document.addEventListener('routeChange', this.handleRouteChange.bind(this));
        },
        
        // Handle route changes
        handleRouteChange(e) {
            if (e.detail.view === 'login') {
                console.log('Login view activated');
                // Add any login-specific setup here
                setTimeout(() => {
                    this.setupForm();
                }, 100);
            }
        },
        
        // Setup login form
        setupForm() {
            const form = document.getElementById('login-form');
            if (form) {
                // Clear any previous values
                form.reset();
                
                // Focus on email field
                const emailField = form.querySelector('input[name="email"]');
                if (emailField) {
                    emailField.focus();
                }
                
                console.log('Login form setup completed');
            }
        },
        
        // Handle form submission
        handleFormSubmit(e) {
            if (e.target && e.target.id === 'login-form') {
                e.preventDefault();
                console.log('Login form submitted');
                this.handleLogin(e);
            }
        },
        
        // Handle login process
        async handleLogin(e) {
            if (this.isProcessing) {
                console.log('Login already in progress, ignoring duplicate submission');
                return;
            }
            
            console.log('Starting login process...');
            this.isProcessing = true;
            
            // Show loading state
            this.showLoading(true);
            
            try {
                // Get form data
                const formData = new FormData(e.target);
                const email = formData.get('email')?.trim();
                const password = formData.get('password');
                
                // Basic validation
                if (!email || !password) {
                    throw new Error('Please enter both email and password');
                }
                
                if (!this.validateEmail(email)) {
                    throw new Error('Please enter a valid email address');
                }
                
                console.log('Attempting login for:', email);
                
                // Use Auth module for sign in
                if (!window.Auth) {
                    throw new Error('Authentication system not available');
                }
                
                const result = await Auth.signIn(email, password);
                
                if (result?.user) {
                    console.log('Login successful for:', result.user.email);
                    
                    // Show success message briefly
                    this.showSuccess('Login successful! Redirecting...');
                    
                    // Navigate to dashboard after short delay
                    setTimeout(() => {
                        if (window.Router) {
                            Router.navigate('dashboard');
                        }
                    }, 1000);
                } else {
                    throw new Error('Login failed - no user data returned');
                }
                
            } catch (error) {
                console.error('Login error:', error);
                this.showError(this.formatErrorMessage(error.message));
            } finally {
                this.isProcessing = false;
                this.showLoading(false);
            }
        },
        
        // Validate email format
        validateEmail(email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },
        
        // Format error message for display
        formatErrorMessage(message) {
            // Map common Supabase auth errors to user-friendly messages
            const errorMappings = {
                'Invalid login credentials': 'Invalid email or password. Please check your credentials and try again.',
                'Email not confirmed': 'Please check your email and click the verification link before signing in.',
                'Too many requests': 'Too many login attempts. Please wait a moment and try again.',
                'User not found': 'No account found with this email address.',
                'Invalid password': 'Incorrect password. Please try again.',
                'Network request failed': 'Connection error. Please check your internet connection.',
                'Database connection not available': 'Service temporarily unavailable. Please try again later.'
            };
            
            // Check for exact matches first
            if (errorMappings[message]) {
                return errorMappings[message];
            }
            
            // Check for partial matches
            for (const [key, value] of Object.entries(errorMappings)) {
                if (message.includes(key)) {
                    return value;
                }
            }
            
            // Return original message if no mapping found
            return message || 'Login failed. Please try again.';
        },
        
        // Show loading state
        showLoading(show) {
            if (window.showLoading) {
                window.showLoading(show);
            }
            
            // Also update submit button
            const submitButton = document.querySelector('#login-form button[type="submit"]');
            if (submitButton) {
                if (show) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Signing In...';
                } else {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Sign In';
                }
            }
        },
        
        // Show error message
        showError(message) {
            console.error('Login error:', message);
            
            if (window.showError) {
                window.showError(message);
            } else {
                alert('Login Error: ' + message);
            }
        },
        
        // Show success message
        showSuccess(message) {
            console.log('Login success:', message);
            
            if (window.showError) {
                // Use error function with success styling if available
                window.showError(message, 'success');
            } else if (window.showMessage) {
                window.showMessage(message);
            } else {
                alert('Success: ' + message);
            }
        },
        
        // Get processing status
        isProcessingLogin() {
            return this.isProcessing;
        },
        
        // Navigate to registration
        goToRegister() {
            if (window.Router) {
                Router.navigate('register');
            }
        },
        
        // Navigate to password reset (for future implementation)
        goToPasswordReset() {
            // TODO: Implement password reset functionality
            this.showError('Password reset functionality will be available soon.');
        }
    };
    
    // Export to global scope
    window.Login = Login;
    
    // Auto-initialize when module loads
    Login.init();
    
    console.log('Login module loaded');
    
})(window);