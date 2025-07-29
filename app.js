// Hospital Stats MVP - Legacy Compatibility Layer
'use strict';

// Legacy global app state for backward compatibility
const app = {
    supabase: null,
    currentUser: null,
    currentRoute: null,
    syncQueue: [],
    isOnline: navigator.onLine
};

// Legacy functions that delegate to the main App module
async function signOut() {
    if (window.App && window.App.getSupabase()) {
        const supabase = window.App.getSupabase();
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            app.currentUser = null;
            if (window.Router) {
                window.Router.navigate('landing');
            }
        } catch (error) {
            console.error('Sign out error:', error);
            if (window.Views) {
                Views.showError('Failed to sign out');
            }
        }
    }
}

// Legacy event listener functions for forms
function attachEventListeners(viewName) {
    const handlers = {
        'patientForm': attachPatientFormListeners
    };

    const handler = handlers[viewName];
    if (handler) {
        handler();
    }
}

function attachPatientFormListeners() {
    const patientForm = document.getElementById('patient-form');
    if (!patientForm) return;

    patientForm.addEventListener('submit', handlePatientForm);
    setupPatientFormValidation();
}

function setupPatientFormValidation() {
    const patientId = document.getElementById('patient-identifier');
    const appointmentDate = document.getElementById('appointment-date');
    const duration = document.getElementById('duration-minutes');

    if (patientId && window.Validation) {
        patientId.addEventListener('input', Validation.validatePatientIdField);
    }

    if (appointmentDate && window.Validation) {
        appointmentDate.addEventListener('input', Validation.validateDateField);
    }

    if (duration && window.Validation) {
        duration.addEventListener('input', Validation.validateDurationField);
    }
}

async function handlePatientForm(event) {
    event.preventDefault();
    
    try {
        if (window.PatientCRUD) {
            await PatientCRUD.handleFormSubmission(event.target);
        }
    } catch (error) {
        console.error('Patient form submission error:', error);
        if (window.Views) {
            Views.showError('Failed to save patient record');
        }
    }
}

// Online/offline detection
window.addEventListener('online', () => {
    app.isOnline = true;
    console.log('App is online');
    if (window.State) {
        State.set('isOnline', true);
    }
    if (window.Sync) {
        Sync.attemptSync();
    }
});

window.addEventListener('offline', () => {
    app.isOnline = false;
    console.log('App is offline');
    if (window.State) {
        State.set('isOnline', false);
    }
});

// Export global functions for legacy compatibility
window.app = app;
window.signOut = signOut;

// Manual signout function for testing
window.manualSignOut = async function() {
    console.log('Manual signout requested');
    try {
        if (window.Auth) {
            await window.Auth.signOut();
        } else {
            await signOut();
        }
        alert('Signed out successfully! You can now test login/register forms.');
    } catch (error) {
        console.error('Manual signout error:', error);
        alert('Signout error: ' + error.message);
    }
};

console.log('Legacy compatibility layer loaded');