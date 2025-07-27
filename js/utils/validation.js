/**
 * Form Validation Utilities
 * Handles all patient form validation logic
 */
(function(window) {
    'use strict';

    const Validation = {
        /**
         * Validate entire patient form
         */
        validatePatientForm(formData) {
            console.log('Validating patient form data:', formData);
            
            const errors = [];
            
            // Required fields validation
            const requiredErrors = this.validateRequiredFields(formData);
            errors.push(...requiredErrors);
            
            // Conditional fields validation
            const conditionalErrors = this.validateConditionalFields(formData);
            errors.push(...conditionalErrors);
            
            // Specific field validation
            const specificErrors = this.validateSpecificFields(formData);
            errors.push(...specificErrors);
            
            return errors;
        },

        /**
         * Validate required fields
         */
        validateRequiredFields(formData) {
            const errors = [];
            const requiredFields = [
                'patient_identifier', 'age_group', 'facility_type', 'facility',
                'date', 'appointment_type', 'referral_source', 'clinical_area',
                'attendance', 'disposal', 'outcome', 'duration_minutes'
            ];
            
            requiredFields.forEach(field => {
                if (!formData[field] || formData[field].toString().trim() === '') {
                    const fieldName = field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    errors.push(`${fieldName} is required`);
                }
            });
            
            return errors;
        },

        /**
         * Validate conditional fields
         */
        validateConditionalFields(formData) {
            const errors = [];
            
            // Validate referral source "Other" field
            if (formData.referral_source === 'Other' && (!formData.referral_other || formData.referral_other.trim() === '')) {
                errors.push('Please specify the referral source when selecting "Other"');
            }
            
            // Validate clinical area "Other" field
            if (formData.clinical_area === 'Other' && (!formData.clinical_other || formData.clinical_other.trim() === '')) {
                errors.push('Please specify the clinical area when selecting "Other"');
            }
            
            return errors;
        },

        /**
         * Validate specific field formats and ranges
         */
        validateSpecificFields(formData) {
            const errors = [];
            
            // Validate appointment date
            const dateError = this.validateAppointmentDate(formData.appointment_date);
            if (dateError) errors.push(dateError);
            
            // Validate duration
            const durationError = this.validateDuration(formData.duration_minutes);
            if (durationError) errors.push(durationError);
            
            // Validate patient ID
            const patientIdError = this.validatePatientId(formData.patient_identifier);
            if (patientIdError) errors.push(patientIdError);
            
            return errors;
        },

        /**
         * Validate appointment date (cannot be in future)
         */
        validateAppointmentDate(appointmentDate) {
            if (!appointmentDate) return null;
            
            const selectedDate = new Date(appointmentDate);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate > today) {
                return 'Appointment date cannot be in the future';
            }
            
            return null;
        },

        /**
         * Validate duration (must be positive number)
         */
        validateDuration(duration) {
            if (!duration) return null;
            
            const durationNum = parseInt(duration);
            if (isNaN(durationNum) || durationNum <= 0) {
                return 'Duration must be a positive number';
            }
            
            return null;
        },

        /**
         * Validate patient ID format
         */
        validatePatientId(patientId) {
            if (!patientId) return null;
            
            // Basic validation - should not be empty and should have reasonable length
            if (patientId.trim().length < 2) {
                return 'Patient ID must be at least 2 characters long';
            }
            
            if (patientId.trim().length > 50) {
                return 'Patient ID must be less than 50 characters';
            }
            
            return null;
        },

        /**
         * Display form validation errors
         */
        showFormErrors(errors) {
            console.log('Displaying form errors:', errors);
            
            // Clear previous errors
            this.clearFormErrors();
            
            if (errors.length === 0) return;
            
            // Show error message
            const errorMessage = errors.length === 1 ? 
                errors[0] : 
                `Please fix the following errors:\n• ${errors.join('\n• ')}`;
            
            if (window.showError) {
                window.showError(errorMessage);
            } else {
                alert(errorMessage);
            }
            
            // Highlight first error field if possible
            this.highlightErrorFields(errors);
        },

        /**
         * Clear all form error states
         */
        clearFormErrors() {
            // Remove error classes from all inputs
            const inputs = document.querySelectorAll('.error, .field-error');
            inputs.forEach(input => {
                input.classList.remove('error', 'field-error');
            });
            
            // Remove error messages
            const errorMessages = document.querySelectorAll('.error-message');
            errorMessages.forEach(msg => msg.remove());
        },

        /**
         * Highlight fields with errors
         */
        highlightErrorFields(errors) {
            errors.forEach(error => {
                const field = this.getFieldNameFromError(error);
                if (field) {
                    const input = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
                    if (input) {
                        input.classList.add('field-error');
                    }
                }
            });
        },

        /**
         * Extract field name from error message
         */
        getFieldNameFromError(error) {
            const fieldMappings = {
                'Patient Id': 'patient_identifier',
                'Patient ID': 'patient_identifier',
                'Age Group': 'age_group',
                'Facility Type': 'facility_type',
                'Facility': 'facility',
                'Date': 'date',
                'Appointment Type': 'appointment_type',
                'Referral Source': 'referral_source',
                'Clinical Area': 'clinical_area',
                'Attendance': 'attendance',
                'Disposal': 'disposal',
                'Outcome': 'outcome',
                'Duration Minutes': 'duration_minutes'
            };
            
            for (const [display, field] of Object.entries(fieldMappings)) {
                if (error.includes(display)) {
                    return field;
                }
            }
            
            return null;
        },

        /**
         * Real-time field validation for patient ID
         */
        validatePatientIdField(e) {
            const input = e.target;
            const value = input.value.trim();
            
            this.clearFieldError(input);
            
            if (value.length > 0) {
                const error = this.validatePatientId(value);
                if (error) {
                    this.showFieldError(input, error);
                }
            }
        },

        /**
         * Real-time field validation for date
         */
        validateDateField(e) {
            const input = e.target;
            const value = input.value;
            
            this.clearFieldError(input);
            
            if (value) {
                const error = this.validateAppointmentDate(value);
                if (error) {
                    this.showFieldError(input, error);
                }
            }
        },

        /**
         * Real-time field validation for duration
         */
        validateDurationField(e) {
            const input = e.target;
            const value = input.value;
            
            this.clearFieldError(input);
            
            if (value) {
                const error = this.validateDuration(value);
                if (error) {
                    this.showFieldError(input, error);
                }
            }
        },

        /**
         * Show field-specific error message
         */
        showFieldError(input, message) {
            input.classList.add('field-error');
            
            // Remove existing error message
            this.clearFieldError(input);
            
            // Add new error message
            const errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.textContent = message;
            
            // Insert after the input
            input.parentNode.insertBefore(errorDiv, input.nextSibling);
        },

        /**
         * Clear field-specific error
         */
        clearFieldError(input) {
            input.classList.remove('field-error');
            
            // Remove error message
            const errorMsg = input.parentNode.querySelector('.error-message');
            if (errorMsg) {
                errorMsg.remove();
            }
        }
    };

    // Export to global scope
    window.Validation = Validation;

})(window);