// Hospital Stats MVP - Patient List Module
(function(window) {
    'use strict';
    
    const PatientList = {
        // Module state
        patientRecords: [],
        isLoaded: false,
        
        // Initialize the module
        init() {
            console.log('PatientList module initializing...');
            this.bindEvents();
        },
        
        // Bind event listeners
        bindEvents() {
            // Use event delegation for search input
            document.addEventListener('input', this.handleInput.bind(this));
            
            // Listen for patient list rendering
            document.addEventListener('routeChange', this.handleRouteChange.bind(this));
        },
        
        // Handle input events
        handleInput(e) {
            if (e.target && e.target.id === 'search-patients') {
                console.log('Search input detected:', e.target.value);
                this.filterPatients(e.target.value);
            }
        },
        
        // Handle route changes
        handleRouteChange(e) {
            if (e.detail.view === 'patients') {
                console.log('Patients view requested, loading data...');
                this.loadPatientRecords();
            }
        },
        
        // Load patient records from both sources
        async loadPatientRecords() {
            console.log('Loading patient records...');
            this.patientRecords = [];
            
            try {
                // Load from Supabase
                await this.loadFromSupabase();
                
                // Load from localStorage
                this.loadFromLocalStorage();
                
                // Remove duplicates and sort
                this.processRecords();
                
                // Update global state for other modules
                State.set('patientRecords', this.patientRecords);
                window.patientRecords = this.patientRecords; // Legacy compatibility
                
                this.isLoaded = true;
                console.log('Patient records loaded:', this.patientRecords.length);
                
            } catch (error) {
                console.error('Failed to load patient records:', error);
                this.showError('Failed to load patient records: ' + error.message);
            }
        },
        
        // Load records from Supabase
        async loadFromSupabase() {
            const supabase = State.get('supabase');
            const user = State.get('user');
            
            if (!supabase || !user) {
                console.warn('Supabase or user not available for patient loading');
                return;
            }
            
            try {
                const { data, error } = await supabase
                    .from('patient_records')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('appointment_date', { ascending: false });
                
                if (error) throw error;
                
                if (data && data.length > 0) {
                    data.forEach(record => {
                        this.patientRecords.push({
                            ...record,
                            source: 'supabase',
                            syncStatus: 'synced'
                        });
                    });
                    console.log('Loaded', data.length, 'records from Supabase');
                }
                
            } catch (error) {
                console.error('Supabase loading error:', error);
                throw error;
            }
        },
        
        // Load records from localStorage
        loadFromLocalStorage() {
            try {
                const storageKey = Config.STORAGE_KEYS.PATIENT_RECORDS;
                const localData = localStorage.getItem(storageKey);
                
                if (localData) {
                    const localRecords = JSON.parse(localData);
                    
                    localRecords.forEach(record => {
                        this.patientRecords.push({
                            ...record,
                            source: 'localStorage',
                            syncStatus: 'pending'
                        });
                    });
                    
                    console.log('Loaded', localRecords.length, 'records from localStorage');
                }
                
            } catch (error) {
                console.error('localStorage loading error:', error);
            }
        },
        
        // Process records (remove duplicates, sort)
        processRecords() {
            // Remove duplicates (Supabase records take precedence)
            const seen = new Set();
            this.patientRecords = this.patientRecords.filter(record => {
                const key = record.patient_identifier + '_' + record.appointment_date;
                if (seen.has(key)) {
                    return false; // Skip duplicate
                }
                seen.add(key);
                return true;
            });
            
            // Sort by date (newest first)
            this.patientRecords.sort((a, b) => {
                const dateA = new Date(a.appointment_date);
                const dateB = new Date(b.appointment_date);
                return dateB - dateA;
            });
        },
        
        // Filter patients by search term
        filterPatients(searchTerm = '') {
            console.log('Filtering patients with term:', searchTerm);
            
            if (!this.isLoaded) {
                console.warn('Patient records not loaded yet');
                return;
            }
            
            const searchTermLower = searchTerm.toLowerCase().trim();
            
            // Filter records
            const filteredRecords = searchTermLower === '' ? 
                this.patientRecords : 
                this.patientRecords.filter(record => {
                    const patientId = (record.patient_identifier || '').toLowerCase();
                    return patientId.includes(searchTermLower);
                });
            
            console.log('Filtered to', filteredRecords.length, 'records');
            
            // Update the display
            this.renderFilteredRecords(filteredRecords, searchTermLower);
        },
        
        // Render filtered records
        renderFilteredRecords(records, searchTerm) {
            const listContainer = document.getElementById('patient-list');
            if (!listContainer) {
                console.error('patient-list container not found');
                return;
            }
            
            if (records.length === 0) {
                listContainer.innerHTML = searchTerm === '' ? 
                    '<div class=\"empty-state\">No patient records found</div>' :
                    '<div class=\"empty-state\">No matching Patient ID found</div>';
            } else {
                listContainer.innerHTML = records.map(record => 
                    this.renderPatientListItemHTML(record)
                ).join('');
            }
            
            console.log('Updated patient list display with', records.length, 'records');
        },
        
        // Render individual patient record HTML
        renderPatientListItemHTML(record) {
            const syncIcon = record.syncStatus === 'synced' ? 
                '<span class=\"sync-status synced\">✓ Synced</span>' :
                '<span class=\"sync-status pending\">⏳ Pending</span>';
            
            const formattedDate = new Date(record.appointment_date).toLocaleDateString();
            const source = record.source || 'supabase';
            const recordId = record.id || record.local_id;
            
            return `
                <div class=\"list-item\" onclick=\"PatientList.viewPatient('${recordId}', '${source}')\">
                    <div class=\"list-item-content\">
                        <div class=\"list-item-title\">Patient ID: ${record.patient_identifier}</div>
                        <div class=\"list-item-subtitle\">
                            ${formattedDate} • ${record.facility} • ${record.appointment_type}
                        </div>
                    </div>
                    <div class=\"list-item-actions\">
                        ${syncIcon}
                    </div>
                </div>
            `;
        },
        
        // Navigate to patient detail view
        viewPatient(id, source) {
            console.log('Viewing patient:', id, 'from source:', source);
            Router.navigate('patient', { id: id, source: source });
        },
        
        // Show error message
        showError(message) {
            console.error(message);
            
            // Try to use global error function
            if (window.showError) {
                window.showError(message);
            } else {
                // Fallback
                alert('Error: ' + message);
            }
        },
        
        // Get current records
        getRecords() {
            return this.patientRecords;
        },
        
        // Refresh records
        async refresh() {
            this.isLoaded = false;
            this.patientRecords = [];
            await this.loadPatientRecords();
        }
    };
    
    // Export to global scope
    window.PatientList = PatientList;
    
    // Auto-initialize when module loads
    PatientList.init();
    
    console.log('PatientList module loaded');
    
})(window);