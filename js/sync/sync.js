// Hospital Stats MVP - Sync Module
(function(window) {
    'use strict';
    
    const Sync = {
        // Module state
        isSyncing: false,
        isOnline: navigator.onLine,
        autoSyncEnabled: true,
        autoSyncInterval: null,
        
        // Initialize the module
        init() {
            console.log('Sync module initializing...');
            this.setupNetworkListeners();
            this.startAutoSync();
        },
        
        // Setup network connectivity listeners
        setupNetworkListeners() {
            // Enhanced network detection for better accuracy
            const checkNetworkStatus = async () => {
                try {
                    // Try to fetch a small resource to verify actual connectivity
                    const response = await fetch('/manifest.json', { 
                        method: 'HEAD',
                        cache: 'no-store'
                    });
                    return response.ok;
                } catch {
                    // If we can't fetch local resources, check navigator.onLine
                    return navigator.onLine;
                }
            };
            
            window.addEventListener('online', async () => {
                // Verify actual connectivity before updating status
                const isActuallyOnline = await checkNetworkStatus();
                if (isActuallyOnline) {
                    console.log('Network connection restored');
                    this.isOnline = true;
                    State.set('isOnline', true);
                    
                    // Auto-sync when coming back online
                    if (this.autoSyncEnabled) {
                        setTimeout(() => {
                            this.syncPatientRecords();
                        }, 1000); // Wait 1 second after connection restored
                    }
                }
            });
            
            window.addEventListener('offline', () => {
                console.log('Network connection lost');
                this.isOnline = false;
                State.set('isOnline', false);
            });
            
            // Update initial state with actual network check
            checkNetworkStatus().then(isOnline => {
                this.isOnline = isOnline;
                State.set('isOnline', isOnline);
            });
        },
        
        // Start auto-sync interval
        startAutoSync() {
            if (this.autoSyncInterval) {
                clearInterval(this.autoSyncInterval);
            }
            
            // Auto-sync every 5 minutes when online
            this.autoSyncInterval = setInterval(() => {
                if (this.isOnline && this.autoSyncEnabled && !this.isSyncing) {
                    console.log('Auto-sync triggered');
                    this.syncPatientRecords();
                }
            }, 5 * 60 * 1000); // 5 minutes
            
            console.log('Auto-sync started (every 5 minutes)');
        },
        
        // Stop auto-sync
        stopAutoSync() {
            if (this.autoSyncInterval) {
                clearInterval(this.autoSyncInterval);
                this.autoSyncInterval = null;
                console.log('Auto-sync stopped');
            }
        },
        
        // Main sync function
        async syncPatientRecords() {
            if (this.isSyncing) {
                console.log('Sync already in progress, skipping');
                return { success: false, message: 'Sync already in progress' };
            }
            
            if (!this.isOnline) {
                console.log('Cannot sync - offline');
                return { success: false, message: 'No internet connection' };
            }
            
            const supabase = State.get('supabase');
            const user = State.get('user');
            
            if (!supabase || !user) {
                console.log('Cannot sync - no database connection or user');
                return { success: false, message: 'Not authenticated or database unavailable' };
            }
            
            console.log('Starting patient records sync...');
            this.isSyncing = true;
            State.set('isSyncing', true);
            
            try {
                const syncQueue = Storage.getSyncQueue();
                console.log('Records to sync:', syncQueue.length);
                
                if (syncQueue.length === 0) {
                    console.log('No records to sync');
                    Storage.updateSyncMetadata(0, 0);
                    return { success: true, message: 'No records to sync' };
                }
                
                const results = {
                    syncedCount: 0,
                    failedCount: 0,
                    failedRecords: [],
                    successfulRecords: []
                };
                
                // Process each record in the sync queue
                for (const recordId of syncQueue) {
                    try {
                        const result = await this.syncSingleRecord(recordId, user.id);
                        
                        if (result.success) {
                            results.syncedCount++;
                            results.successfulRecords.push(recordId);
                        } else {
                            results.failedCount++;
                            results.failedRecords.push({
                                id: recordId,
                                error: result.error
                            });
                        }
                        
                    } catch (error) {
                        console.error(`Failed to sync record ${recordId}:`, error);
                        results.failedCount++;
                        results.failedRecords.push({
                            id: recordId,
                            error: error.message
                        });
                    }
                }
                
                // Update sync queue (remove successfully synced records)
                if (results.successfulRecords.length > 0) {
                    Storage.updateSyncQueue(results.successfulRecords);
                }
                
                // Update sync metadata
                Storage.updateSyncMetadata(results.syncedCount, results.failedCount);
                
                console.log(`Sync completed: ${results.syncedCount} synced, ${results.failedCount} failed`);
                
                // Trigger aggregation if sync was successful
                if (results.syncedCount > 0 && window.Aggregation) {
                    console.log('Triggering aggregation after successful sync...');
                    window.Aggregation.triggerAggregationAfterSync(user.id);
                }
                
                return {
                    success: true,
                    message: `Synced ${results.syncedCount} records${results.failedCount > 0 ? `, ${results.failedCount} failed` : ''}`,
                    ...results
                };
                
            } catch (error) {
                console.error('Sync process failed:', error);
                return {
                    success: false,
                    message: 'Sync failed: ' + error.message
                };
                
            } finally {
                this.isSyncing = false;
                State.set('isSyncing', false);
            }
        },
        
        // Sync a single patient record
        async syncSingleRecord(recordId, userId) {
            try {
                const record = Storage.getPatientRecord(recordId);
                if (!record) {
                    throw new Error(`Record ${recordId} not found in local storage`);
                }
                
                console.log('Syncing record:', recordId);
                
                // Prepare data for Supabase (remove local-only fields)
                const supabaseData = this.prepareRecordForSupabase(record, userId);
                
                let result;
                
                if (record.id && record.id !== record.local_id) {
                    // Update existing record in Supabase
                    result = await this.updateRecordInSupabase(record.id, supabaseData);
                } else {
                    // Create new record in Supabase
                    result = await this.createRecordInSupabase(supabaseData);
                }
                
                if (result.success) {
                    // Mark record as synced in local storage
                    Storage.markRecordAsSynced(record.local_id, result.data?.id);
                    console.log('Record synced successfully:', recordId);
                }
                
                return result;
                
            } catch (error) {
                console.error(`Failed to sync record ${recordId}:`, error);
                return {
                    success: false,
                    error: error.message
                };
            }
        },
        
        // Prepare record data for Supabase insertion/update
        prepareRecordForSupabase(record, userId) {
            const data = { ...record };
            
            // Remove local-only fields
            delete data.local_id;
            delete data.synced;
            delete data.synced_at;
            delete data.source;
            
            // Ensure user_id is set
            data.user_id = userId;
            
            // Ensure required timestamps
            if (!data.created_at) {
                data.created_at = new Date().toISOString();
            }
            data.updated_at = new Date().toISOString();
            
            return data;
        },
        
        // Create new record in Supabase
        async createRecordInSupabase(data) {
            try {
                const supabase = State.get('supabase');
                
                const { data: insertedData, error } = await supabase
                    .from('patient_records')
                    .insert([data])
                    .select()
                    .single();
                
                if (error) throw error;
                
                return {
                    success: true,
                    data: insertedData
                };
                
            } catch (error) {
                console.error('Failed to create record in Supabase:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        },
        
        // Update existing record in Supabase
        async updateRecordInSupabase(id, data) {
            try {
                const supabase = State.get('supabase');
                
                const { data: updatedData, error } = await supabase
                    .from('patient_records')
                    .update(data)
                    .eq('id', id)
                    .select()
                    .single();
                
                if (error) throw error;
                
                return {
                    success: true,
                    data: updatedData
                };
                
            } catch (error) {
                console.error('Failed to update record in Supabase:', error);
                return {
                    success: false,
                    error: error.message
                };
            }
        },
        
        // Force sync all records (including already synced ones)
        async forceSyncAll() {
            console.log('Force syncing all unsynced records...');
            
            try {
                // Get all unsynced records
                const allRecords = Storage.getPatientRecords();
                const unsyncedRecords = allRecords.filter(record => !record.synced);
                
                if (unsyncedRecords.length === 0) {
                    return {
                        success: true,
                        message: 'No unsynced records found'
                    };
                }
                
                // Add all unsynced records to sync queue
                const syncQueue = Storage.getSyncQueue();
                unsyncedRecords.forEach(record => {
                    if (!syncQueue.includes(record.local_id)) {
                        Storage.addToSyncQueue(record.local_id);
                    }
                });
                
                // Run normal sync process
                return await this.syncPatientRecords();
                
            } catch (error) {
                console.error('Force sync failed:', error);
                return {
                    success: false,
                    message: 'Force sync failed: ' + error.message
                };
            }
        },
        
        // Delete record from both local and remote storage
        async deleteRecord(recordId, source = 'auto') {
            try {
                const supabase = State.get('supabase');
                const user = State.get('user');
                
                let deleted = false;
                
                // Delete from Supabase if online and authenticated
                if (this.isOnline && supabase && user && source !== 'localStorage') {
                    try {
                        const { error } = await supabase
                            .from('patient_records')
                            .delete()
                            .eq('id', recordId)
                            .eq('user_id', user.id);
                        
                        if (error) {
                            console.warn('Failed to delete from Supabase:', error);
                        } else {
                            console.log('Record deleted from Supabase:', recordId);
                            deleted = true;
                        }
                        
                    } catch (error) {
                        console.warn('Supabase delete failed:', error);
                    }
                }
                
                // Delete from local storage
                const localDeleted = Storage.deletePatientRecord(recordId);
                
                if (localDeleted || deleted) {
                    console.log('Record deleted successfully:', recordId);
                    return {
                        success: true,
                        message: 'Record deleted successfully'
                    };
                } else {
                    return {
                        success: false,
                        message: 'Record not found'
                    };
                }
                
            } catch (error) {
                console.error('Failed to delete record:', error);
                return {
                    success: false,
                    message: 'Delete failed: ' + error.message
                };
            }
        },
        
        // Get sync status information
        getSyncStatus() {
            const storageStats = Storage.getStorageStats();
            const metadata = Storage.getSyncMetadata();
            
            return {
                isOnline: this.isOnline,
                isSyncing: this.isSyncing,
                autoSyncEnabled: this.autoSyncEnabled,
                totalRecords: storageStats.totalRecords,
                syncedRecords: storageStats.syncedRecords,
                pendingSync: storageStats.pendingSync,
                lastSync: metadata.lastSync,
                lastSyncedCount: metadata.lastSyncedCount,
                lastFailedCount: metadata.lastFailedCount,
                totalSynced: metadata.totalSynced
            };
        },
        
        // Enable/disable auto-sync
        setAutoSync(enabled) {
            this.autoSyncEnabled = enabled;
            
            if (enabled) {
                this.startAutoSync();
                console.log('Auto-sync enabled');
            } else {
                this.stopAutoSync();
                console.log('Auto-sync disabled');
            }
        },
        
        // Get pending sync count
        getPendingSyncCount() {
            return Storage.getSyncQueue().length;
        },
        
        // Clear sync queue (for testing/debugging)
        clearSyncQueue() {
            Storage.clearSyncQueue();
            console.log('Sync queue cleared');
        },
        
        // Manual sync trigger (for UI buttons)
        async manualSync() {
            if (!this.isOnline) {
                throw new Error('Cannot sync while offline');
            }
            
            console.log('Manual sync triggered');
            return await this.syncPatientRecords();
        }
    };
    
    // Export to global scope
    window.Sync = Sync;
    
    // Auto-initialize when module loads
    Sync.init();
    
    console.log('Sync module loaded');
    
})(window);