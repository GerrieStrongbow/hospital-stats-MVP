# Hospital Stats MVP - Development Planning

## Overview
Building a mobile-responsive web application for allied healthcare professionals to log patient data with offline capabilities.

## Phase 1: Project Foundation ✓ COMPLETED

### Tasks Completed:
- [x] Created project structure with index.html, styles.css, app.js
- [x] Set up mobile-first responsive CSS with Roboto font
- [x] Created .env.example for Supabase credentials
- [x] Implemented basic SPA routing for authentication and main app
- [x] Added mobile viewport meta tags and PWA-ready structure

### Summary:
Created the foundational structure for a mobile-first web application with:
- Clean, Google/Apple-inspired design using Roboto font
- Mobile-optimized viewport settings and responsive CSS
- Basic SPA routing system for navigation between views
- Placeholder views for login, register, dashboard, and patient forms
- Loading states and error handling structure
- Supabase client initialization (awaiting credentials)

### Key Design Decisions:
- Used CSS custom properties for easy theming
- Implemented Material Design shadow system
- Created reusable component styles (buttons, forms, cards)
- Set up password visibility toggle functionality
- Added FAB (Floating Action Button) for mobile UX

---

## Phase 2: Database Setup via Supabase MCP (Next)

### Tasks:
- [ ] Create patient_records table for raw patient data
- [ ] Create backend_aggregation table for monthly reports
- [ ] Create booked_numbers table for booking statistics
- [ ] Set up RLS policies for user data isolation
- [ ] Test database connections and basic operations

### Table Schemas:

#### patient_records
- id (uuid, primary key)
- user_id (uuid, foreign key to auth.users)
- patient_identifier (text, unique per user)
- age_group (text: '<18' or '>18')
- facility (text)
- facility_type (text: 'in-hospital', 'out-hospital', 'icf', 'phc')
- date (date)
- appointment_type (text: 'new' or 'repeat')
- referral_source (text)
- referral_source_other (text, nullable)
- clinical_area (text)
- clinical_area_other (text, nullable)
- attendance (text)
- disposal (text)
- outcome (text)
- duration_minutes (integer)
- activities (text[])
- assistive_devices (jsonb)
- created_at (timestamp)
- updated_at (timestamp)
- synced_at (timestamp, nullable)

#### backend_aggregation
- id (uuid, primary key)
- month (text)
- year (text)
- therapist_name (text)
- therapist_type (text)
- sub_district (text)
- facility (text)
- platform (text, nullable)
- type_of_patients (text)
- referred_from (text)
- age_or_repeat (text)
- tx_or_tx_d (text)
- totals (integer)
- created_at (timestamp)

#### booked_numbers
- id (uuid, primary key)
- month (text)
- year (text)
- therapist_name (text)
- therapist_type (text)
- sub_district (text)
- facility (text)
- total_booked (integer)
- booked_seen (integer)
- unbooked_seen (integer)
- concatenated_row (text)
- count (integer)
- created_at (timestamp)

---

## Phase 3: Authentication System

### Tasks:
- [ ] Build registration form with @westerncape.gov.za validation
- [ ] Implement therapist type and employment status selection
- [ ] Add sub-district dropdown from CWD data
- [ ] Create login/logout with Supabase Auth
- [ ] Add password visibility toggles
- [ ] Store user profile data (name, type, sub-district)

---

## Phase 4: Patient Record Form

### Tasks:
- [ ] Create comprehensive patient data entry form
- [ ] Implement dynamic facility filtering by user's sub-district
- [ ] Add conditional assistive device fields (wheelchair serial numbers)
- [ ] Set up form validation and mobile-friendly inputs
- [ ] Implement localStorage for offline data storage
- [ ] Create sync queue for offline records

---

## Phase 5: Dashboard & Data Management

### Tasks:
- [ ] Build patient records list with search functionality
- [ ] Implement view/edit/delete operations
- [ ] Create sync status indicator and manual sync button
- [ ] Show patient count and last sync timestamp
- [ ] Add offline/online detection and auto-sync
- [ ] Implement data conflict resolution

---

## Phase 6: Data Aggregation Logic

### Tasks:
- [ ] Build attendance categorization (Booked Seen, Unbooked Seen, Total Booked)
- [ ] Create monthly aggregation for backend_aggregation table
- [ ] Implement BookedNumbers calculations
- [ ] Add Tx vs Tx+D classification logic
- [ ] Create aggregation triggers on sync
- [ ] Validate against provided examples

---

## Phase 7: Testing & Polish

### Tasks:
- [ ] Test complete workflow from registration to aggregation
- [ ] Verify offline/online sync scenarios
- [ ] Optimize for mobile touch interactions
- [ ] Add loading states and error messages
- [ ] Test on various mobile screen sizes
- [ ] Create basic documentation

---

## Notes for Future Native App Development

### Key Patterns Established:
1. Offline-first data architecture with sync queue
2. User authentication tied to organizational email domain
3. Dynamic form fields based on user profile (sub-district)
4. Monthly data aggregation for reporting
5. Mobile-optimized UI/UX patterns

### Technologies to Consider:
- React Native for cross-platform mobile app
- SQLite for local database
- Background sync for reliable offline operation
- Push notifications for sync status
- Biometric authentication option