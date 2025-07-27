# Hospital Stats MVP - End-to-End Testing Guide

## Prerequisites

1. **Database Access**: Ensure your Supabase database is accessible
2. **Internet Connection**: Required for Supabase authentication and sync
3. **Browser**: Use Chrome, Firefox, or Safari (modern browser)

## How to Start Testing

### Option 1: Direct File Access
```bash
# Open the file directly in your browser
open index.html
# OR double-click index.html in Finder
```

### Option 2: Local HTTP Server (Recommended)
```bash
# Python 3
python3 -m http.server 8000
# Then visit: http://localhost:8000

# OR Node.js
npx http-server
# Then visit: http://localhost:8080
```

## End-to-End Test Scenarios

### 🔐 Test 1: User Registration & Authentication

**Step 1: Register a New User**
1. Open the app (you should see "Hospital Stats" with Sign In/Register buttons)
2. Click **"Register"** 
3. Fill in the registration form:
   - **First Name**: Test
   - **Last Name**: User
   - **Email**: testuser@westerncape.gov.za (MUST be @westerncape.gov.za domain)
   - **Therapist Type**: Select "Physiotherapist" 
   - **Sub-district**: Select "Breede Valley"
   - **Employment Status**: Select "Permanent"
   - **Password**: Create a secure password (minimum 6 characters)
4. Click **"Register"**
5. ✅ **Expected**: Success message and automatic redirect to dashboard

**Step 2: Test Authentication State**
1. ✅ **Expected**: Dashboard should show your name and sync status
2. Refresh the page (F5 or Cmd+R)
3. ✅ **Expected**: Should remain logged in (session persistence)

**Step 3: Sign Out and Sign In**
1. Click **"Sign Out"** button (top right)
2. ✅ **Expected**: Redirected to landing page
3. Click **"Sign In"**
4. Enter your email and password
5. Click **"Sign In"**
6. ✅ **Expected**: Redirected to dashboard

### 👥 Test 2: Patient Record Management

**Step 4: Create Patient Records**

**Patient Record #1**
1. From dashboard, click **"Add New Patient"** (+ button)
2. Fill in patient form:
   - **Patient Identifier**: TEST001
   - **Facility**: Select any facility (e.g., "Paarl Hospital")
   - **Appointment Date**: Select today's date
   - **Duration**: 45 (minutes)
   - **Activities**: Check "Therapeutic Exercise" and "Gait Training"
   - **Assistive Devices**: Check "Walking Frame" if needed
3. Click **"Save Patient Record"**
4. ✅ **Expected**: Success message and redirect to patient list

**Patient Record #2**
1. Click **"Add New Patient"** again
2. Fill in different details:
   - **Patient Identifier**: TEST002
   - **Facility**: Select different facility
   - **Appointment Date**: Yesterday's date
   - **Duration**: 30
   - **Activities**: Different activities
3. Click **"Save Patient Record"**

**Patient Record #3**
1. Repeat with:
   - **Patient Identifier**: TEST003
   - **Facility**: Another facility
   - **Duration**: 60
   - Different activities

### 📋 Test 3: Patient List & Search

**Step 5: View Patient Records**
1. From dashboard, click **"View Patient Records"**
2. ✅ **Expected**: Should see all 3 patient records listed
3. ✅ **Expected**: Each record should show:
   - Patient ID
   - Facility name
   - Date
   - Duration
   - Sync status

**Step 6: Search Functionality**
1. In the search box at top, type "TEST001"
2. ✅ **Expected**: Only TEST001 record should be visible
3. Clear search (delete text)
4. ✅ **Expected**: All records visible again
5. Try searching for facility name
6. ✅ **Expected**: Filtering should work

### ✏️ Test 4: Edit Patient Records

**Step 7: Edit a Patient Record**
1. From patient list, click on **TEST001** record
2. ✅ **Expected**: Form should populate with existing data
3. ✅ **Expected**: Should see both "Save Changes" AND "Delete Record" buttons
4. Modify some fields:
   - Change duration from 45 to 50
   - Add/remove an activity
