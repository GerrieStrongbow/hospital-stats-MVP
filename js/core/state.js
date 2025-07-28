// Hospital Stats MVP - Central State Management
(function(window) {
    'use strict';
    
    const State = {
        // Application state
        data: {
            user: null,
            currentView: 'landing',
            patientRecords: [],
            syncStatus: {
                lastSync: null,
                pending: 0,
                synced: 0
            },
            currentPatientData: null,
            currentPatientId: null
        },
        
        // Subscribers for state changes
        subscribers: {},
        
        /**
         * Retrieves a value from the application state
         * @param {string} key - The state key to retrieve
         * @returns {*} The stored value, or undefined if key doesn't exist
         * @example
         * const user = State.get('user');
         * const currentView = State.get('currentView');
         */
        get(key) {
            return this.data[key];
        },
        
        /**
         * Stores a value in the application state and notifies subscribers
         * @param {string} key - The state key to store
         * @param {*} value - The value to store
         * @example
         * State.set('user', userObject);
         * State.set('currentView', 'dashboard');
         */
        set(key, value) {
            const oldValue = this.data[key];
            this.data[key] = value;
            
            // Notify subscribers if value changed
            if (oldValue !== value) {
                this.notify(key, value, oldValue);
            }
        },
        
        // Update nested state (e.g., syncStatus.pending)
        update(keyPath, value) {
            const keys = keyPath.split('.');
            let current = this.data;
            
            // Navigate to parent object
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) {
                    current[keys[i]] = {};
                }
                current = current[keys[i]];
            }
            
            const lastKey = keys[keys.length - 1];
            const oldValue = current[lastKey];
            current[lastKey] = value;
            
            // Notify subscribers
            if (oldValue !== value) {
                this.notify(keyPath, value, oldValue);
            }
        },
        
        // Subscribe to state changes
        subscribe(key, callback) {
            if (!this.subscribers[key]) {
                this.subscribers[key] = [];
            }
            this.subscribers[key].push(callback);
            
            // Return unsubscribe function
            return () => {
                const index = this.subscribers[key].indexOf(callback);
                if (index > -1) {
                    this.subscribers[key].splice(index, 1);
                }
            };
        },
        
        // Notify subscribers of state changes
        notify(key, newValue, oldValue) {
            if (this.subscribers[key]) {
                this.subscribers[key].forEach(callback => {
                    try {
                        callback(newValue, oldValue, key);
                    } catch (error) {
                        console.error('State subscriber error:', error);
                    }
                });
            }
        },
        
        // Reset all state (useful for logout)
        reset() {
            this.data = {
                user: null,
                currentView: 'landing',
                patientRecords: [],
                syncStatus: {
                    lastSync: null,
                    pending: 0,
                    synced: 0
                },
                currentPatientData: null,
                currentPatientId: null
            };
            
            // Notify all subscribers of reset
            Object.keys(this.subscribers).forEach(key => {
                this.notify(key, this.data[key], undefined);
            });
        },
        
        // Debug helper
        getState() {
            return { ...this.data };
        }
    };
    
    // Export to global scope
    window.State = State;
    
    // Debug info
    console.log('State module loaded');
    
})(window);