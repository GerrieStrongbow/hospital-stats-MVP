# Hospital Stats MVP - User Guide

## Overview

The Hospital Stats MVP is a mobile-first web application designed for allied healthcare professionals working in South African government hospitals. This guide will help you navigate and use all features of the application effectively.

## Table of Contents

- [Getting Started](#getting-started)
- [Account Management](#account-management)
- [Patient Record Management](#patient-record-management)
- [Dashboard Overview](#dashboard-overview)
- [Offline Functionality](#offline-functionality)
- [Data Synchronization](#data-synchronization)
- [Troubleshooting](#troubleshooting)
- [Best Practices](#best-practices)

---

## Getting Started

### System Requirements

- **Device**: Smartphone, tablet, or computer
- **Browser**: Modern web browser (Chrome, Safari, Firefox, Edge)
- **Internet**: Internet connection for initial setup and data sync
- **Account**: Valid @westerncape.gov.za email address

### First Time Setup

1. **Open the Application**
   - Navigate to the Hospital Stats MVP web address
   - The application will automatically load the login screen

2. **Create Your Account**
   - Click "Create New Account" if you don't have an account
   - Fill in the registration form with accurate information
   - Use your official @westerncape.gov.za email address

3. **Login**
   - Enter your email and password
   - Click "Login" to access the application

---

## Account Management

### Registration

**Required Information:**
- **Name**: Your first name
- **Surname**: Your last name  
- **Email**: Must be a valid @westerncape.gov.za address
- **Therapist Type**: Select from:
  - Physiotherapist
  - Occupational Therapist
  - Speech Therapist
  - Audiologist
- **Employment Status**: Choose from:
  - Full-time
  - Community Service
  - Student
- **Sub-district**: Select your working sub-district:
  - Breede Valley
  - Drakenstein
  - Langeberg
  - Stellenbosch
  - Witzenberg

### Login Process

1. Enter your registered email address
2. Enter your password
3. Click "Login"
4. If credentials are correct, you'll be redirected to the dashboard

### Password Requirements

- Minimum 6 characters
- Combination of letters and numbers recommended
- Keep your password secure and don't share it

---

## Patient Record Management

### Adding a New Patient Record

1. **Navigate to Patient Records**
   - From the dashboard, click "Patient Records"
   - Click the "+" (Add) button

2. **Fill Patient Information**

   **Basic Information:**
   - **Patient ID**: Unique identifier (2-20 characters, letters/numbers/hyphens/underscores only)
   - **Age Group**: Select "<18" or ">18"
   - **Facility**: Choose the facility where treatment occurred
   - **Facility Type**: Select from:
     - In-hospital
     - Out-hospital
     - ICF (Intermediate Care Facility)
     - PHC (Primary Health Care)

   **Appointment Details:**
   - **Appointment Date**: Select the date (cannot be future dates)
   - **Appointment Type**: Choose "New" or "Repeat"
   - **Duration**: Enter session duration in minutes (1-480 minutes)

   **Referral Information:**
   - **Referral Source**: Select from Hospital, PHC, CBS, or Other
   - **Other Source**: Specify if "Other" is selected
   - **Clinical Area**: Choose the relevant clinical area
   - **Other Area**: Specify if needed

   **Treatment Details:**
   - **Attendance**: Record attendance status
   - **Disposal**: Select disposal method
   - **Outcome**: Choose treatment outcome
   - **Activities**: Select all applicable activities performed
   - **Assistive Devices**: Check all devices used and fill details if applicable

3. **Save the Record**
   - Review all information for accuracy
   - Click "Save Patient" to store the record
   - The system will validate all required fields

### Viewing Patient Records

1. **Patient List View**
   - Shows all your patient records in chronological order
   - Displays Patient ID, Facility, Date, and Sync Status

2. **Search Functionality**
   - Use the search box to find specific patients
   - Search by Patient ID, Facility, or other record details
   - Results update in real-time as you type

3. **Record Details**
   - Click on any patient record to view full details
   - All entered information is displayed in an organized format

### Editing Patient Records

1. **Select Record to Edit**
   - Navigate to patient list
   - Click on the patient record you want to modify

2. **Edit Information**
   - Click the "Edit" or pencil icon
   - Modify any field as needed
   - All the same validation rules apply

3. **Save Changes**
   - Click "Save Changes" to update the record
   - The system will sync changes when online

### Deleting Patient Records

⚠️ **Warning**: Deletion is permanent and cannot be undone.

1. **Select Record**
   - Navigate to the patient record you want to delete
   - Open the record details

2. **Delete Process**
   - Click the "Delete" button (trash icon)
   - Confirm deletion in the popup dialog
   - The record will be permanently removed

---

## Dashboard Overview

### Main Dashboard Features

**Quick Stats:**
- Total patient records
- Recent activity summary
- Sync status indicator

**Recent Records:**
- Shows your most recent patient entries
- Quick access to edit or view details

**Quick Actions:**
- Add New Patient (+ button)
- View All Patients
- Sync Data
- Account Settings

### Navigation Menu

- **Dashboard**: Main overview screen
- **Patient Records**: Full patient list and management
- **Add Patient**: Quick access to new patient form
- **Settings**: Account and application settings
- **Logout**: Sign out of the application

---

## Offline Functionality

### Working Offline

The Hospital Stats MVP is designed to work even when you don't have internet connectivity:

**Offline Capabilities:**
- ✅ Add new patient records
- ✅ Edit existing records
- ✅ View all stored records
- ✅ Search through records
- ❌ Cannot sync with server
- ❌ Cannot login/logout

### Offline Indicators

- **Connection Status**: Displayed in the app header
- **Sync Status**: Shows "Pending Sync" for unsynced records
- **Record Icons**: Different icons for synced vs. local-only records

### Data Storage

When offline, your data is stored securely on your device:
- All patient records remain accessible
- Data persists even if you close the browser
- No data is lost when connection is restored

---

## Data Synchronization

### Automatic Sync

The application automatically synchronizes your data when:
- You have an active internet connection
- You login to the application
- You navigate to the patient records section
- Periodically in the background (every 5 minutes)

### Manual Sync

To manually sync your data:
1. Ensure you have internet connectivity
2. Go to Dashboard or Patient Records
3. Look for sync status indicators
4. The app will automatically attempt to sync pending records

### Sync Status Indicators

**Record Level:**
- 🟢 **Synced**: Record is saved to the server
- 🟡 **Pending**: Record waiting to sync
- 🔴 **Error**: Sync failed (will retry automatically)

**Application Level:**
- "All synced" - All records are up to date
- "X pending" - Number of records waiting to sync
- "Syncing..." - Sync in progress

### Sync Conflicts

If the same patient record is modified in multiple places:
- The most recent change will be kept
- You'll be notified if conflicts are detected
- Review conflicted records manually if needed

---

## Troubleshooting

### Common Issues and Solutions

#### "Patient ID already exists"

**Problem**: You're trying to create a patient with an ID that already exists.

**Solution**:
- Use a different, unique Patient ID
- Check if the patient already exists in your records
- Ensure you're not accidentally duplicating an entry

#### "Cannot connect to server"

**Problem**: Application cannot sync with the database.

**Solution**:
- Check your internet connection
- Try refreshing the page
- Data will be stored locally until connection is restored

#### "Login failed"

**Problem**: Cannot authenticate with your credentials.

**Solution**:
- Verify your email address is correct
- Check if caps lock is on for password
- Ensure you're using your @westerncape.gov.za email
- Contact system administrator if issue persists

#### "Page not loading properly"

**Problem**: Application interface appears broken or incomplete.

**Solution**:
- Refresh the browser page (Ctrl+R or Cmd+R)
- Clear your browser cache
- Try using a different browser
- Ensure JavaScript is enabled

#### "Data not saving"

**Problem**: Patient records are not being saved.

**Solution**:
- Check that all required fields are filled
- Ensure Patient ID format is correct (letters, numbers, hyphens, underscores only)
- Verify appointment date is not in the future
- Try saving again after fixing validation errors

### Error Messages

**Validation Errors:**
- Red highlighted fields indicate missing or invalid data
- Error messages appear below problematic fields
- Fix all highlighted issues before saving

**Network Errors:**
- "Network connection failed" - Check internet connectivity
- "Sync failed" - Will retry automatically
- "Server unavailable" - Temporary issue, try again later

### Getting Help

If you continue to experience issues:

1. **Check System Status**
   - Verify if other users are experiencing similar issues
   - Check with your IT department

2. **Document the Problem**
   - Note what you were doing when the error occurred
   - Take a screenshot if possible
   - Record any error messages exactly as they appear

3. **Contact Support**
   - Reach out to your local IT support
   - Provide details about the issue and steps to reproduce it

---

## Best Practices

### Data Entry

**Accuracy First:**
- Double-check all patient information before saving
- Use consistent formatting for similar data
- Be specific in free-text fields

**Patient ID Guidelines:**
- Use a consistent naming convention (e.g., initials + date)
- Keep IDs short but meaningful
- Avoid spaces and special characters except hyphens and underscores

**Date and Time:**
- Always enter the actual appointment date
- Don't backdate entries unless correcting errors
- Use precise duration times when possible

### Security Practices

**Account Security:**
- Never share your login credentials
- Log out when using shared devices
- Use a strong, unique password

**Data Privacy:**
- Only enter patient data you're authorized to collect
- Don't include unnecessary personal identifiers
- Be mindful of patient confidentiality

### Efficiency Tips

**Daily Workflow:**
- Enter patient data immediately after appointments when possible
- Use the search function to quickly find existing records
- Review pending sync status regularly

**Batch Operations:**
- Enter multiple records in sequence for efficiency
- Use consistent data entry patterns
- Regularly review and correct any data entry errors

### Data Management

**Regular Maintenance:**
- Review your patient records periodically
- Correct any obvious data entry errors
- Keep track of your sync status

**Backup Strategy:**
- The system automatically backs up your data
- Report any sync issues promptly
- Don't rely on local storage as your only backup

---

## Mobile Usage Tips

### Touch Interface

- **Tap**: Select fields and buttons
- **Scroll**: Navigate through long forms
- **Zoom**: Pinch to zoom if text is too small
- **Swipe**: Navigate between sections (if applicable)

### Screen Optimization

- **Portrait Mode**: Recommended for form entry
- **Landscape Mode**: Good for viewing record lists
- **Text Size**: Use your device's accessibility settings if needed

### Battery Management

- **Sync Regularly**: Don't let too many records accumulate offline
- **Close When Done**: Close the browser when not in use
- **Background Apps**: Limit other apps running simultaneously

---

This user guide covers all essential features and functions of the Hospital Stats MVP application. For technical support or additional questions, please contact your local IT department or system administrator.