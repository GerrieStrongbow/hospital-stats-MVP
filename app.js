// Hospital Stats MVP - Main Application
'use strict';

// Global app state
const app = {
    supabase: null,
    currentUser: null,
    currentRoute: null,
    syncQueue: [],
    isOnline: navigator.onLine
};

// Initialize Supabase client
async function initSupabase() {
    // For MVP, we'll use a config object that can be easily changed
    // In production, this would be injected during build time
    const config = window.APP_CONFIG || {
        SUPABASE_URL: 'https://qnipfhctucuvqbpazmbh.supabase.co',
        SUPABASE_ANON_KEY: '' // Will be set in config.js
    };

    // Check if we have credentials
    if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY) {
        console.warn('Supabase credentials not configured. Running in demo mode.');
        return false;
    }

    try {
        if (typeof supabase === 'undefined') {
            console.error('Supabase library not loaded');
            return false;
        }
        app.supabase = supabase.createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
        console.log('Supabase client created successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize Supabase:', error);
        showError('Failed to connect to database.');
        return false;
    }
}

// Router - Simple SPA routing
const router = {
    routes: {
        '': 'landing',
        'login': 'login',
        'register': 'register',
        'dashboard': 'dashboard',
        'patient/new': 'patientForm',
        'patient/:id': 'patientForm'
    },

    isFileProtocol: window.location.protocol === 'file:',

    navigate(path) {
        // Remove leading slash for hash routing
        path = path.replace(/^\//, '');

        if (this.isFileProtocol) {
            // Use hash-based routing for file:// protocol
            window.location.hash = '#' + path;
        } else {
            // Use pushState for http/https
            window.history.pushState({}, '', '/' + path);
            this.handleRoute();
        }
    },

    handleRoute() {
        let path;

        if (this.isFileProtocol) {
            // Extract path from hash
            path = window.location.hash.replace(/^#\/?/, '') || '';
        } else {
            // Extract path from pathname
            path = window.location.pathname.replace(/^\//, '') || '';
        }

        const route = this.matchRoute(path);

        if (!route) {
            this.navigate('');
            return;
        }

        app.currentRoute = route;

        // Check authentication for protected routes
        const protectedRoutes = ['dashboard', 'patientForm'];
        if (protectedRoutes.includes(route.handler) && !app.currentUser) {
            this.navigate('login');
            return;
        }

        // Render the appropriate view
        renderView(route.handler, route.params);
    },

    matchRoute(path) {
        for (const [pattern, handler] of Object.entries(this.routes)) {
            const regex = pattern.replace(/:[^/]+/g, '([^/]+)');
            const match = path.match(new RegExp(`^${regex}$`));

            if (match) {
                const params = {};
                const paramNames = pattern.match(/:[^/]+/g) || [];
                paramNames.forEach((name, index) => {
                    params[name.slice(1)] = match[index + 1];
                });

                return { handler, params };
            }
        }

        return null;
    }
};

// View rendering
async function renderView(viewName, params = {}) {
    showLoading(true);
    const appContainer = document.getElementById('app');

    try {
        let content = '';

        switch (viewName) {
            case 'landing':
                content = renderLanding();
                break;
            case 'login':
                content = renderLogin();
                break;
            case 'register':
                content = renderRegister();
                break;
            case 'dashboard':
                content = await renderDashboard();
                break;
            case 'patientForm':
                content = await renderPatientForm(params.id);
                break;
            default:
                content = '<div class="container"><h1>Page not found</h1></div>';
        }

        appContainer.innerHTML = content;
        attachEventListeners(viewName);

    } catch (error) {
        console.error('Error rendering view:', error);
        showError('Failed to load page');
    } finally {
        showLoading(false);
    }
}

// Landing page
function renderLanding() {
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
}

// Login page
function renderLogin() {
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
                            <button type="button" class="password-toggle" onclick="togglePassword(this)">
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
}

// Register page
function renderRegister() {
    const subDistricts = [
        'Breede Valley',
        'Drakenstein',
        'Langeberg',
        'Stellenbosch',
        'Witzenberg'
    ];

    const therapistTypes = [
        'Physiotherapist',
        'Occupational Therapist',
        'Speech Therapist',
        'Audiologist'
    ];

    const employmentStatuses = [
        'Full-time',
        'Community Service',
        'Student'
    ];

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
        `<option value="${status.toLowerCase().replace(' ', '-')}">${status}</option>`
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
                            <button type="button" class="password-toggle" onclick="togglePassword(this)">
                                👁
                            </button>
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Confirm Password</label>
                        <div class="password-group">
                            <input type="password" class="form-input" name="confirmPassword"
                                   minlength="6" required>
                            <button type="button" class="password-toggle" onclick="togglePassword(this)">
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
}

// Dashboard (placeholder - will be implemented in Phase 5)
async function renderDashboard() {
    return `
        <div class="header">
            <div class="nav">
                <h1 class="header-title">Patient Records</h1>
                <button class="btn" style="background: none; color: white;" onclick="signOut()">
                    Sign Out
                </button>
            </div>
        </div>
        <div class="container">
            <div class="sync-status synced mb-3">
                <span class="sync-status-icon"></span>
                <span>All records synced</span>
            </div>
            <div class="card">
                <p class="text-center text-secondary">Dashboard will be implemented in Phase 5</p>
            </div>
            <button class="fab" onclick="router.navigate('patient/new')">+</button>
        </div>
    `;
}

// Patient form
async function renderPatientForm(patientId) {
    // Get facility data based on user's sub-district

    // Get current date for default
    const today = new Date().toISOString().split('T')[0];

    return `
        <div class="header">
            <div class="nav">
                <button type="button" class="btn" style="background: none; color: white;" onclick="router.navigate('dashboard')">
                    ← Back
                </button>
                <h1 class="header-title">${patientId ? 'Edit Patient' : 'New Patient'}</h1>
            </div>
        </div>
        <div class="container">
            <div class="card">
                <form id="patient-form">
                    <div class="form-group">
                        <label for="patient-identifier" class="form-label">Patient Identifier *</label>
                        <input type="text" class="form-input" id="patient-identifier" name="patientIdentifier" required>
                        <small class="form-help">Unique identifier for this patient</small>
                    </div>

                    <div class="form-group">
                        <label for="age-group" class="form-label">Age Group *</label>
                        <select class="form-input" id="age-group" name="ageGroup" required>
                            <option value="">Select age group</option>
                            <option value="<18">&lt; 18 years</option>
                            <option value=">18">&gt; 18 years</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="facility-type" class="form-label">Facility Type *</label>
                        <select class="form-input" id="facility-type" name="facilityType" required onchange="updateFacilityOptions()">
                            <option value="">Select facility type</option>
                            <option value="in-hospital">In-hospital</option>
                            <option value="out-hospital">Out-hospital</option>
                            <option value="icf">Intermediate Care Facility (ICF)</option>
                            <option value="phc">Primary Health Care (PHC)</option>
                        </select>
                    </div>

                    <div class="form-group" id="facility-group" style="display: none;">
                        <label for="facility" class="form-label">Facility *</label>
                        <select class="form-input" id="facility" name="facility">
                            <option value="">Select facility</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="appointment-date" class="form-label">Date *</label>
                        <input type="date" class="form-input" id="appointment-date" name="appointmentDate" value="${today}" required>
                    </div>

                    <div class="form-group">
                        <label for="appointment-type" class="form-label">Appointment Type *</label>
                        <select class="form-input" id="appointment-type" name="appointmentType" required>
                            <option value="">Select appointment type</option>
                            <option value="new">New</option>
                            <option value="repeat">Repeat</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="referral-source" class="form-label">Referral Source *</label>
                        <select class="form-input" id="referral-source" name="referralSource" required onchange="toggleReferralOther()">
                            <option value="">Select referral source</option>
                            <option value="hospital">Hospital</option>
                            <option value="phc">Primary Health Care (PHC)</option>
                            <option value="cbs">Community Based Service (CBS)</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div class="form-group" id="referral-other-group" style="display: none;">
                        <label for="referral-source-other" class="form-label">Specify Other Referral Source</label>
                        <input type="text" class="form-input" id="referral-source-other" name="referralSourceOther">
                    </div>

                    <div class="form-group">
                        <label for="clinical-area" class="form-label">Clinical Area *</label>
                        <select class="form-input" id="clinical-area" name="clinicalArea" required onchange="toggleClinicalOther()">
                            <option value="">Select clinical area</option>
                            <option value="General Medicine">General Medicine</option>
                            <option value="General Outpatient">General Outpatient</option>
                            <option value="General Surgery">General Surgery</option>
                            <option value="Neurology">Neurology</option>
                            <option value="Orthopaedics">Orthopaedics</option>
                            <option value="Paediatrics">Paediatrics</option>
                            <option value="To Be Determined">To Be Determined</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div class="form-group" id="clinical-other-group" style="display: none;">
                        <label for="clinical-area-other" class="form-label">Specify Other Clinical Area</label>
                        <input type="text" class="form-input" id="clinical-area-other" name="clinicalAreaOther">
                    </div>

                    <div class="form-group">
                        <label for="attendance" class="form-label">Attendance *</label>
                        <select class="form-input" id="attendance" name="attendance" required>
                            <option value="">Select attendance</option>
                            <option value="Attended">Attended</option>
                            <option value="Attended Not Treated">Attended Not Treated</option>
                            <option value="Cancelled On Day">Cancelled On Day</option>
                            <option value="Rescheduled">Rescheduled</option>
                            <option value="Attended Without Appointment (Walk-in)">Attended Without Appointment (Walk-in)</option>
                            <option value="Did Not Attend (DNA)">Did Not Attend (DNA)</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="disposal" class="form-label">Disposal *</label>
                        <select class="form-input" id="disposal" name="disposal" required>
                            <option value="">Select disposal</option>
                            <option value="Discharged: End Of Episode">Discharged: End Of Episode</option>
                            <option value="Future Appointment Given">Future Appointment Given</option>
                            <option value="DNA: Future Appointment Given">DNA: Future Appointment Given</option>
                            <option value="DNA: Discharge End Of Episode">DNA: Discharge End Of Episode</option>
                            <option value="Treatment Suspended">Treatment Suspended</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="outcome" class="form-label">Outcome *</label>
                        <select class="form-input" id="outcome" name="outcome" required>
                            <option value="">Select outcome</option>
                            <option value="Assessment Completed">Assessment Completed</option>
                            <option value="Deterioration In Function">Deterioration In Function</option>
                            <option value="No Improvement In Function">No Improvement In Function</option>
                            <option value="Noticeable Improvement In Function">Noticeable Improvement In Function</option>
                            <option value="Slight Improvement In Function">Slight Improvement In Function</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="duration" class="form-label">Duration (minutes)</label>
                        <input type="number" class="form-input" id="duration" name="durationMinutes" min="0" max="480">
                        <small class="form-help">Session duration in minutes</small>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Activities</label>
                        <div class="checkbox-group" id="activities-group">
                            ${getActivitiesOptions()}
                        </div>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Assistive Device Issued</label>
                        <div id="assistive-devices-group">
                            ${getAssistiveDevicesOptions()}
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" onclick="router.navigate('dashboard')">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            ${patientId ? 'Update Patient' : 'Save Patient'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
}

// Patient form helper functions
function getFacilityOptions() {
    // Dynamic facility options based on user's sub-district
    const facilities = {
        'Breede Valley': {
            'phc': [
                'Avian Park Clinic',
                'De Doorns Clinic',
                'Empilisweni Clinic',
                'Touwsriver',
                'Rawsonville Clinic',
                'Worcester CDC'
            ],
            'icf': [
                'Boland Hospice Intermediate Care Facility'
            ],
            'other': [
                'Funded Day Care Centres for Children with Special Needs',
                'Sandhills & Orchards'
            ]
        },
        'Drakenstein': {
            'phc': [
                'TC Newman CDC',
                'Wellington CDC',
                'Simondium Clinic',
                'Klein Drakenstein Clinic',
                'Gouda Clinic',
                'Saron Clinic'
            ],
            'icf': [
                'Drakenstein Intermediate Care Facility',
                'Milani Care Centre'
            ]
        },
        'Langeberg': {
            'hospital': [
                'Robertson Provincial Hospital (inpatients)',
                'Robertson Provincial Hospital (outpatients)',
                'Montagu Provincial Hospital (inpatients)'
            ],
            'phc': [
                'Nkqubela Clinic',
                'Montagu Primary Healthcare',
                'Bonnievale-Happy Valley Clinic',
                'Zolani Clinic'
            ],
            'icf': [
                'BRAM Intermediate Care Facility'
            ]
        },
        'Stellenbosch': {
            'hospital': [
                'Stellenbosch Provincial Hospital (inpatient)',
                'Stellenbosch Provincial Hospital (outpatient)'
            ],
            'phc': [
                'Aan-het-Pad Clinic',
                'Groendal Clinic',
                'Kylemore Clinic',
                'Cloetesville CDC',
                'Don & Pat Bilton Clinic',
                'Klapmuts Clinic'
            ],
            'icf': [
                'Stellenbosch Intermediate Care Facility'
            ]
        },
        'Witzenberg': {
            'hospital': [
                'Ceres Provincial Hospital (inpatient)'
            ],
            'phc': [
                'Breë Rivier Clinic',
                'Ceres PHC',
                'Prince Alfred\'s Hamlet',
                'Tulbagh Clinic',
                'Bella Vista Clinic',
                'Nduli Clinic',
                'Op die Berg Clinic',
                'Montana Clinic'
            ],
            'icf': [
                'Ceres Intermediate Care Facility'
            ]
        }
    };

    return facilities;
}

function getActivitiesOptions() {
    const activities = [
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
    ];

    return activities.map((activity, index) => `
        <div class="checkbox-item">
            <input type="checkbox" id="activity-${index}" name="activities" value="${activity}">
            <label for="activity-${index}">${activity}</label>
        </div>
    `).join('');
}

function getAssistiveDevicesOptions() {
    return `
        <div class="device-section">
            <h4>Mobility Device</h4>
            <div class="checkbox-item">
                <input type="checkbox" id="mobility-device" name="assistiveDevices" value="mobility" onchange="toggleDeviceDetails('mobility')">
                <label for="mobility-device">Mobility Device Issued</label>
            </div>
            <div id="mobility-details" class="device-details" style="display: none;">
                <select class="form-input" name="mobilityFunding">
                    <option value="">Select funding source</option>
                    <option value="new">New</option>
                    <option value="second-hand">Second-Hand</option>
                    <option value="donation">Donation</option>
                </select>
            </div>
        </div>

        <div class="device-section">
            <h4>Splint</h4>
            <div class="checkbox-item">
                <input type="checkbox" id="splint-device" name="assistiveDevices" value="splint" onchange="toggleDeviceDetails('splint')">
                <label for="splint-device">Splint Issued</label>
            </div>
            <div id="splint-details" class="device-details" style="display: none;">
                <select class="form-input" name="splintFunding">
                    <option value="">Select funding source</option>
                    <option value="new">New</option>
                    <option value="second-hand">Second-Hand</option>
                    <option value="donation">Donation</option>
                </select>
            </div>
        </div>

        <div class="device-section">
            <h4>Wheelchair</h4>
            <div class="checkbox-item">
                <input type="checkbox" id="wheelchair-device" name="assistiveDevices" value="wheelchair" onchange="toggleDeviceDetails('wheelchair')">
                <label for="wheelchair-device">Wheelchair Issued</label>
            </div>
            <div id="wheelchair-details" class="device-details" style="display: none;">
                <select class="form-input" name="wheelchairFunding">
                    <option value="">Select funding source</option>
                    <option value="new">New</option>
                    <option value="second-hand">Second-Hand</option>
                    <option value="donation">Donation</option>
                </select>
                <input type="text" class="form-input" name="wheelchairSerial" placeholder="Serial Number" style="margin-top: 8px;">
            </div>
        </div>

        <div class="device-section">
            <h4>Other Device</h4>
            <div class="checkbox-item">
                <input type="checkbox" id="other-device" name="assistiveDevices" value="other" onchange="toggleDeviceDetails('other')">
                <label for="other-device">Other Device Issued</label>
            </div>
            <div id="other-details" class="device-details" style="display: none;">
                <input type="text" class="form-input" name="otherDevice" placeholder="Specify other device">
            </div>
        </div>
    `;
}

function updateFacilityOptions() {
    const facilityType = document.getElementById('facility-type').value;
    const facilitySelect = document.getElementById('facility');
    const facilityGroup = document.getElementById('facility-group');
    const userSubDistrict = app.currentUser?.profile?.sub_district || 'Stellenbosch';

    // Clear existing options
    facilitySelect.innerHTML = '<option value="">Select facility</option>';

    // Only show facility field for PHC type
    if (facilityType === 'phc') {
        facilityGroup.style.display = 'block';
        facilitySelect.required = true;
    } else {
        facilityGroup.style.display = 'none';
        facilitySelect.required = false;
        facilitySelect.value = ''; // Clear any selected value

        // If not PHC, we're done - no facility selection needed
        if (!facilityType) {
            return;
        }
        // For non-PHC types, set a default facility value based on type
        if (facilityType === 'in-hospital') {
            facilitySelect.value = 'in-hospital-general';
        } else if (facilityType === 'out-hospital') {
            facilitySelect.value = 'out-hospital-general';
        } else if (facilityType === 'icf') {
            facilitySelect.value = 'icf-general';
        }
        return;
    }

    const facilities = getFacilityOptions();
    const facilityList = facilities[userSubDistrict]?.[facilityType] || [];

    // Add hospital options for in-hospital and out-hospital
    if (facilityType === 'in-hospital' || facilityType === 'out-hospital') {
        const hospitalList = facilities[userSubDistrict]?.['hospital'] || [];
        hospitalList.forEach(facility => {
            const option = document.createElement('option');
            option.value = facility;
            option.textContent = facility;
            facilitySelect.appendChild(option);
        });
    }

    // Add specific facility type options
    facilityList.forEach(facility => {
        const option = document.createElement('option');
        option.value = facility;
        option.textContent = facility;
        facilitySelect.appendChild(option);
    });

    // If no facilities found, add generic option
    if (facilitySelect.children.length === 1) {
        const option = document.createElement('option');
        option.value = `${facilityType.replace('-', ' ').toUpperCase()} - ${userSubDistrict}`;
        option.textContent = `${facilityType.replace('-', ' ').toUpperCase()} - ${userSubDistrict}`;
        facilitySelect.appendChild(option);
    }
}

function toggleReferralOther() {
    const referralSource = document.getElementById('referral-source').value;
    const otherGroup = document.getElementById('referral-other-group');

    if (referralSource === 'other') {
        otherGroup.style.display = 'block';
        document.getElementById('referral-source-other').required = true;
    } else {
        otherGroup.style.display = 'none';
        document.getElementById('referral-source-other').required = false;
    }
}

function toggleClinicalOther() {
    const clinicalArea = document.getElementById('clinical-area').value;
    const otherGroup = document.getElementById('clinical-other-group');

    if (clinicalArea === 'Other') {
        otherGroup.style.display = 'block';
        document.getElementById('clinical-area-other').required = true;
    } else {
        otherGroup.style.display = 'none';
        document.getElementById('clinical-area-other').required = false;
    }
}

function toggleDeviceDetails(deviceType) {
    const checkbox = document.getElementById(`${deviceType}-device`);
    const details = document.getElementById(`${deviceType}-details`);

    if (checkbox.checked) {
        details.style.display = 'block';
    } else {
        details.style.display = 'none';
    }
}

// Helper functions
function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.toggle('active', show);
    }
}

function showError(message) {
    // For now, just alert. Will improve in later phases
    alert(message);
}

function togglePassword(button) {
    const input = button.parentElement.querySelector('input');
    if (input.type === 'password') {
        input.type = 'text';
        button.textContent = '👁‍🗨';
    } else {
        input.type = 'password';
        button.textContent = '👁';
    }
}

async function signOut() {
    if (!app.supabase) return;

    try {
        const { error } = await app.supabase.auth.signOut();
        if (error) throw error;

        app.currentUser = null;
        router.navigate('');
    } catch (error) {
        console.error('Sign out error:', error);
        showError('Failed to sign out');
    }
}

// Event listener attachment
function attachEventListeners(viewName) {
    const handlers = {
        'login': attachLoginListeners,
        'register': attachRegisterListeners,
        'patientForm': attachPatientFormListeners
    };

    const handler = handlers[viewName];
    if (handler) {
        handler();
    }
}

function attachLoginListeners() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function attachRegisterListeners() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
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

    if (patientId) {
        patientId.addEventListener('input', validatePatientIdField);
    }

    if (appointmentDate) {
        appointmentDate.addEventListener('change', validateDateField);
        setupDateConstraints(appointmentDate);
    }

    if (duration) {
        duration.addEventListener('input', validateDurationField);
        duration.min = '1';
        duration.max = '480';
    }
}

function setupDateConstraints(dateInput) {
    const today = new Date().toISOString().split('T')[0];
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    dateInput.max = today;
    dateInput.min = oneYearAgo.toISOString().split('T')[0];
}

// Login handler
async function handleLogin(e) {
    e.preventDefault();

    if (!app.supabase) {
        showError('Database connection not available. Please check your connection.');
        return;
    }

    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    showLoading(true);

    try {
        const { data, error } = await app.supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        app.currentUser = data.user;

        // Load user profile
        const { data: profile } = await app.supabase
            .from('user_profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (profile) {
            app.currentUser.profile = profile;
        }

        router.navigate('dashboard');

    } catch (error) {
        console.error('Login error:', error);
        showError(error.message || 'Failed to sign in. Please check your credentials.');
    } finally {
        showLoading(false);
    }
}

// Register handler
async function handleRegister(e) {
    e.preventDefault();

    if (!app.supabase) {
        showError('Database connection not available. Please check your connection.');
        return;
    }

    const formData = new FormData(e.target);
    const firstName = formData.get('firstName');
    const lastName = formData.get('lastName');
    const email = formData.get('email');
    const therapistType = formData.get('therapistType');
    const employmentStatus = formData.get('employmentStatus');
    const subDistrict = formData.get('subDistrict');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');

    // Validate email domain
    if (!email.endsWith('@westerncape.gov.za')) {
        showError('Email must be a @westerncape.gov.za address');
        return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    showLoading(true);

    try {
        // Register user with Supabase Auth
        const { data: authData, error: authError } = await app.supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    first_name: firstName,
                    last_name: lastName
                }
            }
        });

        if (authError) throw authError;

        // Create user profile
        const { error: profileError } = await app.supabase
            .from('user_profiles')
            .insert([{
                id: authData.user.id,
                first_name: firstName,
                last_name: lastName,
                email: email,
                therapist_type: therapistType,
                employment_status: employmentStatus,
                sub_district: subDistrict
            }]);

        if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't throw here - user is created but profile failed
            // We can handle this gracefully
        }

        // Show success message
        showError('Registration successful! Please check your email to verify your account, then sign in.');

        // Navigate to login after 3 seconds
        setTimeout(() => {
            router.navigate('login');
        }, 3000);

    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message || 'Failed to register. Please try again.');
    } finally {
        showLoading(false);
    }
}

// Form validation helper
function validatePatientForm(formData) {
    const errors = [];

    // Validate all fields in sequence
    errors.push(...validateRequiredFields(formData));
    errors.push(...validateConditionalFields(formData));
    errors.push(...validateSpecificFields(formData));

    return errors;
}

function validateRequiredFields(formData) {
    const errors = [];
    const requiredFields = {
        'patientIdentifier': 'Patient Identifier',
        'ageGroup': 'Age Group',
        'facilityType': 'Facility Type',
        'appointmentDate': 'Appointment Date',
        'appointmentType': 'Appointment Type',
        'referralSource': 'Referral Source',
        'clinicalArea': 'Clinical Area',
        'attendance': 'Attendance',
        'disposal': 'Disposal',
        'outcome': 'Outcome'
    };

    for (const [field, label] of Object.entries(requiredFields)) {
        if (!formData.get(field)) {
            errors.push(`${label} is required`);
        }
    }

    return errors;
}

function validateConditionalFields(formData) {
    const errors = [];

    // Facility validation for PHC
    const facilityType = formData.get('facilityType');
    if (facilityType === 'phc' && !formData.get('facility')) {
        errors.push('Facility is required for Primary Health Care');
    }

    // Other conditional validations
    if (formData.get('referralSource') === 'other' && !formData.get('referralSourceOther')) {
        errors.push('Please specify the referral source');
    }

    if (formData.get('clinicalArea') === 'other' && !formData.get('clinicalAreaOther')) {
        errors.push('Please specify the clinical area');
    }

    return errors;
}

function validateSpecificFields(formData) {
    const errors = [];

    // Date validation
    const dateError = validateAppointmentDate(formData.get('appointmentDate'));
    if (dateError) errors.push(dateError);

    // Duration validation
    const durationError = validateDuration(formData.get('durationMinutes'));
    if (durationError) errors.push(durationError);

    // Patient ID validation
    const patientIdError = validatePatientId(formData.get('patientIdentifier'));
    if (patientIdError) errors.push(patientIdError);

    return errors;
}

function validateAppointmentDate(appointmentDate) {
    if (!appointmentDate) return null;

    const date = new Date(appointmentDate);
    const now = new Date();
    const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

    if (date > now) {
        return 'Appointment date cannot be in the future';
    }
    if (date < oneYearAgo) {
        return 'Appointment date cannot be more than one year ago';
    }
    return null;
}

function validateDuration(duration) {
    if (!duration) return null;
    if (isNaN(duration) || duration < 1 || duration > 480) {
        return 'Duration must be between 1 and 480 minutes';
    }
    return null;
}

function validatePatientId(patientId) {
    if (!patientId) return null;
    if (patientId.includes(' ') || patientId.length < 2 || patientId.length > 20) {
        return 'Patient identifier must be 2-20 characters with no spaces';
    }
    return null;
}

// Enhanced error display
function showFormErrors(errors) {
    // Remove existing error messages
    const existingErrors = document.querySelectorAll('.field-error');
    existingErrors.forEach(el => el.remove());

    if (errors.length === 0) return;

    // Show first error in alert for immediate feedback
    showError(`Please fix the following issues:\n• ${errors.join('\n• ')}`);

    // Add inline error messages near form
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error form-errors';
    const errorItems = errors.map(error => `<li>${error}</li>`).join('');
    errorDiv.innerHTML = `<strong>Please fix these issues:</strong><ul>${errorItems}</ul>`;

    const form = document.getElementById('patient-form');
    if (form) {
        form.insertBefore(errorDiv, form.firstChild);
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

// Live validation helpers
function validatePatientIdField(e) {
    const input = e.target;
    const value = input.value.trim();

    // Remove any existing field-specific error
    const existingError = input.parentElement.querySelector('.field-error-inline');
    if (existingError) existingError.remove();

    if (value && (value.includes(' ') || value.length < 2 || value.length > 20)) {
        showFieldError(input, 'Patient ID must be 2-20 characters with no spaces');
        input.classList.add('error');
    } else {
        input.classList.remove('error');
    }
}

function validateDateField(e) {
    const input = e.target;
    const value = input.value;

    // Remove any existing field-specific error
    const existingError = input.parentElement.querySelector('.field-error-inline');
    if (existingError) existingError.remove();

    if (value) {
        const date = new Date(value);
        const now = new Date();
        const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());

        if (date > now) {
            showFieldError(input, 'Date cannot be in the future');
            input.classList.add('error');
        } else if (date < oneYearAgo) {
            showFieldError(input, 'Date cannot be more than one year ago');
            input.classList.add('error');
        } else {
            input.classList.remove('error');
        }
    }
}

function validateDurationField(e) {
    const input = e.target;
    const value = parseInt(input.value);

    // Remove any existing field-specific error
    const existingError = input.parentElement.querySelector('.field-error-inline');
    if (existingError) existingError.remove();

    if (input.value && (isNaN(value) || value < 1 || value > 480)) {
        showFieldError(input, 'Duration must be between 1 and 480 minutes');
        input.classList.add('error');
    } else {
        input.classList.remove('error');
    }
}

function showFieldError(input, message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error-inline';
    errorDiv.textContent = message;
    errorDiv.style.fontSize = '12px';
    errorDiv.style.color = 'var(--error-color)';
    errorDiv.style.marginTop = '4px';

    input.parentElement.appendChild(errorDiv);
}

// Patient form handler
async function handlePatientForm(e) {
    e.preventDefault();

    if (!app.supabase) {
        showError('Database connection not available. Please check your connection.');
        return;
    }

    if (!app.currentUser) {
        showError('You must be logged in to save patient records.');
        router.navigate('login');
        return;
    }

    const formData = new FormData(e.target);

    // Validate form
    const validationErrors = validatePatientForm(formData);
    if (validationErrors.length > 0) {
        showFormErrors(validationErrors);
        return;
    }

    // Collect form data with proper trimming and validation
    const facilityType = formData.get('facilityType');
    let facility = formData.get('facility');

    // For non-PHC types, set facility based on facility type
    if (facilityType !== 'phc') {
        facility = facilityType; // Use the facility type as the facility value
    }

    const patientData = {
        user_id: app.currentUser.id,
        patient_identifier: formData.get('patientIdentifier').trim(),
        age_group: formData.get('ageGroup'),
        facility: facility,
        facility_type: facilityType,
        appointment_date: formData.get('appointmentDate'),
        appointment_type: formData.get('appointmentType'),
        referral_source: formData.get('referralSource'),
        referral_source_other: formData.get('referralSourceOther')?.trim() || null,
        clinical_area: formData.get('clinicalArea'),
        clinical_area_other: formData.get('clinicalAreaOther')?.trim() || null,
        attendance: formData.get('attendance'),
        disposal: formData.get('disposal'),
        outcome: formData.get('outcome'),
        duration_minutes: formData.get('durationMinutes') ? parseInt(formData.get('durationMinutes')) : null
    };

    // Collect activities (checkboxes)
    const activities = [];
    const activityInputs = document.querySelectorAll('input[name="activities"]:checked');
    activityInputs.forEach(input => activities.push(input.value));
    patientData.activities = activities;

    // Collect assistive devices
    const assistiveDevices = {};
    const deviceInputs = document.querySelectorAll('input[name="assistiveDevices"]:checked');

    deviceInputs.forEach(input => {
        const deviceType = input.value;
        assistiveDevices[deviceType] = { issued: true };

        if (deviceType === 'mobility') {
            const funding = formData.get('mobilityFunding');
            if (funding) assistiveDevices[deviceType].funding = funding;
        } else if (deviceType === 'splint') {
            const funding = formData.get('splintFunding');
            if (funding) assistiveDevices[deviceType].funding = funding;
        } else if (deviceType === 'wheelchair') {
            const funding = formData.get('wheelchairFunding');
            const serial = formData.get('wheelchairSerial')?.trim();
            if (funding) assistiveDevices[deviceType].funding = funding;
            if (serial) assistiveDevices[deviceType].serial_number = serial;
        } else if (deviceType === 'other') {
            const deviceName = formData.get('otherDevice')?.trim();
            if (deviceName) assistiveDevices[deviceType].device_name = deviceName;
        }
    });

    patientData.assistive_devices = assistiveDevices;

    // Additional specific validation for wheelchair serial numbers
    if (assistiveDevices.wheelchair && !assistiveDevices.wheelchair.serial_number) {
        showFormErrors(['Serial number is required for wheelchairs.']);
        return;
    }

    showLoading(true);

    try {
        // Save patient record
        const { error } = await app.supabase
            .from('patient_records')
            .insert([patientData]);

        if (error) throw error;

        // Store in localStorage for offline sync queue
        saveToLocalStorage(patientData);

        showError('Patient record saved successfully!');

        // Navigate back to dashboard
        setTimeout(() => {
            router.navigate('dashboard');
        }, 1500);

    } catch (error) {
        console.error('Patient form error:', error);

        // If offline or database error, save locally
        if (error.message.includes('fetch') || !app.isOnline) {
            patientData.local_id = Date.now().toString();
            patientData.synced = false;
            saveToLocalStorage(patientData);
            showError('Saved offline. Will sync when connection is restored.');
        } else {
            showError(error.message || 'Failed to save patient record. Please try again.');
        }
    } finally {
        showLoading(false);
    }
}

// Offline storage helper
function saveToLocalStorage(patientData) {
    try {
        const existingRecords = JSON.parse(localStorage.getItem('patient_records') || '[]');
        existingRecords.push({
            ...patientData,
            created_at: new Date().toISOString(),
            local_id: patientData.local_id || Date.now().toString()
        });
        localStorage.setItem('patient_records', JSON.stringify(existingRecords));

        // Add to sync queue if not synced
        if (!patientData.synced) {
            const syncQueue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
            syncQueue.push(patientData.local_id || Date.now().toString());
            localStorage.setItem('sync_queue', JSON.stringify(syncQueue));
        }
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
    }
}

// Online/offline detection
window.addEventListener('online', () => {
    app.isOnline = true;
    // Trigger sync when coming online
    if (app.currentUser) {
        syncData();
    }
});

window.addEventListener('offline', () => {
    app.isOnline = false;
});

// Data sync (placeholder - will be implemented in Phase 5)
async function syncData() {
    // Will implement sync logic in Phase 5
    console.log('Sync functionality will be implemented in Phase 5');
}

// Initialize app on load
window.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing app...');

    // Initialize Supabase
    const supabaseReady = await initSupabase();
    console.log('Supabase ready:', supabaseReady);

    // Set up routing
    if (router.isFileProtocol) {
        window.addEventListener('hashchange', () => router.handleRoute());
    } else {
        window.addEventListener('popstate', () => router.handleRoute());
    }

    // Check for existing session
    if (supabaseReady && app.supabase) {
        try {
            const { data: { session } } = await app.supabase.auth.getSession();
            if (session) {
                app.currentUser = session.user;

                // Load user profile
                const { data: profile } = await app.supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    app.currentUser.profile = profile;
                }
            }
        } catch (error) {
            console.log('Session check failed:', error);
        }
    }

    // Handle initial route
    console.log('Handling initial route...');
    router.handleRoute();
});

// Service Worker registration for PWA capabilities (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Will add service worker in future for full offline capabilities
        console.log('Service Worker support detected - will implement for production');
    });
}
