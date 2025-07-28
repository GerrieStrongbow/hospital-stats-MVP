/**
 * Constants Module
 * Application constants and configuration values
 */
(function(window) {
    'use strict';

    const Constants = {
        // Sub-districts for user registration
        SUB_DISTRICTS: [
            'Breede Valley',
            'Drakenstein',
            'Langeberg',
            'Stellenbosch',
            'Witzenberg'
        ],

        // Therapist types for user registration
        THERAPIST_TYPES: [
            'Physiotherapist',
            'Occupational Therapist',
            'Speech Therapist',
            'Audiologist'
        ],

        // Employment statuses for user registration
        EMPLOYMENT_STATUSES: [
            { value: 'full-time', label: 'Full-time' },
            { value: 'community-service', label: 'Community Service' },
            { value: 'student', label: 'Student' }
        ],

        // PHC Facilities by sub-district (from CWD_Therapists_2025.md)
        PHC_FACILITIES: {
            'Breede Valley': [
                'Avian Park Clinic',
                'De Doorns Clinic', 
                'Empilisweni Clinic',
                'Touwsriver',
                'Rawsonville Clinic',
                'Worcester CDC',
                'Sandhills & Orchards (Patients currently seen at Worcester CDC)'
            ],
            'Drakenstein': [
                'TC Newman CDC',
                'Wellington CDC',
                'Simondium Clinic',
                'Klein Drakenstein Clinic',
                'Gouda Clinic',
                'Saron Clinic',
                'Milani Care Centre'
            ],
            'Langeberg': [
                'Nkqubela Clinic',
                'Montagu Primary Healthcare',
                'Bonnievale-Happy Valley Clinic',
                'Zolani Clinic'
            ],
            'Stellenbosch': [
                'Aan-het-Pad Clinic',
                'Groendal Clinic',
                'Kylemore Clinic',
                'Cloetesville CDC',
                'Don & Pat Bilton Clinic',
                'Klapmuts Clinic'
            ],
            'Witzenberg': [
                'Breë Rivier Clinic',
                'Ceres PHC',
                'Prince Alfred\'s Hamlet',
                'Tulbagh Clinic',
                'Bella Vista Clinic',
                'Nduli Clinic',
                'Op die Berg Clinic',
                'Montana Clinic'
            ]
        },

        // Activities available for patient therapy (from requirements)
        ACTIVITIES: [
            'Screen',
            'Assessment',
            'Assessment: Mobility Assistive Devices',
            'Assessment: Wheelchair',
            'Assessment: Standardised',
            'Assessment: Vocation/Work',
            'Construct Assistive Device/Functional Adaptation',
            'Counseling',
            'Education And Recommendations',
            'Home Programme Issued',
            'Home Visit',
            'Mobility Device: Service',
            'Mobility Device: Training',
            'Mobility Device: Adjust',
            'Patient Referral',
            'Splint: Adjust',
            'Splint: Construct',
            'Telephonic Consultation',
            'Treatment: Occupation Based Intervention',
            'Treatment: Purposeful Activity',
            'Treatment: ADL Training'
        ],

        // Assistive devices (must match requirements specification)
        ASSISTIVE_DEVICES: [
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
        ],

        // Duration options for therapy sessions
        DURATION_OPTIONS: [
            '15 minutes',
            '30 minutes',
            '45 minutes',
            '1 hour',
            '1.5 hours',
            '2 hours',
            '2.5 hours',
            '3 hours',
            'Half day (4 hours)',
            'Full day (8 hours)'
        ],

        // Patient age groups
        // Age groups for patient records (must match database constraint)
        AGE_GROUPS: [
            { value: '<18', label: '< 18' },
            { value: '>18', label: '> 18' }
        ],

        // Referral sources (must match database constraint)
        REFERRAL_SOURCES: [
            { value: 'hospital', label: 'Hospital' },
            { value: 'phc', label: 'Primary Health Care (PHC)' },
            { value: 'cbs', label: 'Community Based Service (CBS)' },
            { value: 'other', label: 'Other (specify below)' }
        ],

        // Appointment types (must match database constraint)
        APPOINTMENT_TYPES: [
            { value: 'new', label: 'New' },
            { value: 'repeat', label: 'Repeat' }
        ],

        // Facility types (must match database constraint)
        FACILITY_TYPES: [
            { value: 'in-hospital', label: 'In-hospital' },
            { value: 'out-hospital', label: 'Out-hospital' },
            { value: 'icf', label: 'Intermediate Care Facility (ICF)' },
            { value: 'phc', label: 'Primary Health Care (PHC)' }
        ],

        // Clinical areas (from requirements)
        CLINICAL_AREAS: [
            'General Medicine',
            'General Outpatient',
            'General Surgery',
            'Neurology',
            'Orthopaedics',
            'Paediatrics',
            'To Be Determined',
            'Other (specify below)'
        ],

        // Attendance options (from requirements)
        ATTENDANCE_OPTIONS: [
            'Attended',
            'Attended Not Treated',
            'Cancelled On Day',
            'Rescheduled',
            'Attended Without Appointment (Walk-in)',
            'Did Not Attend (DNA)'
        ],

        // Disposal options (from requirements)
        DISPOSAL_OPTIONS: [
            'Discharged: End Of Episode',
            'Future Appointment Given',
            'DNA: Future Appointment Given',
            'DNA: Discharge End Of Episode',
            'Treatment Suspended'
        ],

        // Outcome options (from requirements)
        OUTCOME_OPTIONS: [
            'Assessment Completed',
            'Deterioration In Function',
            'No Improvement In Function',
            'Noticeable Improvement In Function',
            'Slight Improvement In Function'
        ],

        // Session types
        SESSION_TYPES: [
            'Assessment',
            'Individual therapy',
            'Group therapy',
            'Home visit',
            'Family training',
            'Equipment trial',
            'Follow-up',
            'Discharge planning'
        ],

        // Patient conditions/diagnoses (common ones)
        COMMON_CONDITIONS: [
            'Stroke',
            'Brain injury',
            'Spinal cord injury',
            'Arthritis',
            'Fractures',
            'Amputation',
            'Mental health conditions',
            'Developmental delays',
            'Autism spectrum disorder',
            'Cerebral palsy',
            'Multiple sclerosis',
            'Parkinson\'s disease',
            'Other neurological',
            'Other musculoskeletal',
            'Other'
        ],

        // Application settings
        APP_SETTINGS: {
            // Sync settings
            SYNC_INTERVAL: 5 * 60 * 1000, // 5 minutes in milliseconds
            MAX_RETRY_ATTEMPTS: 3,
            RETRY_DELAY: 2000, // 2 seconds

            // Local storage keys
            STORAGE_KEYS: {
                PATIENT_RECORDS: 'patient_records',
                SYNC_METADATA: 'sync_metadata',
                USER_PREFERENCES: 'user_preferences',
                APP_STATE: 'app_state'
            },

            // Validation rules
            VALIDATION: {
                PATIENT_ID_MIN_LENGTH: 3,
                PATIENT_ID_MAX_LENGTH: 20,
                MIN_SESSION_DURATION: 15, // minutes
                MAX_SESSION_DURATION: 480, // 8 hours in minutes
                EMAIL_DOMAIN_REQUIRED: '@westerncape.gov.za'
            },

            // UI settings
            UI: {
                TOAST_DURATION: 3000, // 3 seconds
                ERROR_DURATION: 5000, // 5 seconds
                DEBOUNCE_DELAY: 300, // 300ms for search
                PAGE_SIZE: 50, // records per page
                NAVIGATION_DELAY: 1500, // 1.5 seconds after save/delete
                LOADING_DELAY: 100, // 100ms for UI rendering
                SYNC_NOTIFICATION_DELAY: 1000, // 1 second after coming online
                AUTH_CHECK_INTERVAL: 100 // 100ms for auth initialization check
            }
        },

        // Error messages
        ERROR_MESSAGES: {
            NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
            AUTH_ERROR: 'Authentication failed. Please check your credentials.',
            VALIDATION_ERROR: 'Please check your input and try again.',
            SAVE_ERROR: 'Failed to save data. Please try again.',
            LOAD_ERROR: 'Failed to load data. Please refresh the page.',
            DELETE_ERROR: 'Failed to delete record. Please try again.',
            SYNC_ERROR: 'Synchronization failed. Data will be synced when connection is restored.',
            PERMISSION_ERROR: 'You do not have permission to perform this action.',
            SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
            INVALID_EMAIL: 'Please use a valid @westerncape.gov.za email address.',
            FORM_INCOMPLETE: 'Please fill in all required fields.',
            DUPLICATE_RECORD: 'A record with this Patient ID already exists for this date.'
        },

        // Success messages
        SUCCESS_MESSAGES: {
            SAVE_SUCCESS: 'Record saved successfully.',
            DELETE_SUCCESS: 'Record deleted successfully.',
            SYNC_SUCCESS: 'All records synchronized successfully.',
            LOGIN_SUCCESS: 'Welcome! You have been signed in.',
            LOGOUT_SUCCESS: 'You have been signed out.',
            REGISTER_SUCCESS: 'Registration successful! Please sign in.',
            UPDATE_SUCCESS: 'Record updated successfully.'
        },

        // Date and time formats
        DATE_FORMATS: {
            DISPLAY_DATE: 'DD/MM/YYYY',
            DISPLAY_TIME: 'HH:mm',
            DISPLAY_DATETIME: 'DD/MM/YYYY HH:mm',
            ISO_DATE: 'YYYY-MM-DD',
            ISO_DATETIME: 'YYYY-MM-DDTHH:mm:ss'
        }
    };

    // Export to global scope
    window.Constants = Constants;

})(window);