# User Guide - Hospital Stats MVP

## Getting Started

### System Requirements
- **Device:** Mobile phone, tablet, or computer with internet browser
- **Browser:** Chrome, Firefox, Safari, or Edge (latest versions recommended)
- **Internet:** Required for initial setup and data synchronization
- **Account:** @westerncape.gov.za email address

### First Time Setup

1. **Open the Application**
   - Navigate to the application URL in your browser
   - The app will automatically adapt to your device screen size

2. **Create Your Account**
   - Click "Register" on the login screen
   - Fill in your details:
     - **Name & Surname:** Your full name
     - **Email:** Must be @westerncape.gov.za address
     - **Therapist Type:** Select your profession
     - **Employment Status:** Full-time, Community Service, or Student
     - **Sub-district:** Choose your work area
     - **Password:** Create a secure password (minimum 6 characters)

3. **Login**
   - Use your email and password to sign in
   - Your session will be remembered for future visits

## Main Features

### Dashboard
Your home screen showing:
- **Patient Records:** Total count of records entered
- **Sync Status:** Current synchronization status with cloud database
- **Quick Actions:** Add new patient, view records, generate reports

### Adding Patient Records

1. **Start New Record**
   - Click the "+" button or "Add New Patient" from dashboard
   - Fill in all required fields (marked with *)

2. **Patient Information**
   - **Patient Identifier:** Unique ID (2-20 characters, no spaces)
   - **Age Group:** Select <18 or >18
   - **Facility:** Choose facility type, then specific facility
   - **Date:** Defaults to today (can be changed)

3. **Appointment Details**
   - **Type:** New or Repeat appointment
   - **Referral Source:** Where patient was referred from
   - **Clinical Area:** Select primary clinical area
   - **Attendance:** How the appointment concluded
   - **Disposal:** Next steps for patient
   - **Outcome:** Treatment result
   - **Duration:** Session length in minutes

4. **Activities & Services**
   - **Activities:** Check all activities performed (scrollable list)
   - **Assistive Devices:** If devices were issued:
     - Select device type
     - Choose funding source
     - Add serial number for wheelchairs

5. **Save Record**
   - Click "Save Patient Record"
   - Record will sync automatically if online
   - If offline, record is saved locally and will sync when connection is restored

### Managing Patient Records

1. **View All Records**
   - Click "View All Patient Records" from dashboard
   - See list of all entered records with sync status

2. **Search Records**
   - Use search bar to find specific patient by ID
   - Results filter in real-time as you type

3. **Edit Records**
   - Click on any patient record to view/edit details
   - Make changes and save
   - Changes will sync to cloud when online

4. **Delete Records**
   - Open patient record for editing
   - Click red "Delete" button
   - Confirm deletion when prompted

### Sync Status Understanding

**Status Indicators:**
- 🟢 **Synced:** Record successfully saved to cloud database
- 🟡 **Pending:** Record saved locally, waiting to sync
- 🔄 **Syncing:** Currently uploading to cloud
- ❌ **Error:** Sync failed, will retry automatically

**Manual Sync:**
- Click "Sync Now" button on dashboard if needed
- All pending records will upload to cloud database

### Data Reports

1. **Generate Monthly Reports**
   - Click "Generate Monthly Reports" on dashboard
   - System automatically creates statistical summaries
   - Reports are generated for backend aggregation and booking numbers

2. **Report Categories**
   - **Backend Aggregation:** Patient type breakdowns, referral sources, treatment classifications
   - **Booking Numbers:** Attendance statistics by facility and month

## Offline Usage

### Working Offline
- App continues to function without internet connection
- New records are saved to your device
- All features remain available except cloud sync

### When Connection Returns
- App automatically detects internet connection
- Pending records sync to cloud database
- You'll see confirmation when sync completes

### Data Safety
- Records are safely stored on your device even offline
- No data is lost if connection is interrupted
- Automatic conflict resolution for simultaneous edits