5. Click **"Save Changes"**
6. ✅ **Expected**: Success message and return to patient list
7. ✅ **Expected**: Changes should be visible in the list

**Step 8: Edit Another Record**
1. Click on **TEST002** record
2. Change the facility to a different one
3. Click **"Save Changes"**
4. ✅ **Expected**: Changes saved and visible

### 🗑️ Test 5: Delete Patient Record

**Step 9: Delete a Record**
1. Click on **TEST003** record to edit it
2. ✅ **Expected**: "Delete Record" button should be visible
3. Click **"Delete Record"**
4. ✅ **Expected**: Confirmation dialog appears
5. Confirm deletion
6. ✅ **Expected**: Success message and redirect to patient list
7. ✅ **Expected**: TEST003 should no longer be in the list
8. ✅ **Expected**: Only TEST001 and TEST002 remain

### 🔄 Test 6: Sync Functionality

**Step 10: Online Sync Testing**
1. Go to dashboard
2. ✅ **Expected**: Sync status should show recent sync time
3. ✅ **Expected**: Should show "2 records" (TEST001, TEST002)
4. Note the "Last Sync" time

**Step 11: Offline Mode Testing**
1. Disconnect your internet (turn off WiFi/Ethernet)
2. Create a new patient record:
   - **Patient Identifier**: OFFLINE001
   - Fill in other details
   - Click **"Save Patient Record"**
3. ✅ **Expected**: Record should save successfully
4. ✅ **Expected**: Sync status should show "Pending sync" or offline indicator
5. Go to patient list
6. ✅ **Expected**: OFFLINE001 should be visible in list

**Step 12: Reconnect and Auto-Sync**
1. Reconnect to internet
2. Wait 30 seconds or refresh page
3. ✅ **Expected**: Auto-sync should occur
4. ✅ **Expected**: Sync status should update
5. ✅ **Expected**: "3 records" should be shown

### 🎯 Test 7: Data Persistence

**Step 13: Multi-Device/Session Testing**
1. Open a new browser tab/window
2. Navigate to the same app URL
3. Sign in with the same credentials
4. ✅ **Expected**: Should see all 3 patient records
5. ✅ **Expected**: Data should be consistent across sessions

**Step 14: Browser Storage Testing**
1. Close browser completely
2. Reopen and navigate to app
3. ✅ **Expected**: Should auto-login (session persistence)
4. ✅ **Expected**: All patient records should be visible

## Expected Results Summary

After completing all tests, you should have:

- ✅ **User Account**: Successfully created and authenticated
- ✅ **Patient Records**: 3 total records in system
  - TEST001 (modified duration: 50 minutes)
  - TEST002 (modified facility)
  - OFFLINE001 (created offline, synced online)
- ✅ **Functionality Verified**:
  - Registration with domain validation
  - Login/logout with session persistence  
  - Create, read, update, delete patient records
  - Search and filtering
  - Online/offline sync
  - Data persistence across sessions

## Troubleshooting

### If the page appears blank:
1. Check browser console for errors (F12 → Console)
2. Ensure all module files are present in js/ and css/ folders
3. Try refreshing the page (F5)

### If registration fails:
1. Ensure email ends with @westerncape.gov.za
2. Check internet connection
3. Verify Supabase configuration in config.js

### If sync issues occur:
1. Check network connection
2. Verify Supabase URL and key in config.js
3. Check browser localStorage (F12 → Application → Local Storage)

### If search doesn't work:
1. Ensure patient records are visible first
2. Try searching for exact Patient ID
3. Clear search and try again

## Database Verification

To verify data reached the database:
1. Open Supabase dashboard
2. Navigate to Table Editor
3. Check `patient_records` table
4. Should see your test records with your user_id

## Next Steps

After successful testing:
1. Clean up test data if needed
2. Create real patient records
3. Train users on the workflow
4. Monitor sync performance in production

---

**Note**: This MVP is designed for Allied Healthcare professionals working in South African government hospitals. The workflow and validation rules are specific to this use case.