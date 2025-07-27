/**
 * UI Components and Helpers
 * Handles reusable UI components and form options
 */
(function(window) {
    'use strict';

    const UIComponents = {
        /**
         * Get facility options for dropdowns
         */
        getFacilityOptions() {
            return {
                hospital: [
                    'Groote Schuur Hospital',
                    'Red Cross War Memorial Children\'s Hospital',
                    'Tygerberg Hospital',
                    'Karl Bremer Hospital',
                    'Eerste River Hospital',
                    'Victoria Hospital',
                    'Worcester Hospital',
                    'George Hospital',
                    'Oudtshoorn Hospital'
                ],
                clinic: [
                    'Bishop Lavis CHC',
                    'Retreat CHC',
                    'Hanover Park CHC',
                    'Mitchell\'s Plain CHC',
                    'Gugulethu CHC',
                    'Khayelitsha CHC',
                    'Elsies River CHC',
                    'Delft CHC',
                    'Site B CHC',
                    'Kraaifontein CHC',
                    'Goodwood CHC',
                    'Parow CHC',
                    'Bellville CHC',
                    'Kuils River CHC',
                    'Blue Downs CHC',
                    'Eerste River CHC',
                    'Strand CHC',
                    'Somerset West CHC',
                    'Paarl CHC',
                    'Wellington CHC',
                    'Worcester CHC',
                    'Ceres CHC',
                    'George CHC',
                    'Knysna CHC',
                    'Mossel Bay CHC',
                    'Oudtshoorn CHC',
                    'Beaufort West CHC'
                ]
            };
        },

        /**
         * Get activities options with proper grouping
         */
        getActivitiesOptions() {
            return {
                'Assessment & Evaluation': [
                    'assessment',
                    'screening', 
                    'evaluation',
                    'reassessment'
                ],
                'Treatment & Intervention': [
                    'individual_treatment',
                    'group_treatment',
                    'exercise_therapy',
                    'manual_therapy',
                    'electrotherapy',
                    'hydrotherapy'
                ],
                'Education & Training': [
                    'patient_education',
                    'family_education',
                    'home_program',
                    'safety_training'
                ],
                'Equipment & Devices': [
                    'assistive_device_prescription',
                    'assistive_device_training',
                    'equipment_modification',
                    'wheelchair_assessment'
                ],
                'Administrative': [
                    'documentation',
                    'care_planning',
                    'discharge_planning',
                    'referral_coordination'
                ]
            };
        },

        /**
         * Get assistive devices options (must match requirements specification)
         */
        getAssistiveDevicesOptions() {
            // Return the assistive devices from Constants for consistency
            if (window.Constants && window.Constants.ASSISTIVE_DEVICES) {
                return window.Constants.ASSISTIVE_DEVICES;
            }
            
            // Fallback if Constants not loaded (should not happen)
            return [
                {
                    value: 'mobility-device',
                    label: 'Mobility Device',
                    fundingSources: [
                        { value: 'new', label: 'New' },
                        { value: 'second-hand', label: 'Second-Hand' },
                        { value: 'donation', label: 'Donation' }
                    ]
                },
                {
                    value: 'splint',
                    label: 'Splint',
                    fundingSources: [
                        { value: 'new', label: 'New' },
                        { value: 'second-hand', label: 'Second-Hand' },
                        { value: 'donation', label: 'Donation' }
                    ]
                },
                {
                    value: 'wheelchair',
                    label: 'Wheelchair',
                    requiresSerialNumber: true,
                    fundingSources: [
                        { value: 'new', label: 'New' },
                        { value: 'second-hand', label: 'Second-Hand' },
                        { value: 'donation', label: 'Donation' }
                    ]
                },
                {
                    value: 'other',
                    label: 'Other (specify)',
                    allowCustomInput: true,
                    fundingSources: [
                        { value: 'new', label: 'New' },
                        { value: 'second-hand', label: 'Second-Hand' },
                        { value: 'donation', label: 'Donation' }
                    ]
                }
            ];
        },

        /**
         * Update facility dropdown based on facility type
         */
        updateFacilityOptions() {
            const facilityTypeSelect = document.getElementById('facility_type');
            const facilitySelect = document.getElementById('facility');
            
            if (!facilityTypeSelect || !facilitySelect) return;
            
            const facilityType = facilityTypeSelect.value;
            const facilityOptions = this.getFacilityOptions();
            
            // Clear current options
            facilitySelect.innerHTML = '<option value="">Select Facility</option>';
            
            if (facilityType && facilityOptions[facilityType]) {
                facilityOptions[facilityType].forEach(facility => {
                    const option = document.createElement('option');
                    option.value = facility;
                    option.textContent = facility;
                    facilitySelect.appendChild(option);
                });
                
                facilitySelect.disabled = false;
            } else {
                facilitySelect.disabled = true;
            }
        },

        /**
         * Toggle referral "Other" input field
         */
        toggleReferralOther() {
            const referralSelect = document.getElementById('referral_source');
            const otherContainer = document.getElementById('referral-other-container');
            const otherInput = document.getElementById('referral_other');
            
            if (!referralSelect || !otherContainer || !otherInput) return;
            
            if (referralSelect.value === 'Other') {
                otherContainer.style.display = 'block';
                otherInput.required = true;
                otherInput.focus();
            } else {
                otherContainer.style.display = 'none';
                otherInput.required = false;
                otherInput.value = '';
            }
        },

        /**
         * Toggle clinical area "Other" input field
         */
        toggleClinicalOther() {
            const clinicalSelect = document.getElementById('clinical_area');
            const otherContainer = document.getElementById('clinical-other-container');
            const otherInput = document.getElementById('clinical_other');
            
            if (!clinicalSelect || !otherContainer || !otherInput) return;
            
            if (clinicalSelect.value === 'Other') {
                otherContainer.style.display = 'block';
                otherInput.required = true;
                otherInput.focus();
            } else {
                otherContainer.style.display = 'none';
                otherInput.required = false;
                otherInput.value = '';
            }
        },

        /**
         * Toggle assistive device detail inputs
         */
        toggleDeviceDetails(deviceType) {
            const detailsContainer = document.getElementById(`${deviceType}-details`);
            const checkbox = document.getElementById(deviceType);
            
            if (!detailsContainer || !checkbox) return;
            
            if (checkbox.checked) {
                detailsContainer.style.display = 'block';
            } else {
                detailsContainer.style.display = 'none';
                // Clear all inputs in this container
                const inputs = detailsContainer.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (input.type === 'checkbox' || input.type === 'radio') {
                        input.checked = false;
                    } else {
                        input.value = '';
                    }
                });
            }
        },

        /**
         * Show/hide loading overlay
         */
        showLoading(show) {
            const loadingOverlay = document.getElementById('loading-overlay');
            if (loadingOverlay) {
                loadingOverlay.style.display = show ? 'flex' : 'none';
            }
        },

        /**
         * Show error message to user
         */
        showError(message) {
            console.error('Error:', message);
            alert(message); // TODO: Replace with better UI notification
        },

        /**
         * Show success message to user
         */
        showMessage(message, type = 'info') {
            console.log(`${type}:`, message);
            
            // For now, use alert - should be replaced with proper notification system
            if (type === 'success') {
                alert(`✓ ${message}`);
            } else if (type === 'warning') {
                alert(`⚠ ${message}`);
            } else {
                alert(message);
            }
        },

        /**
         * Toggle password visibility
         */
        togglePassword(button) {
            const input = button.parentNode.querySelector('input');
            const icon = button.querySelector('span');
            
            if (!input || !icon) return;
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.textContent = '🙈';
                button.setAttribute('aria-label', 'Hide password');
            } else {
                input.type = 'password';
                icon.textContent = '👁️';
                button.setAttribute('aria-label', 'Show password');
            }
        },

        /**
         * Generate sub-district options based on district
         */
        getSubDistrictOptions(district) {
            const subDistricts = {
                'City of Cape Town Metro': [
                    'City of Cape Town Metro Central',
                    'City of Cape Town Metro East',
                    'City of Cape Town Metro North',
                    'City of Cape Town Metro South',
                    'City of Cape Town Metro West'
                ],
                'Cape Winelands': [
                    'Stellenbosch',
                    'Drakenstein',
                    'Witzenberg',
                    'Breede Valley',
                    'Langeberg'
                ],
                'Overberg': [
                    'Overstrand',
                    'Cape Agulhas',
                    'Swellendam',
                    'Theewaterskloof'
                ],
                'West Coast': [
                    'Saldanha Bay',
                    'Swartland',
                    'Bergrivier',
                    'Cederberg',
                    'Matzikama'
                ],
                'Garden Route': [
                    'George',
                    'Knysna',
                    'Bitou',
                    'Mossel Bay',
                    'Hessequa',
                    'Oudtshoorn',
                    'Kannaland'
                ],
                'Central Karoo': [
                    'Beaufort West',
                    'Laingsburg',
                    'Prince Albert'
                ]
            };
            
            return subDistricts[district] || [];
        },

        /**
         * Update sub-district dropdown based on selected district
         */
        updateSubDistrictOptions() {
            const districtSelect = document.getElementById('district');
            const subDistrictSelect = document.getElementById('sub_district');
            
            if (!districtSelect || !subDistrictSelect) return;
            
            const selectedDistrict = districtSelect.value;
            const subDistricts = this.getSubDistrictOptions(selectedDistrict);
            
            // Clear current options
            subDistrictSelect.innerHTML = '<option value="">Select Sub-District</option>';
            
            if (subDistricts.length > 0) {
                subDistricts.forEach(subDistrict => {
                    const option = document.createElement('option');
                    option.value = subDistrict;
                    option.textContent = subDistrict;
                    subDistrictSelect.appendChild(option);
                });
                
                subDistrictSelect.disabled = false;
            } else {
                subDistrictSelect.disabled = true;
            }
        },

        /**
         * Setup form field dependencies
         */
        setupFormDependencies() {
            // Facility type -> Facility options
            const facilityTypeSelect = document.getElementById('facility_type');
            if (facilityTypeSelect) {
                facilityTypeSelect.addEventListener('change', this.updateFacilityOptions.bind(this));
            }
            
            // Referral source -> Other field
            const referralSelect = document.getElementById('referral_source');
            if (referralSelect) {
                referralSelect.addEventListener('change', this.toggleReferralOther.bind(this));
            }
            
            // Clinical area -> Other field
            const clinicalSelect = document.getElementById('clinical_area');
            if (clinicalSelect) {
                clinicalSelect.addEventListener('change', this.toggleClinicalOther.bind(this));
            }
            
            // District -> Sub-district options
            const districtSelect = document.getElementById('district');
            if (districtSelect) {
                districtSelect.addEventListener('change', this.updateSubDistrictOptions.bind(this));
            }
        },

        /**
         * Format display text for options
         */
        formatOptionText(value) {
            return value
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
        },

        /**
         * Create option element
         */
        createOption(value, text) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = text || this.formatOptionText(value);
            return option;
        },

        /**
         * Populate select element with options
         */
        populateSelect(selectElement, options, placeholder = 'Select an option') {
            if (!selectElement) return;
            
            selectElement.innerHTML = `<option value="">${placeholder}</option>`;
            
            if (Array.isArray(options)) {
                options.forEach(option => {
                    const optionElement = typeof option === 'string' 
                        ? this.createOption(option)
                        : this.createOption(option.value, option.text);
                    selectElement.appendChild(optionElement);
                });
            } else if (typeof options === 'object') {
                Object.entries(options).forEach(([group, items]) => {
                    const optgroup = document.createElement('optgroup');
                    optgroup.label = this.formatOptionText(group);
                    
                    items.forEach(item => {
                        const optionElement = typeof item === 'string'
                            ? this.createOption(item)
                            : this.createOption(item.value, item.text);
                        optgroup.appendChild(optionElement);
                    });
                    
                    selectElement.appendChild(optgroup);
                });
            }
        }
    };

    // Export to global scope
    window.UIComponents = UIComponents;

    // Also export individual functions for legacy compatibility
    window.showLoading = UIComponents.showLoading.bind(UIComponents);
    window.showError = UIComponents.showError.bind(UIComponents);
    window.showMessage = UIComponents.showMessage.bind(UIComponents);
    window.togglePassword = UIComponents.togglePassword.bind(UIComponents);

})(window);