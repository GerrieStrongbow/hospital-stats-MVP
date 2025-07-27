/**
 * Form Handlers Module
 * Handles form submissions and UI interactions
 */
(function(window) {
    'use strict';

    const FormHandlers = {
        // Setup all form handlers
        init() {
            console.log('FormHandlers: Initializing form handlers...');
            this.setupEventListeners();
        },

        // Setup event listeners for forms and interactions
        setupEventListeners() {
            // Handle login form submission
            document.addEventListener('submit', (e) => {
                if (e.target.id === 'login-form') {
                    e.preventDefault();
                    this.handleLoginSubmit(e.target);
                }
            });

            // Handle register form submission
            document.addEventListener('submit', (e) => {
                if (e.target.id === 'register-form') {
                    e.preventDefault();
                    this.handleRegisterSubmit(e.target);
                }
            });

            // Handle patient form submission
            document.addEventListener('submit', (e) => {
                if (e.target.id === 'patient-form') {
                    e.preventDefault();
                    this.handlePatientFormSubmit(e.target);
                }
            });

            // Search functionality
            document.addEventListener('input', (e) => {
                if (e.target.id === 'search-patients') {
                    this.handlePatientSearch(e.target.value);
                }
            });

            console.log('FormHandlers: Event listeners setup complete');
        },

        // Handle login form submission
        async handleLoginSubmit(form) {
            console.log('FormHandlers: Handling login form submission');
            
            const formData = new FormData(form);
            const loginData = {
                email: formData.get('email'),
                password: formData.get('password')
            };

            if (!loginData.email || !loginData.password) {
                Views.showError('Please fill in all fields');
                return;
            }

            try {
                await Auth.handleLogin(loginData);
            } catch (error) {
                console.error('Login form submission error:', error);
                Views.showError(error.message || 'Login failed');
            }
        },

        // Handle register form submission
        async handleRegisterSubmit(form) {
            console.log('FormHandlers: Handling register form submission');
            
            const formData = new FormData(form);
            const registerData = {
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                therapistType: formData.get('therapistType'),
                employmentStatus: formData.get('employmentStatus'),
                subDistrict: formData.get('subDistrict'),
                password: formData.get('password'),
                confirmPassword: formData.get('confirmPassword')
            };

            // Validate required fields
            const requiredFields = ['firstName', 'lastName', 'email', 'therapistType', 'employmentStatus', 'subDistrict', 'password', 'confirmPassword'];
            for (const field of requiredFields) {
                if (!registerData[field]) {
                    Views.showError(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`);
                    return;
                }
            }

            try {
                await Auth.handleRegister(registerData);
            } catch (error) {
                console.error('Register form submission error:', error);
                Views.showError(error.message || 'Registration failed');
            }
        },

        // Handle patient form submission
        async handlePatientFormSubmit(form) {
            console.log('FormHandlers: Handling patient form submission');
            
            try {
                const formData = new FormData(form);
                const patientData = this.extractPatientFormData(formData);
                
                // Validate patient data
                const validation = this.validatePatientData(patientData);
                if (!validation.isValid) {
                    Views.showError(validation.message);
                    return;
                }

                // Check if this is an edit or new patient
                const patientId = formData.get('patient_id') || window.currentPatientData?.id;
                
                if (patientId) {
                    // Update existing patient
                    await PatientCRUD.updatePatient(patientId, patientData);
                } else {
                    // Create new patient
                    await PatientCRUD.createPatient(patientData);
                }

                Views.showMessage('Patient record saved successfully');
                router.navigate('patients');

            } catch (error) {
                console.error('Patient form submission error:', error);
                Views.showError(error.message || 'Failed to save patient record');
            }
        },

        // Extract patient form data
        extractPatientFormData(formData) {
            const data = {
                patient_identifier: formData.get('patient_identifier'),
                age_group: formData.get('age_group'),
                facility: formData.get('facility'),
                facility_type: formData.get('facility_type'),
                appointment_date: formData.get('appointment_date'),
                appointment_type: formData.get('appointment_type'),
                referral_source: formData.get('referral_source'),
                referral_source_other: formData.get('referral_source_other'),
                clinical_area: formData.get('clinical_area'),
                clinical_area_other: formData.get('clinical_area_other'),
                attendance: formData.get('attendance'),
                disposal: formData.get('disposal'),
                outcome: formData.get('outcome'),
                duration_minutes: parseInt(formData.get('duration_minutes')) || 0,
                activities: [],
                assistive_devices: {}
            };

            // Extract activities (checkboxes)
            const activityElements = document.querySelectorAll('input[name="activities"]:checked');
            data.activities = Array.from(activityElements).map(el => el.value);

            // Extract assistive devices
            const deviceElements = document.querySelectorAll('input[name="assistive_devices"]:checked');
            deviceElements.forEach(el => {
                const deviceType = el.value;
                data.assistive_devices[deviceType] = {
                    issued: true
                };

                // Get funding source if available
                const fundingElement = document.querySelector(`select[name="${deviceType}_funding"]`);
                if (fundingElement && fundingElement.value) {
                    data.assistive_devices[deviceType].funding_source = fundingElement.value;
                }

                // Get serial number for wheelchairs
                if (deviceType === 'wheelchair') {
                    const serialElement = document.querySelector(`input[name="${deviceType}_serial"]`);
                    if (serialElement && serialElement.value) {
                        data.assistive_devices[deviceType].serial_number = serialElement.value;
                    }
                }

                // Get custom description for "other" devices
                if (deviceType === 'other') {
                    const descElement = document.querySelector(`input[name="${deviceType}_description"]`);
                    if (descElement && descElement.value) {
                        data.assistive_devices[deviceType].description = descElement.value;
                    }
                }
            });

            return data;
        },

        // Validate patient data
        validatePatientData(data) {
            const errors = [];

            // Required fields
            if (!data.patient_identifier) errors.push('Patient identifier is required');
            if (!data.age_group) errors.push('Age group is required');
            if (!data.facility) errors.push('Facility is required');
            if (!data.facility_type) errors.push('Facility type is required');
            if (!data.appointment_date) errors.push('Appointment date is required');
            if (!data.appointment_type) errors.push('Appointment type is required');
            if (!data.referral_source) errors.push('Referral source is required');
            if (!data.clinical_area) errors.push('Clinical area is required');
            if (!data.attendance) errors.push('Attendance is required');
            if (!data.disposal) errors.push('Disposal is required');
            if (!data.outcome) errors.push('Outcome is required');

            // Validate patient identifier format
            if (data.patient_identifier) {
                if (data.patient_identifier.length < 2 || data.patient_identifier.length > 20) {
                    errors.push('Patient identifier must be between 2 and 20 characters');
                }
                if (/\s/.test(data.patient_identifier)) {
                    errors.push('Patient identifier cannot contain spaces');
                }
            }

            // Validate appointment date
            if (data.appointment_date) {
                const appointmentDate = new Date(data.appointment_date);
                const today = new Date();
                const oneYearAgo = new Date();
                oneYearAgo.setFullYear(today.getFullYear() - 1);

                if (appointmentDate > today) {
                    errors.push('Appointment date cannot be in the future');
                }
                if (appointmentDate < oneYearAgo) {
                    errors.push('Appointment date cannot be more than one year ago');
                }
            }

            // Validate duration
            if (data.duration_minutes) {
                if (data.duration_minutes < 1 || data.duration_minutes > 480) {
                    errors.push('Duration must be between 1 and 480 minutes');
                }
            }

            // Validate conditional fields
            if (data.referral_source === 'other' && !data.referral_source_other) {
                errors.push('Please specify the referral source');
            }

            if (data.clinical_area === 'Other (specify below)' && !data.clinical_area_other) {
                errors.push('Please specify the clinical area');
            }

            return {
                isValid: errors.length === 0,
                message: errors.join(', ')
            };
        },

        // Handle patient search
        handlePatientSearch(searchTerm) {
            console.log('FormHandlers: Handling patient search:', searchTerm);
            
            if (typeof filterPatients === 'function') {
                filterPatients(searchTerm);
            } else if (window.PatientCRUD && typeof window.PatientCRUD.filterPatients === 'function') {
                window.PatientCRUD.filterPatients(searchTerm);
            } else {
                console.warn('No filterPatients function available');
            }
        }
    };

    // Export to global scope
    window.FormHandlers = FormHandlers;

    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => FormHandlers.init());
    } else {
        FormHandlers.init();
    }

    console.log('FormHandlers module loaded');

})(window);