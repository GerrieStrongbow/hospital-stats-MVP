/**
 * Views Module
 * View rendering functions for SPA navigation
 */
(function(window) {
    'use strict';

    const Views = {
        // Landing page view
        renderLanding() {
            return `
                <div class="container">
                    <div style="text-align: center; padding: 60px 20px;">
                        <h1 style="font-size: 32px; margin-bottom: 16px;">Hospital Stats</h1>
                        <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 40px;">
                            Allied Healthcare Data Logger
                        </p>
                        <div style="max-width: 300px; margin: 0 auto;">
                            <button class="btn btn-primary btn-block mb-3" onclick="router.navigate('login')">
                                Sign In
                            </button>
                            <button class="btn btn-secondary btn-block" onclick="router.navigate('register')">
                                Register
                            </button>
                        </div>
                    </div>
                </div>
            `;
        },

        // Login page view
        renderLogin() {
            return `
                <div class="container">
                    <div class="card" style="max-width: 400px; margin: 40px auto;">
                        <h2 class="text-center mb-4">Sign In</h2>
                        <form id="login-form">
                            <div class="form-group">
                                <label class="form-label">Email Address</label>
                                <input type="email" class="form-input" name="email" required>
                            </div>
                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <div class="password-group">
                                    <input type="password" class="form-input" name="password" required>
                                    <button type="button" class="password-toggle" onclick="UIComponents.togglePassword(this)">
                                        👁
                                    </button>
                                </div>
                            </div>
                            <button type="submit" class="btn btn-primary btn-block">
                                Sign In
                            </button>
                        </form>
                        <p class="text-center mt-3">
                            Don't have an account?
                            <a href="#" onclick="router.navigate('register'); return false;">Register</a>
                        </p>
                    </div>
                </div>
            `;
        },

        // Register page view
        renderRegister() {
            const subDistricts = Constants.SUB_DISTRICTS;
            const therapistTypes = Constants.THERAPIST_TYPES;
            const employmentStatuses = Constants.EMPLOYMENT_STATUSES;

            return `
                <div class="container">
                    <div class="card" style="max-width: 600px; margin: 40px auto;">
                        <h2 class="text-center mb-4">Register</h2>
                        <form id="register-form">
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                <div class="form-group">
                                    <label class="form-label">First Name</label>
                                    <input type="text" class="form-input" name="firstName" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Last Name</label>
                                    <input type="text" class="form-input" name="lastName" required>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Email Address</label>
                                <input type="email" class="form-input" name="email"
                                       pattern="[a-zA-Z0-9._%+-]+@westerncape\\.gov\\.za$"
                                       placeholder="username@westerncape.gov.za" required>
                                <small style="color: var(--text-secondary); font-size: 12px;">
                                    Must be a @westerncape.gov.za email address
                                </small>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Therapist Type</label>
                                <select class="form-input" name="therapistType" required>
                                    <option value="">Select therapist type</option>
                                    ${therapistTypes.map(type =>
                                        `<option value="${type}">${type}</option>`
                                    ).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Employment Status</label>
                                <select class="form-input" name="employmentStatus" required>
                                    <option value="">Select employment status</option>
                                    ${employmentStatuses.map(status =>
                                        `<option value="${status.value}">${status.label}</option>`
                                    ).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Sub-district</label>
                                <select class="form-input" name="subDistrict" required>
                                    <option value="">Select sub-district</option>
                                    ${subDistricts.map(district =>
                                        `<option value="${district}">${district}</option>`
                                    ).join('')}
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Password</label>
                                <div class="password-group">
                                    <input type="password" class="form-input" name="password"
                                           minlength="6" required>
                                    <button type="button" class="password-toggle" onclick="UIComponents.togglePassword(this)">
                                        👁
                                    </button>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">Confirm Password</label>
                                <div class="password-group">
                                    <input type="password" class="form-input" name="confirmPassword"
                                           minlength="6" required>
                                    <button type="button" class="password-toggle" onclick="UIComponents.togglePassword(this)">
                                        👁
                                    </button>
                                </div>
                            </div>

                            <button type="submit" class="btn btn-primary btn-block">
                                Register
                            </button>
                        </form>
                        <p class="text-center mt-3">
                            Already have an account?
                            <a href="#" onclick="router.navigate('login'); return false;">Sign In</a>
                        </p>
                    </div>
                </div>
            `;
        },

        // Dashboard with sync status and patient count
        async renderDashboard() {
            // Get sync metadata and patient count
            const syncMetadata = Storage.getSyncMetadata();
            const patientCount = await Storage.getPatientCount();
            const pendingSyncCount = Storage.getPendingSyncCount();

            // Determine sync status
            let syncStatusClass = 'synced';
            let syncStatusText = 'All records synced';
            let syncIcon = '✓';

            if (pendingSyncCount > 0) {
                syncStatusClass = 'pending';
                syncStatusText = `${pendingSyncCount} records pending sync`;
                syncIcon = '⏳';
            } else if (!app.isOnline) {
                syncStatusClass = 'error';
                syncStatusText = 'Offline - records will sync when online';
                syncIcon = '⚠️';
            }

            // Format last sync time
            let lastSyncText = '';
            if (syncMetadata.lastSync) {
                const lastSyncDate = new Date(syncMetadata.lastSync);
                const now = new Date();
                const diffMinutes = Math.floor((now - lastSyncDate) / (1000 * 60));

                if (diffMinutes < 1) {
                    lastSyncText = 'Just now';
                } else if (diffMinutes < 60) {
                    lastSyncText = `${diffMinutes} minutes ago`;
                } else if (diffMinutes < 1440) { // 24 hours
                    const hours = Math.floor(diffMinutes / 60);
                    lastSyncText = `${hours} hour${hours > 1 ? 's' : ''} ago`;
                } else {
                    lastSyncText = lastSyncDate.toLocaleDateString() + ' at ' + lastSyncDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                }
            } else {
                lastSyncText = 'Never synced';
            }

            return `
                <div class="header">
                    <div class="nav">
                        <h1 class="header-title">Patient Records</h1>
                        <button class="btn" style="background: none; color: white;" onclick="Auth.signOut()">
                            Sign Out
                        </button>
                    </div>
                </div>
                <div class="container">
                    <div class="sync-status ${syncStatusClass} mb-3">
                        <span class="sync-status-icon"></span>
                        <div>
                            <div>${syncIcon} ${syncStatusText}</div>
                            <div style="font-size: 12px; opacity: 0.8; margin-top: 2px;">Last sync: ${lastSyncText}</div>
                        </div>
                        ${app.isOnline && pendingSyncCount > 0 ? '<button class="btn" style="margin-left: auto; padding: 6px 12px; font-size: 12px;" onclick="Sync.manualSync()">Sync Now</button>' : ''}
                    </div>

                    <div class="card mb-3">
                        <h3>Data Aggregation</h3>
                        <p class="text-secondary">Generate monthly reports and statistics</p>
                        <button class="btn btn-primary btn-block mt-3" onclick="Views.runAggregation()" ${!app.isOnline ? 'disabled title="Requires internet connection"' : ''}>
                            📊 Generate Monthly Reports
                        </button>
                    </div>

                    <div class="card mb-3">
                        <h3>Overview</h3>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin: 16px 0;">
                            <span>Total Synced Patient Records:</span>
                            <strong style="font-size: 18px; color: var(--accent-color);">${patientCount}</strong>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin: 16px 0;">
                            <span>Total Pending Patient Records:</span>
                            <strong style="font-size: 18px; color: ${pendingSyncCount > 0 ? 'var(--warning-color)' : 'var(--text-secondary)'};">${pendingSyncCount}</strong>
                        </div>
                    </div>

                    <div class="card">
                        <h3>Patient Records</h3>
                        <p class="text-secondary">View and manage all patient records</p>
                        <button class="btn btn-secondary btn-block mt-3" onclick="router.navigate('patients')">
                            View All Patient Records
                        </button>
                    </div>

                    ${pendingSyncCount > 0 ? `
                    <div class="card">
                        <h3>Storage Management</h3>
                        <p class="text-secondary">Manage local storage and pending records</p>
                        <div style="display: flex; gap: 10px; margin-top: 15px;">
                            <button class="btn btn-warning" onclick="Views.clearPendingRecords()" style="flex: 1;">
                                Clear Pending Records (${pendingSyncCount})
                            </button>
                            <button class="btn btn-danger" onclick="Views.clearAllLocalStorage()" style="flex: 1;">
                                Clear All Local Data
                            </button>
                        </div>
                    </div>
                    ` : ''}

                    <button class="fab" onclick="router.navigate('patient/new')">+</button>
                </div>
            `;
        },

        // Patient List with search functionality
        async renderPatientList() {
            // Get all patient records from both Supabase and localStorage
            let allRecords = [];
            
            // Get records from Supabase (synced records)
            if (app.supabase && app.currentUser && app.isOnline) {
                try {
                    const { data: supabaseRecords, error } = await app.supabase
                        .from('patient_records')
                        .select('*')
                        .eq('user_id', app.currentUser.id)
                        .order('created_at', { ascending: false });
                    
                    if (error) throw error;
                    
                    // Mark as synced and add to records
                    if (supabaseRecords) {
                        allRecords = supabaseRecords.map(record => ({
                            ...record,
                            isSynced: true,
                            source: 'supabase'
                        }));
                    }
                } catch (error) {
                    console.warn('Failed to fetch records from Supabase:', error);
                }
            }
            
            // Get records from localStorage (may include unsynced records)
            try {
                const localRecords = JSON.parse(localStorage.getItem('patient_records') || '[]');
                
                // Filter out records that are already in Supabase (avoid duplicates)
                const unsyncedLocalRecords = localRecords.filter(localRecord => {
                    // Check if this record exists in Supabase data
                    const existsInSupabase = allRecords.some(supabaseRecord => 
                        supabaseRecord.patient_identifier === localRecord.patient_identifier &&
                        supabaseRecord.appointment_date === localRecord.appointment_date
                    );
                    return !existsInSupabase;
                });
                
                // Mark unsynced records and add to list
                const unsyncedRecords = unsyncedLocalRecords.map(record => ({
                    ...record,
                    isSynced: false,
                    source: 'localStorage'
                }));
                
                allRecords = [...allRecords, ...unsyncedRecords];
            } catch (error) {
                console.warn('Failed to get local records:', error);
            }
            
            // Sort by created_at or date (most recent first)
            allRecords.sort((a, b) => {
                const dateA = new Date(a.created_at || a.appointment_date);
                const dateB = new Date(b.created_at || b.appointment_date);
                return dateB - dateA;
            });

            const recordsHtml = allRecords.length > 0 
                ? allRecords.map(record => this.renderPatientListItemHTML(record)).join('')
                : '<div class="empty-state">No patient records found.</div>';

            return `
                <div class="header">
                    <div class="nav">
                        <h1 class="header-title">Patient Records</h1>
                        <button class="btn" style="background: none; color: white;" onclick="Auth.signOut()">
                            Sign Out
                        </button>
                    </div>
                </div>
                <div class="container">
                    <div class="card mb-3">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                            <h3>Patient Records (${allRecords.length})</h3>
                            <button class="btn btn-primary" onclick="router.navigate('patient/new')">
                                + Add New Patient
                            </button>
                        </div>
                        <div class="form-group">
                            <input type="text" class="form-input" id="search-patients" 
                                   placeholder="Search by Patient ID..." />
                        </div>
                    </div>
                    
                    <div id="patient-list">
                        ${recordsHtml}
                    </div>
                    
                    <button class="fab" onclick="router.navigate('patient/new')">+</button>
                </div>
            `;
        },

        // Individual patient record HTML (for list items)
        renderPatientListItemHTML(record) {
            const syncStatusClass = record.isSynced ? 'synced' : 'pending';
            const syncStatusText = record.isSynced ? 'Synced' : 'Pending Sync';
            const syncIcon = record.isSynced ? '✓' : '⏳';
            
            // Format date
            const recordDate = new Date(record.created_at || record.appointment_date);
            const dateString = recordDate.toLocaleDateString() + ' at ' + recordDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            const recordId = record.id || record.local_id;
            
            return `
                <div class="list-item">
                    <div class="patient-header" onclick="PatientCRUD.viewPatient('${record.patient_identifier}', '${record.source}')" style="cursor: pointer; flex: 1;">
                        <div>
                            <h4>${record.patient_identifier || 'Unknown Patient'}</h4>
                            <p class="text-secondary">${record.facility || 'Unknown Facility'}</p>
                        </div>
                        <span class="sync-status ${syncStatusClass}">${syncIcon} ${syncStatusText}</span>
                    </div>
                    <p class="text-secondary" onclick="PatientCRUD.viewPatient('${record.patient_identifier}', '${record.source}')" style="cursor: pointer; flex: 1;">${dateString}</p>
                    <div class="list-item-actions">
                        <button class="btn btn-danger btn-sm" onclick="event.stopPropagation(); Views.quickDeletePatient('${recordId}', '${record.source}', '${record.patient_identifier}')" title="Delete patient record" style="padding: 8px; min-width: auto;">
                            🗑️
                        </button>
                    </div>
                </div>
            `;
        },

        // Utility method to show loading state
        showLoading(show = true) {
            const overlay = document.getElementById('loading-overlay');
            if (overlay) {
                if (show) {
                    overlay.classList.add('active');
                } else {
                    overlay.classList.remove('active');
                }
            }
        },

        // Utility method to show error messages
        showError(message, type = 'error') {
            // Create error toast or modal
            const errorDiv = document.createElement('div');
            errorDiv.className = `${type}-message`;
            const bgColor = type === 'success' ? 'var(--accent-color)' : 'var(--error-color)';
            errorDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${bgColor};
                color: white;
                padding: 16px;
                border-radius: 8px;
                z-index: 10000;
                max-width: 300px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            `;
            errorDiv.textContent = message;
            
            document.body.appendChild(errorDiv);
            
            // Auto-remove after 5 seconds
            setTimeout(() => {
                if (errorDiv.parentNode) {
                    errorDiv.parentNode.removeChild(errorDiv);
                }
            }, 5000);
        },

        // Utility method to show success messages
        showMessage(message, type = 'success') {
            const messageDiv = document.createElement('div');
            messageDiv.className = `${type}-message`;
            const bgColor = type === 'success' ? 'var(--accent-color)' : 'var(--info-color)';
            messageDiv.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${bgColor};
                color: white;
                padding: 16px;
                border-radius: 8px;
                z-index: 10000;
                max-width: 300px;
            `;
            messageDiv.textContent = message;
            
            document.body.appendChild(messageDiv);
            
            // Auto-remove after 3 seconds
            setTimeout(() => {
                if (messageDiv.parentNode) {
                    messageDiv.parentNode.removeChild(messageDiv);
                }
            }, 3000);
        },

        // Clear pending records from localStorage
        clearPendingRecords() {
            if (confirm('Are you sure you want to clear all pending patient records? This will remove records that haven\'t been synced to the server yet.')) {
                try {
                    const storageKey = window.Constants?.APP_SETTINGS?.STORAGE_KEYS?.PATIENT_RECORDS || Config.STORAGE_KEYS.PATIENT_RECORDS;
                    localStorage.removeItem(storageKey);
                    this.showMessage('Pending records cleared successfully');
                    
                    // Refresh the current view
                    setTimeout(() => {
                        Router.navigate('dashboard');
                    }, 1000);
                    
                } catch (error) {
                    console.error('Failed to clear pending records:', error);
                    this.showError('Failed to clear pending records');
                }
            }
        },

        // Clear all localStorage data
        clearAllLocalStorage() {
            if (confirm('Are you sure you want to clear ALL local data? This will remove all patient records, preferences, and settings stored locally. You will need to re-download your data from the server.')) {
                try {
                    // Clear specific keys instead of all localStorage to preserve auth
                    const constants = window.Constants?.APP_SETTINGS?.STORAGE_KEYS || {};
                    const keysToRemove = [
                        constants.PATIENT_RECORDS || Config.STORAGE_KEYS.PATIENT_RECORDS,
                        constants.SYNC_METADATA || Config.STORAGE_KEYS.SYNC_METADATA,
                        constants.USER_PREFERENCES || Config.STORAGE_KEYS.USER_PREFERENCES,
                        constants.APP_STATE || Config.STORAGE_KEYS.APP_STATE
                    ];
                    
                    keysToRemove.forEach(key => {
                        localStorage.removeItem(key);
                    });
                    
                    this.showMessage('All local data cleared successfully');
                    
                    // Refresh the current view
                    setTimeout(() => {
                        Router.navigate('dashboard');
                    }, 1000);
                    
                } catch (error) {
                    console.error('Failed to clear localStorage:', error);
                    this.showError('Failed to clear local data');
                }
            }
        },

        // Quick delete patient from list
        quickDeletePatient(recordId, source, patientIdentifier) {
            if (confirm(`Are you sure you want to delete patient "${patientIdentifier}"?\n\nThis action cannot be undone.`)) {
                // Use PatientCRUD to handle the actual deletion
                this.deletePatientRecord(recordId, source);
            }
        },

        // Delete patient record (called by quick delete)
        async deletePatientRecord(recordId, source) {
            try {
                const user = State.get('user');
                const supabase = State.get('supabase');
                
                // Delete from Supabase if it's a synced record
                if (supabase && user && source === 'supabase') {
                    try {
                        const { error } = await supabase
                            .from('patient_records')
                            .delete()
                            .eq('id', recordId)
                            .eq('user_id', user.id);
                        
                        if (error) throw error;
                        console.log('Patient deleted from Supabase');
                    } catch (error) {
                        console.warn('Supabase delete failed:', error);
                        // Continue to delete from localStorage
                    }
                }
                
                // Delete from localStorage
                this.deleteFromLocalStorage(recordId);
                
                this.showMessage('Patient record deleted successfully');
                
                // Refresh the patient list
                if (PatientList && PatientList.refresh) {
                    await PatientList.refresh();
                } else {
                    // Fallback: reload the current view
                    setTimeout(() => {
                        Router.navigate('patients');
                    }, 1000);
                }
                
            } catch (error) {
                console.error('Delete patient error:', error);
                this.showError('Failed to delete patient: ' + error.message);
            }
        },

        // Delete from localStorage helper
        deleteFromLocalStorage(recordId) {
            try {
                const storageKey = window.Constants?.APP_SETTINGS?.STORAGE_KEYS?.PATIENT_RECORDS || Config.STORAGE_KEYS.PATIENT_RECORDS;
                const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
                
                const filtered = existing.filter(r => 
                    r.id !== recordId && r.local_id !== recordId
                );
                
                localStorage.setItem(storageKey, JSON.stringify(filtered));
                console.log('Record deleted from localStorage');
                
            } catch (error) {
                console.error('Failed to delete from localStorage:', error);
            }
        },

        // Run data aggregation
        async runAggregation() {
            try {
                console.log('Running manual aggregation...');
                this.showLoading(true);
                
                if (!window.Aggregation) {
                    throw new Error('Aggregation module not available');
                }
                
                const result = await window.Aggregation.manualAggregation();
                
                if (result.success) {
                    this.showMessage(`Aggregation completed successfully! Processed ${result.aggregatedMonths} months with ${result.backendRecords} backend records and ${result.bookedNumbersRecords} booking records.`);
                } else {
                    throw new Error(result.message);
                }
                
            } catch (error) {
                console.error('Aggregation failed:', error);
                this.showError('Failed to run aggregation: ' + error.message);
            } finally {
                this.showLoading(false);
            }
        }
    };

    // Export to global scope
    window.Views = Views;

})(window);