## Mobile Usage Tips

### Touch Interactions
- **Tap:** Single tap to select or activate
- **Long Press:** Not used in this app
- **Scroll:** Swipe up/down to scroll through lists
- **Pinch to Zoom:** Zoom in/out on content if needed

### Form Filling
- **Text Fields:** Tap to focus and enter text
- **Dropdowns:** Tap to open selection list
- **Checkboxes:** Tap to select/deselect multiple options
- **Radio Buttons:** Tap to select single option

### Navigation
- **Back Button:** Use browser back or on-screen back buttons
- **Menu:** Access from top of screen
- **Quick Actions:** Floating action button (+ symbol)

## Best Practices

### Data Entry
- **Patient IDs:** Use consistent format (e.g., HOSP001, HOSP002)
- **Dates:** Enter actual service date, not data entry date
- **Duration:** Record actual session time in minutes
- **Activities:** Select all activities performed, not just primary
- **Devices:** Always specify funding source and serial numbers

### Daily Workflow
1. Start with dashboard overview
2. Add new patient records as services are provided
3. Check sync status regularly
4. Generate reports at end of month
5. Review pending records before end of day

### Data Quality
- **Complete Records:** Fill all required fields
- **Accurate Information:** Double-check patient details
- **Timely Entry:** Enter data same day as service
- **Consistent Format:** Use standard abbreviations and formats

## Troubleshooting

### Common Issues

**"App won't load"**
- Check internet connection
- Clear browser cache
- Try different browser
- Ensure JavaScript is enabled

**"Can't register account"**
- Verify email ends with @westerncape.gov.za
- Check all required fields are filled
- Ensure password meets requirements
- Try refreshing page and re-entering

**"Records not syncing"**
- Check internet connection
- Click "Sync Now" button manually
- Wait a few minutes and check again
- Records remain safe on device if sync fails

**"Form validation errors"**
- Red highlighted fields need attention
- Check patient ID has no spaces
- Verify date is not in future
- Ensure duration is reasonable (1-480 minutes)

**"Facilities not showing"**
- Select facility type first (in-hospital, out-hospital, etc.)
- Facility list filters based on your sub-district
- PHC shows clinic list, others show general facilities

### Performance Issues

**"App running slowly"**
- Close other browser tabs
- Clear browser data
- Restart browser
- Check device storage space

**"Forms hard to use on mobile"**
- Use portrait orientation for best experience
- Ensure screen brightness is adequate
- Clean screen for better touch response
- Use stylus if available for precision

### Getting Help

**Technical Issues:**
- Check error messages in browser console (F12)
- Note exact steps that cause problems
- Try reproducing issue in different browser

**Data Questions:**
- Refer to clinical guidelines for field definitions
- Check with supervisor for facility-specific requirements
- Review REQUIREMENTS.md for technical specifications

## Data Privacy & Security

### Your Information
- Account details are encrypted and secure
- Only you can access your patient records
- Data is protected by Row Level Security

### Patient Privacy
- Use non-identifying patient IDs only
- No patient names or personal details are stored
- All data complies with healthcare privacy requirements

### System Security
- Regular automatic backups
- Secure cloud database storage
- Access restricted to authorized personnel only

## Updates & Maintenance

### Automatic Updates
- App updates happen automatically
- No action needed from users
- New features appear seamlessly

### Scheduled Maintenance
- Brief maintenance windows may occur
- Usually during off-hours
- Offline functionality continues during maintenance

### Feature Requests
- Suggestions for improvements welcome
- Contact system administrator
- Regular user feedback sessions

## Support Contacts

For assistance with:
- **Technical Issues:** Contact IT support
- **Clinical Questions:** Consult your supervisor  
- **Account Problems:** Contact system administrator
- **Training Needs:** Request user training session

---

*This guide covers the Hospital Stats MVP version. Features and interface may evolve based on user feedback and requirements.*