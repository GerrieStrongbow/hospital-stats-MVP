// Hospital Stats MVP - Storage Module
(function(window) {
    'use strict';
    
    const Storage = {
        // Storage keys
        KEYS: {
            PATIENT_RECORDS: 'patient_records',
            SYNC_QUEUE: 'sync_queue',
            SYNC_METADATA: 'sync_metadata',
            USER_SETTINGS: 'user_settings'
        },
        
        // Initialize the module
        init() {
            console.log('Storage module initializing...');
            this.initializeStorage();
        },
        
        // Initialize localStorage structure
        initializeStorage() {
            try {
                // Initialize patient records if not exists
                if (!localStorage.getItem(this.KEYS.PATIENT_RECORDS)) {
                    localStorage.setItem(this.KEYS.PATIENT_RECORDS, JSON.stringify([]));
                }
                
                // Initialize sync queue if not exists
                if (!localStorage.getItem(this.KEYS.SYNC_QUEUE)) {
                    localStorage.setItem(this.KEYS.SYNC_QUEUE, JSON.stringify([]));
                }
                
                // Initialize sync metadata if not exists
                if (!localStorage.getItem(this.KEYS.SYNC_METADATA)) {
                    this.updateSyncMetadata(0, 0);
                }
                
                console.log('Storage initialized successfully');
                
            } catch (error) {
                console.error('Failed to initialize storage:', error);
            }
        },
        
        // Patient Records Management
        
        // Save patient record to localStorage
        savePatientRecord(patientData) {
            try {
                const existingRecords = this.getPatientRecords();
                
                const recordToSave = {
                    ...patientData,
                    local_id: patientData.local_id || this.generateLocalId(),
                    created_at: patientData.created_at || new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                    synced: patientData.synced || false
                };
                
                existingRecords.push(recordToSave);
                localStorage.setItem(this.KEYS.PATIENT_RECORDS, JSON.stringify(existingRecords));
                
                // Add to sync queue if not synced
                if (!recordToSave.synced) {
                    this.addToSyncQueue(recordToSave.local_id);
                }
                
                console.log('Patient record saved to localStorage:', recordToSave.local_id);
                return recordToSave;
                
            } catch (error) {
                console.error('Failed to save patient record to localStorage:', error);
                throw error;
            }
        },
        
        // Update existing patient record in localStorage
        updatePatientRecord(localId, updatedData) {
            try {
                const existingRecords = this.getPatientRecords();
                const recordIndex = existingRecords.findIndex(record => 
                    record.local_id === localId || record.id === localId
                );
                
                if (recordIndex === -1) {
                    throw new Error(`Patient record with ID ${localId} not found`);
                }
                
                // Update the record
                existingRecords[recordIndex] = {
                    ...existingRecords[recordIndex],
                    ...updatedData,
                    updated_at: new Date().toISOString(),
                    synced: false // Mark as needing sync after update
                };
                
                localStorage.setItem(this.KEYS.PATIENT_RECORDS, JSON.stringify(existingRecords));
                
                // Add to sync queue
                this.addToSyncQueue(existingRecords[recordIndex].local_id);
                
                console.log('Patient record updated in localStorage:', localId);
                return existingRecords[recordIndex];
                
            } catch (error) {
                console.error('Failed to update patient record in localStorage:', error);
                throw error;
            }
        },
        
        // Delete patient record from localStorage
        deletePatientRecord(recordId) {
            try {
                const existingRecords = this.getPatientRecords();
                const filteredRecords = existingRecords.filter(record => 
                    record.local_id !== recordId && record.id !== recordId
                );
                
                if (filteredRecords.length === existingRecords.length) {
                    console.warn(`Patient record with ID ${recordId} not found for deletion`);
                    return false;
                }
                
                localStorage.setItem(this.KEYS.PATIENT_RECORDS, JSON.stringify(filteredRecords));
                
                // Remove from sync queue as well
                this.removeFromSyncQueue(recordId);
                
                console.log('Patient record deleted from localStorage:', recordId);
                return true;
                
            } catch (error) {
                console.error('Failed to delete patient record from localStorage:', error);
                throw error;
            }
        },
        
        // Get all patient records from localStorage
        getPatientRecords() {
            try {
                const records = JSON.parse(localStorage.getItem(this.KEYS.PATIENT_RECORDS) || '[]');
                return Array.isArray(records) ? records : [];
                
            } catch (error) {
                console.error('Failed to get patient records from localStorage:', error);
                return [];
            }
        },
        
        // Get specific patient record by ID
        getPatientRecord(recordId) {
            try {
                const records = this.getPatientRecords();
                return records.find(record => 
                    record.local_id === recordId || record.id === recordId
                );
                
            } catch (error) {
                console.error('Failed to get patient record from localStorage:', error);
                return null;
            }
        },
        
        // Find patient records by criteria
        findPatientRecords(criteria) {
            try {
                const records = this.getPatientRecords();
                
                return records.filter(record => {
                    return Object.keys(criteria).every(key => {
                        if (criteria[key] === null || criteria[key] === undefined) {
                            return true;
                        }
                        return record[key] === criteria[key];
                    });
                });
                
            } catch (error) {
                console.error('Failed to find patient records:', error);
                return [];
            }
        },
        
        // Sync Queue Management
        
        // Add record ID to sync queue
        addToSyncQueue(recordId) {
            try {
                const syncQueue = this.getSyncQueue();
                
                if (!syncQueue.includes(recordId)) {
                    syncQueue.push(recordId);
                    localStorage.setItem(this.KEYS.SYNC_QUEUE, JSON.stringify(syncQueue));
                    console.log('Added to sync queue:', recordId);
                }
                
            } catch (error) {
                console.error('Failed to add to sync queue:', error);
            }
        },
        
        // Remove record ID from sync queue
        removeFromSyncQueue(recordId) {
            try {
                const syncQueue = this.getSyncQueue();
                const filteredQueue = syncQueue.filter(id => id !== recordId);
                
                localStorage.setItem(this.KEYS.SYNC_QUEUE, JSON.stringify(filteredQueue));
                console.log('Removed from sync queue:', recordId);
                
            } catch (error) {
                console.error('Failed to remove from sync queue:', error);
            }
        },
        
        // Get sync queue
        getSyncQueue() {
            try {
                const queue = JSON.parse(localStorage.getItem(this.KEYS.SYNC_QUEUE) || '[]');
                return Array.isArray(queue) ? queue : [];
                
            } catch (error) {
                console.error('Failed to get sync queue:', error);
                return [];
            }
        },
        
        // Clear sync queue
        clearSyncQueue() {
            try {
                localStorage.setItem(this.KEYS.SYNC_QUEUE, JSON.stringify([]));
                console.log('Sync queue cleared');
                
            } catch (error) {
                console.error('Failed to clear sync queue:', error);
            }
        },
        
        // Update sync queue (remove successfully synced records)
        updateSyncQueue(syncedRecordIds) {
            try {
                const currentQueue = this.getSyncQueue();
                const newQueue = currentQueue.filter(id => !syncedRecordIds.includes(id));
                
                localStorage.setItem(this.KEYS.SYNC_QUEUE, JSON.stringify(newQueue));
                console.log('Sync queue updated, removed:', syncedRecordIds.length, 'records');
                
            } catch (error) {
                console.error('Failed to update sync queue:', error);
            }
        },
        
        // Sync Metadata Management
        
        // Get sync metadata
        getSyncMetadata() {
            try {
                const metadata = JSON.parse(localStorage.getItem(this.KEYS.SYNC_METADATA) || '{}');
                return {
                    lastSync: null,
                    lastSyncedCount: 0,
                    lastFailedCount: 0,
                    totalSynced: 0,
                    ...metadata
                };
                
            } catch (error) {
                console.error('Failed to get sync metadata:', error);
                return {
                    lastSync: null,
                    lastSyncedCount: 0,
                    lastFailedCount: 0,
                    totalSynced: 0
                };
            }
        },
        
        // Update sync metadata
        updateSyncMetadata(syncedCount = 0, failedCount = 0) {
            try {
                const currentMetadata = this.getSyncMetadata();
                
                const metadata = {
                    ...currentMetadata,
                    lastSync: new Date().toISOString(),
                    lastSyncedCount: syncedCount,
                    lastFailedCount: failedCount,
                    totalSynced: (currentMetadata.totalSynced || 0) + syncedCount
                };
                
                localStorage.setItem(this.KEYS.SYNC_METADATA, JSON.stringify(metadata));
                console.log('Sync metadata updated:', metadata);
                
            } catch (error) {
                console.error('Failed to update sync metadata:', error);
            }
        },
        
        // Utility Functions
        
        // Generate unique local ID
        generateLocalId() {
            return 'local_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },
        
        // Get storage usage statistics
        getStorageStats() {
            try {
                const patientRecords = this.getPatientRecords();
                const syncQueue = this.getSyncQueue();
                const metadata = this.getSyncMetadata();
                
                return {
                    totalRecords: patientRecords.length,
                    pendingSync: syncQueue.length,
                    syncedRecords: patientRecords.filter(r => r.synced).length,
                    unsyncedRecords: patientRecords.filter(r => !r.synced).length,
                    lastSync: metadata.lastSync,
                    totalSynced: metadata.totalSynced || 0
                };
                
            } catch (error) {
                console.error('Failed to get storage stats:', error);
                return {
                    totalRecords: 0,
                    pendingSync: 0,
                    syncedRecords: 0,
                    unsyncedRecords: 0,
                    lastSync: null,
                    totalSynced: 0
                };
            }
        },
        
        // Clear all patient data (useful for testing or reset)
        clearAllPatientData() {
            try {
                localStorage.removeItem(this.KEYS.PATIENT_RECORDS);
                localStorage.removeItem(this.KEYS.SYNC_QUEUE);
                localStorage.removeItem(this.KEYS.SYNC_METADATA);
                
                this.initializeStorage();
                console.log('All patient data cleared');
                
            } catch (error) {
                console.error('Failed to clear patient data:', error);
            }
        },
        
        // Mark record as synced
        markRecordAsSynced(localId, supabaseId = null) {
            try {
                const records = this.getPatientRecords();
                const recordIndex = records.findIndex(r => r.local_id === localId);
                
                if (recordIndex !== -1) {
                    records[recordIndex].synced = true;
                    records[recordIndex].synced_at = new Date().toISOString();
                    
                    if (supabaseId) {
                        records[recordIndex].id = supabaseId;
                    }
                    
                    localStorage.setItem(this.KEYS.PATIENT_RECORDS, JSON.stringify(records));
                    this.removeFromSyncQueue(localId);
                    
                    console.log('Record marked as synced:', localId);
                }
                
            } catch (error) {
                console.error('Failed to mark record as synced:', error);
            }
        },
        
        // Get total patient count from Supabase (with localStorage fallback)
        async getPatientCount() {
            const user = State.get('user');
            const supabase = State.get('supabase');
            const isOnline = State.get('isOnline');
            
            if (supabase && user && isOnline) {
                try {
                    const { count, error } = await supabase
                        .from('patient_records')
                        .select('*', { count: 'exact', head: true })
                        .eq('user_id', user.id);

                    if (error) throw error;
                    return count || 0;
                } catch (error) {
                    console.warn('Failed to get patient count from Supabase:', error);
                    // Fall back to localStorage count
                }
            }

            // Fallback to localStorage count (for offline or error cases)
            try {
                const records = this.getPatientRecords();
                return records.length;
            } catch {
                return 0;
            }
        },

        // Get pending sync count
        getPendingSyncCount() {
            try {
                const syncQueue = this.getSyncQueue();
                return syncQueue.length;
            } catch {
                return 0;
            }
        },

        // Check localStorage availability
        isAvailable() {
            try {
                const testKey = 'storage_test';
                localStorage.setItem(testKey, 'test');
                localStorage.removeItem(testKey);
                return true;
                
            } catch (error) {
                console.error('localStorage not available:', error);
                return false;
            }
        }
    };
    
    // Export to global scope
    window.Storage = Storage;
    
    // Auto-initialize when module loads
    Storage.init();
    
    console.log('Storage module loaded');
    
})(window);