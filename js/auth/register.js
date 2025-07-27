// Hospital Stats MVP - Register Module
(function(window) {
    'use strict';
    
    const Register = {
        // Module state
        isProcessing: false,
        
        // Initialize the module
        init() {
            console.log('Register module initializing...');
            this.bindEvents();
        },
        
        // Bind event listeners
        bindEvents() {
            // Listen for form submissions
            document.addEventListener('submit', this.handleFormSubmit.bind(this));
            
            // Listen for route changes to register view
            document.addEventListener('routeChange', this.handleRouteChange.bind(this));
        },
        
        // Handle route changes
        handleRouteChange(e) {
            if (e.detail.view === 'register') {
                console.log('Register view activated');
                setTimeout(() => {
                    this.setupForm();
                }, 100);
            }
        },
        
        // Setup register form
        setupForm() {
            const form = document.getElementById('register-form');
            if (form) {
                // Clear any previous values
                form.reset();
                
                // Focus on first name field
                const firstNameField = form.querySelector('input[name="firstName"]');
                if (firstNameField) {
                    firstNameField.focus();
                }
                
                console.log('Register form setup completed');
            }
        },
        
        // Handle form submission
        handleFormSubmit(e) {
            if (e.target && e.target.id === 'register-form') {
                e.preventDefault();
                console.log('Register form submitted');
                this.handleRegister(e);
            }
        },
        
        // Handle registration process
        async handleRegister(e) {
            if (this.isProcessing) {
                console.log('Registration already in progress, ignoring duplicate submission');
                return;
            }
            
            console.log('Starting registration process...');
            this.isProcessing = true;
            
            // Show loading state
            this.showLoading(true);
            
            try {
                // Get form data
                const formData = new FormData(e.target);
                const userData = this.extractFormData(formData);
                
                // Validate form data
                this.validateFormData(userData);
                
                console.log('Attempting registration for:', userData.email);
                
                // Use Auth module for sign up
                if (!window.Auth) {
                    throw new Error('Authentication system not available');
                }
                
                const result = await Auth.signUp(userData);
                
                if (result?.user) {
                    console.log('Registration successful for:', result.user.email);
                    
                    // Show success message
                    this.showSuccess(
                        'Registration successful! Please check your email to verify your account, then sign in.'
                    );
                    
                    // Navigate to login after delay
                    setTimeout(() => {
                        if (window.Router) {
                            Router.navigate('login');
                        }
                    }, 3000);
                    
                } else {
                    throw new Error('Registration failed - no user data returned');
                }
                
            } catch (error) {
                console.error('Registration error:', error);
                this.showError(this.formatErrorMessage(error.message));
            } finally {
                this.isProcessing = false;
                this.showLoading(false);
            }
        },
        
        // Extract data from form
        extractFormData(formData) {
            return {
                firstName: formData.get('firstName')?.trim(),
                lastName: formData.get('lastName')?.trim(),
                email: formData.get('email')?.trim(),
                therapistType: formData.get('therapistType'),
                employmentStatus: formData.get('employmentStatus'),
                subDistrict: formData.get('subDistrict'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };
        },
        
        // Validate form data
        validateFormData(userData) {
            const errors = [];
            
            // Required fields
            if (!userData.firstName) errors.push('First name is required');
            if (!userData.lastName) errors.push('Last name is required');
            if (!userData.email) errors.push('Email address is required');
            if (!userData.therapistType) errors.push('Therapist type is required');
            if (!userData.employmentStatus) errors.push('Employment status is required');
            if (!userData.subDistrict) errors.push('Sub-district is required');
            if (!userData.password) errors.push('Password is required');
            if (!userData.confirmPassword) errors.push('Password confirmation is required');
            
            // Email validation
            if (userData.email && !this.validateEmail(userData.email)) {
                errors.push('Please enter a valid email address');
            }
            
            // Email domain validation
            if (userData.email && !userData.email.endsWith('@westerncape.gov.za')) {
                errors.push('Email must be a @westerncape.gov.za address');
            }
            
            // Password validation
            if (userData.password && userData.password.length < 6) {
                errors.push('Password must be at least 6 characters long');
            }
            
            // Password confirmation
            if (userData.password && userData.confirmPassword && userData.password !== userData.confirmPassword) {
                errors.push('Passwords do not match');
            }
            
            // Name validation
            if (userData.firstName && userData.firstName.length < 2) {
                errors.push('First name must be at least 2 characters');
            }
            
            if (userData.lastName && userData.lastName.length < 2) {
                errors.push('Last name must be at least 2 characters');
            }
            
            if (errors.length > 0) {
                throw new Error(errors.join('. '));
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
                'User already registered': 'An account with this email address already exists. Please sign in instead.',
                'Password should be at least 6 characters': 'Password must be at least 6 characters long.',
                'Unable to validate email address': 'Invalid email format. Please check your email address.',
                'Email rate limit exceeded': 'Too many registration attempts. Please wait a moment and try again.',
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
            return message || 'Registration failed. Please try again.';
        },
        
        // Show loading state
        showLoading(show) {
            if (window.showLoading) {
                window.showLoading(show);
            }
            
            // Also update submit button
            const submitButton = document.querySelector('#register-form button[type="submit"]');
            if (submitButton) {
                if (show) {
                    submitButton.disabled = true;
                    submitButton.textContent = 'Creating Account...';
                } else {
                    submitButton.disabled = false;
                    submitButton.textContent = 'Create Account';
                }
            }
        },
        
        // Show error message
        showError(message) {
            console.error('Register error:', message);
            
            if (window.showError) {
                window.showError(message);
            } else {
                alert('Registration Error: ' + message);
            }
        },
        
        // Show success message
        showSuccess(message) {
            console.log('Register success:', message);
            
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
        isProcessingRegistration() {
            return this.isProcessing;
        },
        
        // Navigate to login
        goToLogin() {
            if (window.Router) {
                Router.navigate('login');
            }
        },
        
        // Get sub-district options (for form population)
        getSubDistrictOptions() {
            return [
                'City of Cape Town Metro East',
                'City of Cape Town Metro North', 
                'City of Cape Town Metro South',
                'City of Cape Town Metro West',
                'Cape Winelands East',
                'Cape Winelands West',
                'Overberg',
                'West Coast',
                'Central Karoo',
                'Garden Route'
            ];
        },
        
        // Get therapist type options
        getTherapistTypeOptions() {
            return [
                'Physiotherapist',
                'Occupational Therapist',
                'Speech Therapist',
                'Audiologist',
                'Social Worker',
                'Dietitian',
                'Psychologist',
                'Other'
            ];
        },
        
        // Get employment status options
        getEmploymentStatusOptions() {
            return [
                'Permanent',
                'Contract',
                'Locum',
                'Community Service'
            ];
        }
    };
    
    // Export to global scope
    window.Register = Register;
    
    // Auto-initialize when module loads
    Register.init();
    
    console.log('Register module loaded');
    
})(window);