// Hospital Stats MVP - Patient CRUD Module
(function(window) {
    'use strict';
    
    const PatientCRUD = {
        // Module state
        isProcessing: false,
        
        // Initialize the module
        init() {
            console.log('PatientCRUD module initializing...');
            this.bindEvents();
        },
        
        // Bind event listeners
        bindEvents() {
            // Listen for form submissions
            document.addEventListener('submit', this.handleFormSubmit.bind(this));
            
            // Listen for delete button clicks
            document.addEventListener('click', this.handleDeleteClick.bind(this));
            
            // Listen for route changes to setup form buttons
            document.addEventListener('routeChange', this.handleRouteChange.bind(this));
        },
        
        // Handle route changes
        handleRouteChange(e) {
            if (e.detail.view === 'patientForm') {
                console.log('Patient form route detected, setting up CRUD buttons...');
                
                // Delay to allow form to render
                setTimeout(() => {
                    this.setupFormButtons();
                }, window.Constants?.APP_SETTINGS?.UI?.LOADING_DELAY || 100);
            }
        },
        
        // Setup form buttons based on current context
        setupFormButtons() {
            const patientData = PatientForm?.getCurrentData?.() || State.get('currentPatientData');
            const isEditing = patientData?.isEditing || (patientData?.patientData && patientData?.patientId !== 'new');
            
            console.log('Setting up form buttons - isEditing:', isEditing, 'patientData:', patientData);
            
            // Find or create button container
            let buttonContainer = document.getElementById('form-buttons');
            if (!buttonContainer) {
                const form = document.getElementById('patient-form');
                if (form) {
                    buttonContainer = document.createElement('div');
                    buttonContainer.id = 'form-buttons';
                    buttonContainer.className = 'form-buttons';
                    form.appendChild(buttonContainer);
                }
            }
            
            // Note: Button functionality is now handled by the patient form itself
            // No need to add additional buttons here
        },
        
        // Add buttons for editing existing patient
        addEditingButtons(container) {
            console.log('Adding editing buttons (including delete)');
            
            // Clear container safely
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            
            // Create button group
            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'button-group';
            
            // Save button
            const saveBtn = document.createElement('button');
            saveBtn.type = 'submit';
            saveBtn.className = 'btn btn-primary';
            saveBtn.id = 'save-patient';
            saveBtn.innerHTML = '<span class="btn-icon">💾</span> Save Changes';
            
            // Delete button
            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-danger';
            deleteBtn.id = 'delete-patient';
            deleteBtn.innerHTML = '<span class="btn-icon">🗑️</span> Delete Patient';
            
            // Back button
            const backBtn = document.createElement('button');
            backBtn.type = 'button';
            backBtn.className = 'btn btn-secondary';
            backBtn.textContent = '↩️ Back to List';
            backBtn.addEventListener('click', () => Router.navigate('patients'));
            
            buttonGroup.appendChild(saveBtn);
            buttonGroup.appendChild(deleteBtn);
            buttonGroup.appendChild(backBtn);
            container.appendChild(buttonGroup);
        },
        
        // Add buttons for new patient
        addNewPatientButtons(container) {
            console.log('Adding new patient buttons (no delete)');
            
            // Clear container safely
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            
            // Create button group
            const buttonGroup = document.createElement('div');
            buttonGroup.className = 'button-group';
            
            // Save button
            const saveBtn = document.createElement('button');
            saveBtn.type = 'submit';
            saveBtn.className = 'btn btn-primary';
            saveBtn.id = 'save-patient';
            saveBtn.innerHTML = '<span class="btn-icon">💾</span> Save Patient';
            
            // Back button
            const backBtn = document.createElement('button');
            backBtn.type = 'button';
            backBtn.className = 'btn btn-secondary';
            backBtn.textContent = '↩️ Back to List';
            backBtn.addEventListener('click', () => Router.navigate('patients'));
            
            buttonGroup.appendChild(saveBtn);
            buttonGroup.appendChild(backBtn);
            container.appendChild(buttonGroup);
        },
        
        // Handle form submission
        handleFormSubmit(e) {
            if (e.target && e.target.id === 'patient-form') {
                e.preventDefault();
                console.log('Patient form submitted via CRUD handler');
                this.savePatient();
            }
        },
        
        // Handle delete button clicks
        handleDeleteClick(e) {
            if (e.target && (e.target.id === 'delete-patient' || e.target.closest('#delete-patient'))) {
                e.preventDefault();
                console.log('Delete button clicked');
                this.confirmDeletePatient();
            }
        },
        
        // Save patient (create or update)
        async savePatient() {
            if (this.isProcessing) {
                console.log('Already processing, ignoring duplicate save request');
                return;
            }
            
            console.log('Starting patient save operation...');
            this.isProcessing = true;
            
            try {
                // Get form data
                const formData = this.collectFormData();
                if (!formData) {
                    throw new Error('Failed to collect form data');
                }
                
                // Validate required fields
                const validation = this.validateFormData(formData);
                if (!validation.isValid) {
                    throw new Error('Validation failed: ' + validation.errors.join(', '));
                }
                
                // Get current context
                const currentData = PatientForm?.getCurrentData?.() || {};
                const isEditing = currentData.isEditing;
                const patientId = currentData.patientId;
                
                console.log('Save context:', { 
                    isEditing, 
                    patientId, 
                    hasSupabase: !!State.get('supabase'),
                    currentData: currentData,
                    formDataKeys: Object.keys(formData),
                    patientIdentifier: formData.patient_identifier
                });
                
                let result;
                if (isEditing) {
                    result = await this.updatePatient(formData, patientId);
                } else {
                    result = await this.createPatient(formData);
                }
                
                if (result.success) {
                    this.showSuccess(isEditing ? 'Patient updated successfully' : 'Patient created successfully');
                    
                    // Navigate back to list after short delay
                    setTimeout(() => {
                        Router.navigate('patients');
                    }, window.Constants?.APP_SETTINGS?.UI?.NAVIGATION_DELAY || 1500);
                } else {
                    throw new Error(result.error || 'Save operation failed');
                }
                
            } catch (error) {
                console.error('Save patient error:', error);
                this.showError('Failed to save patient: ' + error.message);
            } finally {
                this.isProcessing = false;
            }
        },
        
        // Create new patient
        async createPatient(formData) {
            console.log('Creating new patient...');
            
            const user = State.get('user');
            const supabase = State.get('supabase');
            
            // Generate local ID for offline storage
            const localId = 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            
            // Prepare record for localStorage (includes local_id)
            const localRecord = {
                ...formData,
                local_id: localId,
                user_id: user?.id,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            // Try to save to Supabase first
            if (supabase && user) {
                try {
                    // Prepare record for Supabase (excludes local_id)
                    const supabaseRecord = {
                        ...formData,
                        user_id: user.id,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    };
                    
                    const { data, error } = await supabase
                        .from('patient_records')
                        .insert([supabaseRecord])
                        .select()
                        .single();
                    
                    if (error) throw error;
                    
                    if (data) {
                        console.log('Patient created in Supabase with ID:', data.id);
                        // Also save to localStorage as backup
                        this.saveToLocalStorage({ ...data, source: 'supabase' });
                        return { success: true, data: data };
                    }
                    
                } catch (error) {
                    console.warn('Supabase create failed, saving to localStorage:', error);
                    
                    // Check for duplicate key constraint error
                    if (error.code === '23505' && error.message.includes('duplicate key value violates unique constraint')) {
                        throw new Error(`Patient ID "${formData.patient_identifier}" already exists. Please use a different Patient ID or check existing records.`);
                    }
                }
            }
            
            // Fallback to localStorage
            this.saveToLocalStorage(localRecord);
            console.log('Patient created in localStorage with ID:', localId);
            
            return { success: true, data: localRecord };
        },
        
        // Update existing patient
        async updatePatient(formData, patientId) {
            console.log('Updating patient:', patientId);
            
            const user = State.get('user');
            const supabase = State.get('supabase');
            const currentData = PatientForm?.getCurrentData?.() || {};
            const source = currentData.source;
            
            const updateData = {
                ...formData,
                updated_at: new Date().toISOString()
            };
            
            // Try Supabase first if available and record is from Supabase
            if (supabase && user && source === 'supabase') {
                try {
                    const { data, error } = await supabase
                        .from('patient_records')
                        .update(updateData)
                        .eq('id', patientId)
                        .eq('user_id', user.id)
                        .select()
                        .single();
                    
                    if (error) throw error;
                    
                    if (data) {
                        console.log('Patient updated in Supabase');
                        // Update localStorage copy
                        this.updateInLocalStorage(data);
                        return { success: true, data: data };
                    }
                    
                } catch (error) {
                    console.warn('Supabase update failed, updating localStorage:', error);
                }
            }
            
            // Update in localStorage
            const updated = this.updateInLocalStorage({ ...updateData, id: patientId, local_id: patientId });
            if (updated) {
                console.log('Patient updated in localStorage');
                return { success: true, data: updated };
            }
            
            throw new Error('Failed to update patient in any storage');
        },
        
        // Confirm delete operation
        confirmDeletePatient() {
            const currentData = PatientForm?.getCurrentData?.() || {};
            const patientData = currentData.patientData;
            
            if (!patientData) {
                this.showError('No patient data to delete');
                return;
            }
            
            const patientId = patientData.patient_identifier || 'Unknown';
            
            if (confirm(`Are you sure you want to delete patient "${patientId}"?\n\nThis action cannot be undone.`)) {
                this.deletePatient();
            }
        },
        
        // Delete patient
        async deletePatient() {
            if (this.isProcessing) {
                console.log('Already processing, ignoring duplicate delete request');
                return;
            }
            
            console.log('Starting patient delete operation...');
            this.isProcessing = true;
            
            try {
                const currentData = PatientForm?.getCurrentData?.() || {};
                const patientId = currentData.patientId;
                const source = currentData.source;
                
                if (!patientId) {
                    throw new Error('No patient ID to delete');
                }
                
                console.log('Deleting patient:', patientId, 'from source:', source);
                
                const user = State.get('user');
                const supabase = State.get('supabase');
                
                // Delete from Supabase if available and record is from Supabase
                if (supabase && user && source === 'supabase') {
                    try {
                        const { error } = await supabase
                            .from('patient_records')
                            .delete()
                            .eq('id', patientId)
                            .eq('user_id', user.id);
                        
                        if (error) throw error;
                        
                        console.log('Patient deleted from Supabase');
                        
                    } catch (error) {
                        console.warn('Supabase delete failed:', error);
                        // Continue to delete from localStorage
                    }
                }
                
                // Delete from localStorage
                this.deleteFromLocalStorage(patientId);
                console.log('Patient deleted from localStorage');
                
                this.showSuccess('Patient deleted successfully');
                
                // Navigate back to list after short delay
                setTimeout(() => {
                    Router.navigate('patients');
                }, window.Constants?.APP_SETTINGS?.UI?.NAVIGATION_DELAY || 1500);
                
            } catch (error) {
                console.error('Delete patient error:', error);
                this.showError('Failed to delete patient: ' + error.message);
            } finally {
                this.isProcessing = false;
            }
        },
        
        // Collect form data
        collectFormData() {
            const form = document.getElementById('patient-form');
            if (!form) {
                console.error('Patient form not found');
                return null;
            }
            
            const formData = new FormData(form);
            const data = {};
            
            // Basic fields - match form field names exactly
            data.patient_identifier = formData.get('patient_identifier') || '';
            data.age_group = formData.get('age_group') || '';
            data.facility_type = formData.get('facility_type') || '';
            data.facility = formData.get('facility') || '';
            data.appointment_date = formData.get('appointment_date') || '';
            data.appointment_type = formData.get('appointment_type') || '';
            data.referral_source = formData.get('referral_source') || '';
            data.referral_source_other = formData.get('referral_source_other') || '';
            data.clinical_area = formData.get('clinical_area') || '';
            data.clinical_area_other = formData.get('clinical_area_other') || '';
            data.attendance = formData.get('attendance') || '';
            data.disposal = formData.get('disposal') || '';
            data.outcome = formData.get('outcome') || '';
            data.duration_minutes = parseInt(formData.get('duration_minutes')) || null;
            
            // Activities (multiple checkboxes)
            data.activities = formData.getAll('activities');
            
            // Assistive devices (complex structure)
            data.assistive_devices = this.collectAssistiveDevices(form);
            
            console.log('Collected form data:', data);
            return data;
        },
        
        // Collect assistive devices data
        collectAssistiveDevices(form) {
            const devices = {};
            const deviceCheckboxes = form.querySelectorAll('input[name="assistive_devices"]:checked');
            
            deviceCheckboxes.forEach(checkbox => {
                const deviceType = checkbox.value;
                devices[deviceType] = { used: true };
                
                // Check for detail fields
                const detailsContainer = document.getElementById(`${deviceType}-details`);
                if (detailsContainer && detailsContainer.style.display !== 'none') {
                    const details = {};
                    const detailFields = detailsContainer.querySelectorAll('input, select, textarea');
                    
                    detailFields.forEach(field => {
                        if (field.name && field.name.startsWith(`${deviceType}_`)) {
                            const detailKey = field.name.substring(`${deviceType}_`.length);
                            details[detailKey] = field.value;
                        }
                    });
                    
                    if (Object.keys(details).length > 0) {
                        devices[deviceType].details = details;
                    }
                }
            });
            
            return devices;
        },
        
        // Validate form data
        validateFormData(data) {
            const errors = [];
            
            // Required fields
            if (!data.patient_identifier?.trim()) {
                errors.push('Patient ID is required');
            }
            
            if (!data.appointment_date) {
                errors.push('Appointment date is required');
            }
            
            if (!data.facility_type) {
                errors.push('Facility type is required');
            }
            
            // Validate patient ID format
            if (data.patient_identifier) {
                const validation = window.Constants?.APP_SETTINGS?.VALIDATION || Config.VALIDATION.PATIENT_ID;
                const patientIdValidation = {
                    MIN_LENGTH: validation.PATIENT_ID_MIN_LENGTH || validation.MIN_LENGTH || 2,
                    MAX_LENGTH: validation.PATIENT_ID_MAX_LENGTH || validation.MAX_LENGTH || 20,
                    PATTERN: /^[A-Za-z0-9_-]+$/
                };
                if (data.patient_identifier.length < patientIdValidation.MIN_LENGTH) {
                    errors.push(`Patient ID must be at least ${patientIdValidation.MIN_LENGTH} characters`);
                }
                if (data.patient_identifier.length > patientIdValidation.MAX_LENGTH) {
                    errors.push(`Patient ID must be no more than ${patientIdValidation.MAX_LENGTH} characters`);
                }
                if (!patientIdValidation.PATTERN.test(data.patient_identifier)) {
                    errors.push('Patient ID can only contain letters, numbers, hyphens, and underscores');
                }
            }
            
            return {
                isValid: errors.length === 0,
                errors: errors
            };
        },
        
        // Save to localStorage
        saveToLocalStorage(record) {
            try {
                const storageKey = window.Constants?.APP_SETTINGS?.STORAGE_KEYS?.PATIENT_RECORDS || Config.STORAGE_KEYS.PATIENT_RECORDS;
                const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
                
                existing.push(record);
                localStorage.setItem(storageKey, JSON.stringify(existing));
                
                console.log('Record saved to localStorage');
                
            } catch (error) {
                console.error('Failed to save to localStorage:', error);
            }
        },
        
        // Update in localStorage
        updateInLocalStorage(updatedRecord) {
            try {
                const storageKey = window.Constants?.APP_SETTINGS?.STORAGE_KEYS?.PATIENT_RECORDS || Config.STORAGE_KEYS.PATIENT_RECORDS;
                const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
                
                const index = existing.findIndex(r => 
                    r.id === updatedRecord.id || r.local_id === updatedRecord.local_id
                );
                
                if (index !== -1) {
                    existing[index] = { ...existing[index], ...updatedRecord };
                    localStorage.setItem(storageKey, JSON.stringify(existing));
                    console.log('Record updated in localStorage');
                    return existing[index];
                }
                
                return null;
                
            } catch (error) {
                console.error('Failed to update in localStorage:', error);
                return null;
            }
        },
        
        // Delete from localStorage
        deleteFromLocalStorage(patientId) {
            try {
                const storageKey = window.Constants?.APP_SETTINGS?.STORAGE_KEYS?.PATIENT_RECORDS || Config.STORAGE_KEYS.PATIENT_RECORDS;
                const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
                
                const filtered = existing.filter(r => 
                    r.id !== patientId && r.local_id !== patientId
                );
                
                localStorage.setItem(storageKey, JSON.stringify(filtered));
                console.log('Record deleted from localStorage');
                
            } catch (error) {
                console.error('Failed to delete from localStorage:', error);
            }
        },
        
        // Show success message
        showSuccess(message) {
            console.log('Success:', message);
            
            if (window.showSuccess) {
                window.showSuccess(message);
            } else if (window.showError) {
                // Fallback to error function with success styling
                window.showError(message, 'success');
            } else {
                alert('Success: ' + message);
            }
        },
        
        // Show error message
        showError(message) {
            console.error('Error:', message);
            
            if (window.showError) {
                window.showError(message);
            } else {
                alert('Error: ' + message);
            }
        },
        
        // Get processing status
        isProcessingRequest() {
            return this.isProcessing;
        },

        // Navigate to patient detail view (for Views module compatibility)
        viewPatient(patientIdentifier, source) {
            console.log('Viewing patient:', patientIdentifier, 'from source:', source);
            
            // Find the actual record to get the proper ID
            const patientRecords = PatientList?.getRecords() || State.get('patientRecords') || [];
            const record = patientRecords.find(r => 
                r.patient_identifier === patientIdentifier && r.source === source
            );
            
            if (record) {
                const recordId = record.id || record.local_id;
                Router.navigate('patient', { id: recordId, source: source });
            } else {
                console.error('Patient record not found:', patientIdentifier, source);
                this.showError('Patient record not found');
            }
        }
    };
    
    // Export to global scope
    window.PatientCRUD = PatientCRUD;
    
    // Auto-initialize when module loads
    PatientCRUD.init();
    
    console.log('PatientCRUD module loaded');
    
})(window);