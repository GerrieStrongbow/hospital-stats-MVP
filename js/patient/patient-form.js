// Hospital Stats MVP - Patient Form Module
(function(window) {
    'use strict';
    
    const PatientForm = {
        // Module state
        currentPatientData: null,
        currentPatientId: null,
        currentSource: null,
        isEditing: false,
        
        // Initialize the module
        init() {
            console.log('PatientForm module initializing...');
            this.bindEvents();
        },
        
        // Bind event listeners
        bindEvents() {
            // Listen for route changes to patient form
            document.addEventListener('routeChange', this.handleRouteChange.bind(this));
        },
        
        // Handle route changes
        handleRouteChange(e) {
            if (e.detail.view === 'patientForm') {
                const patientId = e.detail.args[0];
                const source = e.detail.args[1] || e.detail.params.source;
                console.log('Patient form requested for:', patientId, 'from source:', source);
                this.loadPatientForm(patientId, source);
            }
        },
        
        // Load patient form
        async loadPatientForm(patientId, source) {
            console.log('Loading patient form for ID:', patientId, 'source:', source);
            
            this.currentPatientId = patientId;
            this.currentSource = source;
            this.isEditing = patientId && patientId !== 'new';
            
            // Load patient data if editing
            if (this.isEditing) {
                await this.loadPatientData(patientId, source);
            } else {
                this.currentPatientData = null;
            }
            
            // Update global state for compatibility
            State.set('currentPatientData', this.currentPatientData);
            State.set('currentPatientId', this.currentPatientId);
            
            console.log('Patient form data loaded:', {
                isEditing: this.isEditing,
                patientId: this.currentPatientId,
                source: this.currentSource,
                hasData: !!this.currentPatientData
            });
            
            // Trigger form population after data is loaded
            setTimeout(() => {
                this.populateForm();
            }, 50);
        },
        
        // Load patient data from appropriate source
        async loadPatientData(patientId, source) {
            console.log('Loading patient data for:', patientId, 'from:', source);
            
            try {
                if (source === 'localStorage') {
                    await this.loadFromLocalStorage(patientId);
                } else {
                    // Try Supabase first, fallback to localStorage
                    await this.loadFromSupabase(patientId);
                    
                    if (!this.currentPatientData) {
                        console.log('Not found in Supabase, trying localStorage...');
                        await this.loadFromLocalStorage(patientId);
                    }
                }
                
                if (!this.currentPatientData) {
                    console.warn('Patient data not found in any source');
                    this.showError('Patient record not found');
                }
                
            } catch (error) {
                console.error('Failed to load patient data:', error);
                this.showError('Failed to load patient data: ' + error.message);
            }
        },
        
        // Load from Supabase
        async loadFromSupabase(patientId) {
            const supabase = State.get('supabase');
            const user = State.get('user');
            
            if (!supabase || !user) {
                console.warn('Supabase or user not available');
                return;
            }
            
            try {
                const { data, error } = await supabase
                    .from('patient_records')
                    .select('*')
                    .eq('id', patientId)
                    .eq('user_id', user.id)
                    .single();
                
                if (error) {
                    if (error.code !== 'PGRST116') { // Not "not found" error
                        throw error;
                    }
                    console.log('Patient not found in Supabase');
                    return;
                }
                
                if (data) {
                    this.currentPatientData = {
                        ...data,
                        source: 'supabase'
                    };
                    console.log('Patient data loaded from Supabase');
                }
                
            } catch (error) {
                console.error('Supabase loading error:', error);
                throw error;
            }
        },
        
        // Load from localStorage
        async loadFromLocalStorage(patientId) {
            try {
                const storageKey = window.Constants?.APP_SETTINGS?.STORAGE_KEYS?.PATIENT_RECORDS || Config.STORAGE_KEYS.PATIENT_RECORDS;
                const localData = localStorage.getItem(storageKey);
                
                if (localData) {
                    const localRecords = JSON.parse(localData);
                    
                    // Look for record by ID or local_id
                    const record = localRecords.find(r => 
                        r.id === patientId || r.local_id === patientId
                    );
                    
                    if (record) {
                        this.currentPatientData = {
                            ...record,
                            source: 'localStorage'
                        };
                        console.log('Patient data loaded from localStorage');
                    }
                }
                
            } catch (error) {
                console.error('localStorage loading error:', error);
                throw error;
            }
        },
        
        // Populate form fields with patient data
        populateForm() {
            if (!this.currentPatientData) {
                console.log('No patient data to populate');
                return;
            }
            
            console.log('Populating form with patient data:', this.currentPatientData);
            
            const patient = this.currentPatientData;
            
            // Helper function to set field value
            const setFieldValue = (fieldId, value) => {
                const field = document.getElementById(fieldId);
                if (field && value !== null && value !== undefined) {
                    field.value = value;
                    console.log(`Set ${fieldId} to:`, value);
                } else if (!field && fieldId.includes('-other')) {
                    // Don't warn about missing conditional fields that may not be visible yet
                    console.log(`Conditional field ${fieldId} not found (may not be visible yet)`);
                } else if (!field) {
                    console.warn(`Field ${fieldId} not found`);
                }
            };
            
            // Populate basic fields
            setFieldValue('patient-identifier', patient.patient_identifier);
            setFieldValue('age-group', patient.age_group);
            setFieldValue('facility-type', patient.facility_type);
            setFieldValue('appointment-date', patient.appointment_date);
            setFieldValue('appointment-type', patient.appointment_type);
            setFieldValue('referral-source', patient.referral_source);
            setFieldValue('referral-source-other', patient.referral_source_other);
            setFieldValue('clinical-area', patient.clinical_area);
            setFieldValue('clinical-area-other', patient.clinical_area_other);
            setFieldValue('attendance', patient.attendance);
            setFieldValue('disposal', patient.disposal);
            setFieldValue('outcome', patient.outcome);
            setFieldValue('duration-minutes', patient.duration_minutes);
            
            // Handle facility after updating facility type options
            // We'll set this after updateConditionalFields() is called
            
            // Handle activities (checkboxes)
            if (patient.activities && Array.isArray(patient.activities)) {
                patient.activities.forEach(activity => {
                    const checkbox = document.querySelector(`input[name="activities"][value="${activity}"]`);
                    if (checkbox) {
                        checkbox.checked = true;
                    }
                });
            }
            
            // Handle assistive devices (complex object)
            if (patient.assistive_devices) {
                console.log('=== ASSISTIVE DEVICES DEBUG ===');
                console.log('Assistive devices data:', patient.assistive_devices);
                console.log('Device keys:', Object.keys(patient.assistive_devices));
                
                Object.keys(patient.assistive_devices).forEach(deviceType => {
                    const device = patient.assistive_devices[deviceType];
                    console.log(`Processing device: ${deviceType}`, device);
                    
                    // FIX: Check for 'issued' property instead of 'used'
                    if (device && device.issued) {
                        const checkbox = document.querySelector(`input[name="assistive_devices"][value="${deviceType}"]`);
                        console.log(`Checkbox for ${deviceType}:`, checkbox);
                        
                        if (checkbox) {
                            checkbox.checked = true;
                            console.log(`Checked ${deviceType} checkbox`);
                            
                            // Trigger the visibility toggle for device details
                            this.toggleDeviceDetails(deviceType);
                            
                            // Populate device details with small delay to ensure DOM is updated
                            setTimeout(() => {
                                const detailsField = document.getElementById(`${deviceType}-details`);
                                console.log(`Details field for ${deviceType}:`, detailsField);
                                
                                if (detailsField) {
                                    detailsField.style.display = 'block';
                                    
                                    // Populate funding source
                                    if (device.funding_source) {
                                        const fundingField = document.getElementById(`${deviceType}-funding`);
                                        if (fundingField) {
                                            fundingField.value = device.funding_source;
                                            console.log(`Set ${deviceType} funding to:`, device.funding_source);
                                        }
                                    }
                                    
                                    // Populate serial number (for wheelchairs)
                                    if (device.serial_number) {
                                        const serialField = document.getElementById(`${deviceType}-serial`);
                                        if (serialField) {
                                            serialField.value = device.serial_number;
                                            console.log(`Set ${deviceType} serial to:`, device.serial_number);
                                        }
                                    }
                                    
                                    // Populate custom specification (for "other" devices)
                                    if (device.specification) {
                                        const specifyField = document.getElementById(`${deviceType}-specify`);
                                        if (specifyField) {
                                            specifyField.value = device.specification;
                                            console.log(`Set ${deviceType} specification to:`, device.specification);
                                        }
                                    }
                                }
                            }, 50);
                        }
                    }
                });
                console.log('=== END ASSISTIVE DEVICES DEBUG ===');
            }
            
            // Trigger conditional field updates FIRST
            this.updateConditionalFields();
            
            // Set facility value after conditional fields are updated - with proper timing for PHC facilities
            if (patient.facility) {
                if (patient.facility_type === 'phc') {
                    // For PHC facilities, wait for facility options to be populated
                    const facilityOptionsHandler = (event) => {
                        console.log('=== FACILITY OPTIONS READY EVENT ===');
                        console.log('Event detail:', event.detail);
                        
                        setTimeout(() => {
                            const facilitySelect = document.getElementById('facility');
                            console.log('=== PHC FACILITY DEBUG ===');
                            console.log('Facility value to set:', patient.facility);
                            console.log('Facility select element:', facilitySelect);
                            console.log('Available options:', Array.from(facilitySelect?.options || []).map(opt => opt.value));
                            
                            setFieldValue('facility', patient.facility);
                            
                            console.log('Facility value after setting:', facilitySelect?.value);
                            console.log('=== END PHC FACILITY DEBUG ===');
                        }, 50);
                        
                        // Remove the event listener after use
                        document.removeEventListener('facilityOptionsReady', facilityOptionsHandler);
                    };
                    
                    // Listen for facility options to be ready
                    document.addEventListener('facilityOptionsReady', facilityOptionsHandler);
                } else {
                    // For non-PHC facilities, set immediately after conditional fields update
                    setTimeout(() => {
                        const facilitySelect = document.getElementById('facility');
                        
                        console.log('=== NON-PHC FACILITY DEBUG ===');
                        console.log('Facility value to set:', patient.facility);
                        console.log('Facility select element:', facilitySelect);
                        console.log('Available options:', Array.from(facilitySelect?.options || []).map(opt => opt.value));
                        
                        setFieldValue('facility', patient.facility);
                        
                        console.log('Facility value after setting:', facilitySelect?.value);
                        console.log('=== END NON-PHC FACILITY DEBUG ===');
                    }, 100);
                }
            }
            
            console.log('Form population completed');
        },
        
        // Update conditional fields based on current selections
        updateConditionalFields() {
            // Update facility options based on facility type
            const facilityType = document.getElementById('facility-type')?.value;
            if (facilityType) {
                const facilitySelect = document.getElementById('facility');
                if (facilitySelect) {
                    this.updateFacilityOptions(facilityType, facilitySelect);
                }
            }
            
            // Show/hide referral source other field
            const referralSource = document.getElementById('referral-source')?.value;
            if (referralSource === 'other') {
                this.toggleReferralOther('other');
            }
            
            // Show/hide clinical area other field
            const clinicalArea = document.getElementById('clinical-area')?.value;
            if (clinicalArea === 'Other (specify below)') {
                this.toggleClinicalOther('Other (specify below)');
            }
        },
        
        // Show error message
        showError(message) {
            console.error(message);
            
            if (window.showError) {
                window.showError(message);
            } else {
                alert('Error: ' + message);
            }
        },
        
        // Get current form data
        getCurrentData() {
            const data = {
                patientData: this.currentPatientData,
                patientId: this.currentPatientId,
                source: this.currentSource,
                isEditing: this.isEditing
            };
            console.log('PatientForm.getCurrentData():', data);
            return data;
        },
        
        // Clear current data
        clear() {
            this.currentPatientData = null;
            this.currentPatientId = null;
            this.currentSource = null;
            this.isEditing = false;
            
            // Clear global state
            State.set('currentPatientData', null);
            State.set('currentPatientId', null);
        },

        // Render patient form view
        async renderView(patientId) {
            console.log('Rendering patient form for ID:', patientId);
            
            // Set up form state
            this.currentPatientId = patientId;
            this.isEditing = patientId && patientId !== 'new';
            
            // Load patient data if editing
            if (this.isEditing) {
                await this.loadPatientData(patientId);
            }

            const title = this.isEditing ? 'Edit Patient Record' : 'New Patient Record';
            const submitText = this.isEditing ? 'Update Record' : 'Save Record';

            return `
                <div class="header">
                    <div class="nav">
                        <button class="btn" style="background: none; color: white;" onclick="Router.navigate('dashboard')">
                            ← Back
                        </button>
                        <h1 class="header-title">${title}</h1>
                    </div>
                </div>
                <div class="form-page">
                    <div class="form-container">
                        <form id="patient-form" class="patient-form">
                            ${this.renderPatientFormFields()}
                            <div class="form-navigation">
                                <div class="form-nav-content">
                                    <div class="form-nav-info">
                                        ${this.isEditing ? 'Editing existing record' : 'Creating new record'}
                                    </div>
                                    <div class="form-nav-actions">
                                        <button type="button" class="btn btn-secondary" onclick="Router.navigate('patients')">
                                            Cancel
                                        </button>
                                        ${this.isEditing ? `
                                        <button type="button" class="btn btn-danger" onclick="PatientCRUD.confirmDeletePatient()" style="margin-left: 8px;">
                                            Delete
                                        </button>
                                        ` : ''}
                                        <button type="submit" class="btn btn-primary" style="margin-left: 8px;">
                                            ${submitText}
                                        </button>
                                        ${this.isEditing ? `
                                        <button type="button" class="btn btn-info" onclick="PatientForm.debugCurrentState()" style="margin-left: 8px; background: #17a2b8;">
                                            Debug
                                        </button>
                                        ` : ''}
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            `;
        },

        // Render patient form fields
        renderPatientFormFields() {
            return `
                <div class="form-section">
                    <h3 class="form-section-title">
                        <span class="form-section-icon">👤</span>
                        Patient Information
                    </h3>
                    
                    <div class="form-group">
                        <label class="form-label" for="patient-identifier">Patient Identifier *</label>
                        <input type="text" id="patient-identifier" name="patient_identifier" class="form-input" required>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="age-group">Age Group *</label>
                        <select id="age-group" name="age_group" class="form-input" required>
                            <option value="">Select age group</option>
                            ${Constants.AGE_GROUPS.map(group => 
                                `<option value="${group.value}">${group.label}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="facility-type">Facility Type *</label>
                        <select id="facility-type" name="facility_type" class="form-input" required>
                            <option value="">Select facility type</option>
                            ${Constants.FACILITY_TYPES.map(type => 
                                `<option value="${type.value}">${type.label}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="form-group" id="facility-container" style="display: none;">
                        <label class="form-label" for="facility">Facility *</label>
                        <select id="facility" name="facility" class="form-input" required>
                            <option value="">Select facility</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="appointment-date">Appointment Date *</label>
                        <input type="date" id="appointment-date" name="appointment_date" class="form-input" required value="${new Date().toISOString().split('T')[0]}">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="appointment-type">Appointment Type *</label>
                        <select id="appointment-type" name="appointment_type" class="form-input" required>
                            <option value="">Select appointment type</option>
                            ${Constants.APPOINTMENT_TYPES.map(type => 
                                `<option value="${type.value}">${type.label}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>

                <div class="form-section">
                    <h3 class="form-section-title">
                        <span class="form-section-icon">📋</span>
                        Referral Information
                    </h3>
                    
                    <div class="form-group">
                        <label class="form-label" for="referral-source">Referral Source *</label>
                        <select id="referral-source" name="referral_source" class="form-input" required>
                            <option value="">Select referral source</option>
                            ${Constants.REFERRAL_SOURCES.map(source => 
                                `<option value="${source.value}">${source.label}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="form-group" id="referral-other-container" style="display: none;">
                        <label class="form-label" for="referral-other">Specify Other Referral Source</label>
                        <input type="text" id="referral-other" name="referral_source_other" class="form-input">
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="clinical-area">Clinical Area *</label>
                        <select id="clinical-area" name="clinical_area" class="form-input" required>
                            <option value="">Select clinical area</option>
                            ${Constants.CLINICAL_AREAS.map(area => 
                                `<option value="${area}">${area}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="form-group" id="clinical-other-container" style="display: none;">
                        <label class="form-label" for="clinical-other">Specify Other Clinical Area</label>
                        <input type="text" id="clinical-other" name="clinical_area_other" class="form-input">
                    </div>
                </div>

                <div class="form-section">
                    <h3 class="form-section-title">
                        <span class="form-section-icon">⏰</span>
                        Session Details
                    </h3>
                    
                    <div class="form-group">
                        <label class="form-label" for="attendance">Attendance *</label>
                        <select id="attendance" name="attendance" class="form-input" required>
                            <option value="">Select attendance</option>
                            ${Constants.ATTENDANCE_OPTIONS.map(option => 
                                `<option value="${option}">${option}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="disposal">Disposal *</label>
                        <select id="disposal" name="disposal" class="form-input" required>
                            <option value="">Select disposal</option>
                            ${Constants.DISPOSAL_OPTIONS.map(option => 
                                `<option value="${option}">${option}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="outcome">Outcome *</label>
                        <select id="outcome" name="outcome" class="form-input" required>
                            <option value="">Select outcome</option>
                            ${Constants.OUTCOME_OPTIONS.map(option => 
                                `<option value="${option}">${option}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label" for="duration-minutes">Duration (minutes)</label>
                        <input type="number" id="duration-minutes" name="duration_minutes" class="form-input" min="1" max="480">
                    </div>
                </div>

                <div class="form-section">
                    <h3 class="form-section-title">
                        <span class="form-section-icon">🎯</span>
                        Activities
                    </h3>
                    <div class="activities-grid">
                        ${Constants.ACTIVITIES.map(activity => `
                            <div class="activity-checkbox">
                                <label>
                                    <input type="checkbox" name="activities" value="${activity}">
                                    ${activity}
                                </label>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="form-section">
                    <h3 class="form-section-title">
                        <span class="form-section-icon">🦽</span>
                        Assistive Devices Issued
                    </h3>
                    <p class="form-section-description">Check if any assistive devices were issued during this session</p>
                    
                    ${Constants.ASSISTIVE_DEVICES.map(device => `
                        <div class="assistive-device-item" id="${device.value}-section">
                            <label class="checkbox-label">
                                <input type="checkbox" name="assistive_devices" value="${device.value}" onchange="PatientForm.toggleDeviceDetails('${device.value}')">
                                ${device.label}
                            </label>
                            
                            <div class="device-details" id="${device.value}-details" style="display: none; margin-left: 20px; margin-top: 10px;">
                                <div class="form-group">
                                    <label class="form-label">Funding Source</label>
                                    <select id="${device.value}-funding" name="${device.value}_funding" class="form-input">
                                        <option value="">Select funding source</option>
                                        ${device.fundingSources.map(source => 
                                            `<option value="${source.value}">${source.label}</option>`
                                        ).join('')}
                                    </select>
                                </div>
                                
                                ${device.requiresSerialNumber ? `
                                    <div class="form-group">
                                        <label class="form-label">Serial Number *</label>
                                        <input type="text" id="${device.value}-serial" name="${device.value}_serial" class="form-input" placeholder="Enter wheelchair serial number">
                                    </div>
                                ` : ''}
                                
                                ${device.allowCustomInput ? `
                                    <div class="form-group">
                                        <label class="form-label">Specify Device</label>
                                        <input type="text" id="${device.value}-specify" name="${device.value}_specify" class="form-input" placeholder="Describe the assistive device">
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        },

        // Set up form event listeners
        setupFormListeners() {
            // Listen for facility type changes to update facility options
            const facilityTypeSelect = document.getElementById('facility-type');
            const facilitySelect = document.getElementById('facility');
            
            if (facilityTypeSelect && facilitySelect) {
                facilityTypeSelect.addEventListener('change', (e) => {
                    this.updateFacilityOptions(e.target.value, facilitySelect);
                });
            }

            // Listen for referral source changes to show/hide "other" field
            const referralSourceSelect = document.getElementById('referral-source');
            if (referralSourceSelect) {
                referralSourceSelect.addEventListener('change', (e) => {
                    this.toggleReferralOther(e.target.value);
                });
            }

            // Listen for clinical area changes to show/hide "other" field
            const clinicalAreaSelect = document.getElementById('clinical-area');
            if (clinicalAreaSelect) {
                clinicalAreaSelect.addEventListener('change', (e) => {
                    this.toggleClinicalOther(e.target.value);
                });
            }
        },

        // Toggle referral source other field
        toggleReferralOther(value) {
            const container = document.getElementById('referral-other-container');
            const input = document.getElementById('referral-other');
            
            if (container && input) {
                if (value === 'other') {
                    container.style.display = 'block';
                    input.required = true;
                } else {
                    container.style.display = 'none';
                    input.required = false;
                    input.value = '';
                }
            }
        },

        // Toggle clinical area other field
        toggleClinicalOther(value) {
            const container = document.getElementById('clinical-other-container');
            const input = document.getElementById('clinical-other');
            
            if (container && input) {
                if (value === 'Other (specify below)') {
                    container.style.display = 'block';
                    input.required = true;
                } else {
                    container.style.display = 'none';
                    input.required = false;
                    input.value = '';
                }
            }
        },

        // Get user profile from Supabase
        async getUserProfile() {
            try {
                const user = State.get('user');
                const supabase = State.get('supabase');
                
                if (!user || !supabase) {
                    throw new Error('User or Supabase not available');
                }

                const { data, error } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                return data;
            } catch (error) {
                console.error('Error fetching user profile:', error);
                return null;
            }
        },

        // Toggle device details visibility
        toggleDeviceDetails(deviceValue) {
            const checkbox = document.querySelector(`input[name="assistive_devices"][value="${deviceValue}"]`);
            const detailsDiv = document.getElementById(`${deviceValue}-details`);
            
            if (checkbox && detailsDiv) {
                if (checkbox.checked) {
                    detailsDiv.style.display = 'block';
                } else {
                    detailsDiv.style.display = 'none';
                    // Clear all values in the details section
                    const inputs = detailsDiv.querySelectorAll('input, select');
                    inputs.forEach(input => input.value = '');
                }
            }
        },

        // Debug current state (for testing)
        debugCurrentState() {
            console.log('=== PATIENT FORM DEBUG STATE ===');
            console.log('Current Patient Data:', this.currentPatientData);
            console.log('Current Patient ID:', this.currentPatientId);
            console.log('Current Source:', this.currentSource);
            console.log('Is Editing:', this.isEditing);
            console.log('getCurrentData():', this.getCurrentData());
            
            // Test form data collection
            const formData = PatientCRUD.collectFormData();
            console.log('Current Form Data:', formData);
            
            alert('Debug info logged to console. Check browser console for details.');
        },

        // Update facility options based on facility type
        updateFacilityOptions(facilityType, facilitySelect) {
            const facilityContainer = document.getElementById('facility-container');
            
            if (facilityType === 'phc') {
                // Show facility container only for PHC
                facilityContainer.style.display = 'block';
                facilitySelect.required = true;
                
                // Get current facility value to preserve it
                const currentFacilityValue = facilitySelect.value;
                
                // Get user's sub-district from user profile
                this.getUserProfile().then(userProfile => {
                    if (userProfile && userProfile.sub_district) {
                        const userSubDistrict = userProfile.sub_district;
                        const facilities = Constants.PHC_FACILITIES[userSubDistrict] || [];
                        
                        facilitySelect.innerHTML = '<option value="">Select PHC facility</option>';
                        facilities.forEach(facility => {
                            const option = document.createElement('option');
                            option.value = facility;
                            option.textContent = facility;
                            facilitySelect.appendChild(option);
                        });
                        
                        // Restore the previous value if it exists in the options
                        if (currentFacilityValue && facilities.includes(currentFacilityValue)) {
                            facilitySelect.value = currentFacilityValue;
                            console.log('Restored PHC facility value:', currentFacilityValue);
                        }
                        
                        // Also check for patient data facility during initial population
                        if (this.currentPatientData && this.currentPatientData.facility && facilities.includes(this.currentPatientData.facility)) {
                            facilitySelect.value = this.currentPatientData.facility;
                            console.log('Set facility from patient data:', this.currentPatientData.facility);
                        }
                        
                        // Trigger a custom event when facility options are ready
                        const event = new CustomEvent('facilityOptionsReady', { 
                            detail: { facilityType, currentValue: currentFacilityValue, restored: facilities.includes(currentFacilityValue) }
                        });
                        document.dispatchEvent(event);
                    } else {
                        // No user profile found - make field optional and show error
                        console.warn('No user profile found for PHC facility selection');
                        facilitySelect.innerHTML = '<option value="">No sub-district found</option>';
                        // CRITICAL FIX: Make field not required when no profile found
                        facilitySelect.required = false;
                        facilityContainer.style.display = 'block'; // Still show it but make it optional
                    }
                }).catch(error => {
                    console.error('Error getting user profile:', error);
                    facilitySelect.innerHTML = '<option value="">Error loading facilities</option>';
                    // CRITICAL FIX: Make field not required when profile fails to load
                    facilitySelect.required = false;
                    facilityContainer.style.display = 'block'; // Still show it but make it optional
                });
            } else {
                // Hide facility container for non-PHC types, but set a default value
                facilityContainer.style.display = 'none';
                facilitySelect.required = false;
                
                // Clear existing options first
                facilitySelect.innerHTML = '<option value="">Select facility</option>';
                
                // Set facility value based on facility type for database requirements
                let facilityValue = '';
                switch(facilityType) {
                    case 'in-hospital':
                        facilityValue = 'In-hospital';
                        break;
                    case 'out-hospital':
                        facilityValue = 'Out-hospital';
                        break;
                    case 'icf':
                        facilityValue = 'Intermediate Care Facility';
                        break;
                    default:
                        facilityValue = '';
                }
                
                if (facilityValue) {
                    // Add the option and select it
                    const option = document.createElement('option');
                    option.value = facilityValue;
                    option.textContent = facilityValue;
                    facilitySelect.appendChild(option);
                    facilitySelect.value = facilityValue;
                }
            }
        }
    };
    
    // Export to global scope
    window.PatientForm = PatientForm;
    
    // Auto-initialize when module loads
    PatientForm.init();
    
    console.log('PatientForm module loaded');
    
})(window);