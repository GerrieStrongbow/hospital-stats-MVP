# Hospital Stats MVP - API Documentation

## Overview

This document provides comprehensive API documentation for the Hospital Stats MVP application modules. The application uses a modular JavaScript architecture with IIFE (Immediately Invoked Function Expression) pattern for namespace management.

## Table of Contents

- [Core Modules](#core-modules)
  - [State Management](#state-management)
  - [Router](#router)
  - [Configuration](#configuration)
  - [Error Handler](#error-handler)
- [Patient Modules](#patient-modules)
  - [Patient CRUD](#patient-crud)
  - [Patient List](#patient-list)
  - [Patient Form](#patient-form)
- [Authentication Modules](#authentication-modules)
  - [Auth Module](#auth-module)
- [UI Modules](#ui-modules)
  - [Views](#views)
  - [Components](#components)
- [Utility Modules](#utility-modules)
  - [Constants](#constants)
  - [Security](#security)
  - [Helpers](#helpers)

---

## Core Modules

### State Management

**File**: `js/core/state.js`  
**Global**: `window.State`

Centralized state management for the application.

#### Methods

##### `get(key)`
Retrieves a value from the application state.

**Parameters:**
- `key` (string): The state key to retrieve

**Returns:** Any - The stored value, or `undefined` if key doesn't exist

**Example:**
```javascript
const user = State.get('user');
const supabase = State.get('supabase');
```

##### `set(key, value)`
Stores a value in the application state.

**Parameters:**
- `key` (string): The state key to store
- `value` (any): The value to store

**Example:**
```javascript
State.set('user', userObject);
State.set('currentView', 'dashboard');
```

##### `remove(key)`
Removes a key from the application state.

**Parameters:**
- `key` (string): The state key to remove

**Example:**
```javascript
State.remove('tempData');
```

##### `clear()`
Clears all state data.

**Example:**
```javascript
State.clear(); // Typically used during logout
```

---

### Router

**File**: `js/ui/router.js`  
**Global**: `window.Router`

Handles client-side routing and navigation.

#### Methods

##### `navigate(view, params = {})`
Navigates to a specific view.

**Parameters:**
- `view` (string): The view identifier ('login', 'dashboard', 'patients', etc.)
- `params` (object, optional): Parameters to pass to the view

**Example:**
```javascript
Router.navigate('patients');
Router.navigate('patient', { id: 'patient123', source: 'supabase' });
```

##### `getCurrentView()`
Returns the current active view.

**Returns:** string - Current view identifier

##### `init()`
Initializes the router and handles initial navigation.

#### Events

The router dispatches `routeChange` events:

```javascript
document.addEventListener('routeChange', (e) => {
    console.log('Navigated to:', e.detail.view);
    console.log('Parameters:', e.detail.params);
});
```

---

### Configuration

**File**: `js/core/config.js`  
**Global**: `window.Config`

Application configuration constants and settings.

#### Properties

##### `VALIDATION`
Validation rules for form inputs.

```javascript
Config.VALIDATION.PATIENT_ID.MIN_LENGTH; // 2
Config.VALIDATION.PATIENT_ID.MAX_LENGTH; // 20
Config.VALIDATION.PATIENT_ID.PATTERN; // /^[A-Za-z0-9_-]+$/
```

##### `STORAGE_KEYS`
LocalStorage key definitions.

```javascript
Config.STORAGE_KEYS.PATIENT_RECORDS; // 'hospital_stats_patients'
Config.STORAGE_KEYS.USER_PREFERENCES; // 'hospital_stats_preferences'
```

##### `UI`
UI timing and behavior settings.

```javascript
Config.UI.DEBOUNCE_DELAY; // 300ms
Config.UI.LOADING_TIMEOUT; // 30000ms
Config.UI.MESSAGE_DURATION; // 3000ms
```

---

### Error Handler

**File**: `js/core/error-handler.js`  
**Global**: `window.ErrorHandler`

Centralized error handling and logging system.

#### Methods

##### `handleError(error)`
Main error handling function.

**Parameters:**
- `error` (object|Error|string): Error to handle

**Properties of error object:**
- `type`: Error type from `ERROR_TYPES`
- `message`: Error message
- `severity`: Error severity from `SEVERITY`
- `context`: Additional context (optional)

**Example:**
```javascript
ErrorHandler.handleError({
    type: ErrorHandler.ERROR_TYPES.VALIDATION,
    message: 'Patient ID is required',
    severity: ErrorHandler.SEVERITY.LOW
});
```

##### `wrapFunction(fn, context)`
Wraps a function with error handling.

**Parameters:**
- `fn` (function): Function to wrap
- `context` (object): Error context

**Returns:** Function - Wrapped function

**Example:**
```javascript
const safeFunction = ErrorHandler.wrapFunction(riskyFunction, {
    type: ErrorHandler.ERROR_TYPES.DATABASE,
    context: { operation: 'save_patient' }
});
```

#### Constants

##### `ERROR_TYPES`
```javascript
ErrorHandler.ERROR_TYPES.NETWORK    // 'NETWORK_ERROR'
ErrorHandler.ERROR_TYPES.AUTH       // 'AUTH_ERROR'
ErrorHandler.ERROR_TYPES.VALIDATION // 'VALIDATION_ERROR'
ErrorHandler.ERROR_TYPES.DATABASE   // 'DATABASE_ERROR'
```

##### `SEVERITY`
```javascript
ErrorHandler.SEVERITY.LOW      // 'low'
ErrorHandler.SEVERITY.MEDIUM   // 'medium'
ErrorHandler.SEVERITY.HIGH     // 'high'
ErrorHandler.SEVERITY.CRITICAL // 'critical'
```

---

## Patient Modules

### Patient CRUD

**File**: `js/patient/patient-crud.js`  
**Global**: `window.PatientCRUD`

Handles Create, Read, Update, Delete operations for patient records.

#### Methods

##### `savePatient()`
Saves a patient record (create or update based on context).

**Returns:** Promise - Resolves with operation result

**Example:**
```javascript
await PatientCRUD.savePatient();
```

##### `createPatient(formData)`
Creates a new patient record.

**Parameters:**
- `formData` (object): Patient data object

**Returns:** Promise<object> - Result with success status and data

##### `updatePatient(formData, patientId)`
Updates an existing patient record.

**Parameters:**
- `formData` (object): Updated patient data
- `patientId` (string): Patient identifier

**Returns:** Promise<object> - Result with success status and data

##### `deletePatient()`
Deletes the current patient record.

**Returns:** Promise - Resolves when deletion is complete

##### `validateFormData(data)`
Validates patient form data.

**Parameters:**
- `data` (object): Form data to validate

**Returns:** object - Validation result with `isValid` boolean and `errors` array

**Example:**
```javascript
const validation = PatientCRUD.validateFormData(formData);
if (!validation.isValid) {
    console.log('Errors:', validation.errors);
}
```

---

### Patient List

**File**: `js/patient/patient-list.js`  
**Global**: `window.PatientList`

Manages the patient list view and record loading.

#### Methods

##### `loadPatientRecords()`
Loads patient records from both Supabase and localStorage.

**Returns:** Promise - Resolves when records are loaded

##### `filterPatients(searchTerm)`
Filters the patient list based on search term.

**Parameters:**
- `searchTerm` (string): Search query

##### `getRecords()`
Returns the current patient records array.

**Returns:** Array - Patient records

---

### Patient Form

**File**: `js/patient/patient-form.js`  
**Global**: `window.PatientForm`

Controls the patient form interface and data binding.

#### Methods

##### `loadPatientData(patientId, source)`
Loads patient data for editing.

**Parameters:**
- `patientId` (string): Patient identifier
- `source` (string): Data source ('supabase' or 'localStorage')

**Returns:** Promise - Resolves when data is loaded

##### `getCurrentData()`
Returns the current form context data.

**Returns:** object - Current patient data and editing context

---

## Authentication Modules

### Auth Module

**File**: `js/auth/auth.js`  
**Global**: `window.Auth`

Handles authentication operations with Supabase.

#### Methods

##### `login(email, password)`
Authenticates a user.

**Parameters:**
- `email` (string): User email
- `password` (string): User password

**Returns:** Promise<object> - Authentication result

##### `register(userData)`
Registers a new user.

**Parameters:**
- `userData` (object): User registration data

**Returns:** Promise<object> - Registration result

##### `logout()`
Logs out the current user.

**Returns:** Promise - Resolves when logout is complete

##### `getCurrentUser()`
Gets the currently authenticated user.

**Returns:** object|null - Current user or null if not authenticated

---

## UI Modules

### Views

**File**: `js/ui/views.js`  
**Global**: `window.Views`

Manages application views and UI rendering.

#### Methods

##### `showDashboard()`
Renders the dashboard view.

##### `showPatients()`
Renders the patient list view.

##### `showPatientForm(params)`
Renders the patient form view.

**Parameters:**
- `params` (object): Form parameters (id, source, etc.)

##### `showLogin()`
Renders the login view.

##### `showRegister()`
Renders the registration view.

##### `showError(message, type)`
Displays an error message.

**Parameters:**
- `message` (string): Error message
- `type` (string, optional): Error type for styling

##### `showSuccess(message)`
Displays a success message.

**Parameters:**
- `message` (string): Success message

##### `showLoading()`
Shows the loading overlay.

##### `hideLoading()`
Hides the loading overlay.

---

## Utility Modules

### Constants

**File**: `js/utils/constants.js`  
**Global**: `window.Constants`

Application constants and configuration values.

#### Properties

##### `SUB_DISTRICTS`
Array of South African sub-districts.

##### `THERAPIST_TYPES`
Array of available therapist types.

##### `PHC_FACILITIES`
Object mapping sub-districts to their PHC facilities.

##### `APP_SETTINGS`
Application configuration settings:

```javascript
Constants.APP_SETTINGS.STORAGE_KEYS.PATIENT_RECORDS
Constants.APP_SETTINGS.VALIDATION.PATIENT_ID_MIN_LENGTH
Constants.APP_SETTINGS.UI.TOAST_DURATION
```

---

### Security

**File**: `js/utils/security.js`  
**Global**: `window.Security`

Security utilities for XSS prevention and input sanitization.

#### Methods

##### `sanitizeHTML(html)`
Sanitizes HTML content to prevent XSS attacks.

**Parameters:**
- `html` (string): HTML content to sanitize

**Returns:** string - Sanitized HTML

##### `escapeHTML(text)`
Escapes HTML special characters.

**Parameters:**
- `text` (string): Text to escape

**Returns:** string - Escaped text

##### `createElement(tag, attributes, content)`
Safely creates DOM elements.

**Parameters:**
- `tag` (string): HTML tag name
- `attributes` (object): Element attributes
- `content` (string): Element content

**Returns:** HTMLElement - Created element

##### `generateCSRFToken()`
Generates a CSRF token for form protection.

**Returns:** string - CSRF token

---

## Data Models

### Patient Record

```javascript
{
    id: "uuid",                          // Supabase ID
    local_id: "local_timestamp_random",  // Local storage ID
    user_id: "uuid",                     // User who created record
    patient_identifier: "string",        // Patient ID
    age_group: "<18|>18",               // Age group
    facility: "string",                  // Facility name
    facility_type: "in-hospital|out-hospital|icf|phc",
    appointment_date: "YYYY-MM-DD",      // Appointment date
    appointment_type: "new|repeat",      // Appointment type
    referral_source: "hospital|phc|cbs|other",
    referral_source_other: "string",     // Other referral source
    clinical_area: "string",             // Clinical area
    clinical_area_other: "string",       // Other clinical area
    attendance: "string",                // Attendance status
    disposal: "string",                  // Disposal method
    outcome: "string",                   // Treatment outcome
    duration_minutes: number,            // Session duration
    activities: ["string"],              // Activities performed
    assistive_devices: {},               // Assistive devices (JSONB)
    created_at: "ISO 8601",             // Creation timestamp
    updated_at: "ISO 8601",             // Last update timestamp
    source: "supabase|localStorage",     // Data source
    syncStatus: "synced|pending"         // Sync status
}
```

### User Profile

```javascript
{
    id: "uuid",
    email: "string",
    name: "string",
    surname: "string",
    therapist_type: "string",
    employment_status: "string",
    sub_district: "string",
    created_at: "ISO 8601"
}
```

---

## Error Handling

All modules implement consistent error handling patterns:

1. **Try-Catch Blocks**: All async operations wrapped in try-catch
2. **Error Objects**: Standardized error object structure
3. **User Feedback**: Appropriate user-facing error messages
4. **Logging**: Comprehensive error logging for debugging
5. **Fallback Behavior**: Graceful degradation when services unavailable

## Event System

The application uses a custom event system for module communication:

### Custom Events

- `routeChange`: Fired when navigation occurs
- `patientSaved`: Fired when patient record is saved
- `patientDeleted`: Fired when patient record is deleted
- `userLoggedIn`: Fired on successful authentication
- `userLoggedOut`: Fired on logout

### Event Listening Pattern

```javascript
document.addEventListener('customEvent', (e) => {
    const { detail } = e;
    // Handle event
});
```

### Event Dispatching Pattern

```javascript
document.dispatchEvent(new CustomEvent('customEvent', {
    detail: { data: eventData }
}));
```

---

## Storage Strategy

The application implements a dual-storage strategy:

1. **Primary**: Supabase (cloud database)
2. **Fallback**: LocalStorage (offline capability)
3. **Sync**: Automatic synchronization when online
4. **Conflict Resolution**: Last-write-wins strategy

### Storage Keys

Defined in both `Config.STORAGE_KEYS` and `Constants.APP_SETTINGS.STORAGE_KEYS` with fallback patterns for consistency.

---

This documentation covers all major modules and their public APIs. For implementation details and internal functions, refer to the individual module source files.