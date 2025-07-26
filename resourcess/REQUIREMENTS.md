# Project Requirements

## Project Overview

The goal of this project is to build a data-logging mobile app for allied healthcare professionals working in South African government hospitals.

## Functionality

The following functionality will be required:

1. Mobile app
2. Cloud-based database to store data

## Mobile app

Due to connectivity issues that may arrise in South Africa, it should be a mobile-first application. The mobile app should contain the following:

1. Login screen with user authentication
    - Option to register if user does not have an account
        - Name
        - Surname
        - Email Address (must be a @westerncape.gov.za address)
        - Therapist Type
            - Pysiotherapist
            - Occupational Therapist
            - Speach Therapist
            - Audiologist
            - (Each Therapist Type should have Full-time|Community Service|Student options)
        - Sub-district
            - See the list of sub-districs in @resources/CWD_Therapists_2025.md
        - Password (with option to view it)
        - Confirm Password (with option to view it)
    - Option to sign in with email and password
2. Landing page
    - Previously entered patient records (should be able to view, update and delete previous records)
    - Add New Patient button
    - Search function to search for patient record based on unique Patient ID
    - Indicator of if records synced with database and when
    - Button to manually sync database if automatic sync failed for some reason
    - Number of patient records
    - Sign Out button
3. Patient record form with the following fields:
    - Unique Patient Identifier
    - Age Group
        - < 18
        - > 18
    - Facility
        - In-hospital
        - Out-hospital
        - Intermediate Care Facility (ICF)
        - Primary Health Care (PHC)
            - List of clinics (see @resources/CWD_Therapists_2025.md. Note that the therapist should only see the clinics that are in his/her sub-district)
    - Date (default to today)
    - Appointment Type
        - New
        - Repeat
    - Referral Source
        - Hospital
        - Primary Health Care (PHC)
        - Community Based Service (CBS)
        - Other (allow user to specify what)
    - Clinical Areas
        - General Medicine
        - General Outpatient
        - General Surgery
        - Neurology
        - Orthopaedics
        - Paediatrics
        - To Be Determined
        - Other (allow user to specify what)
    - Attendance*
        - Attended
        - Attended Not Treated
        - Cancelled On Day
        - Rescheduled
        - Attended Without Appointment (Walk-in)
        - Did Not Attend (DNA)
    - Disposal
        - Discharged: End Of Episode
        - Future Appointment Given
        - DNA: Future Appointment Given
        - DNA: Discharge End Of Episode
        - Treatment Suspended
    - Outcome
        - Assessment Completed
        - Deterioration In Function
        - No Improvement In Function
        - Noticeable Improvement In Function
        - Slight Improvement In Function
    - Duration (in minutes)
    - Activities
        - Screen
        - Assessment
        - Assessment: Mobility Assistive Devices
        - Assessment: Wheelchair
        - Assessment: Standardised
        - Assessment: Vocation/Work
        - Construct Assistive Device/Functional Adaptation
        - Counseling
        - Education And Recommendations
        - Home Programme Issued
        - Home Visit
        - Mobility Device: Service
        - Mobility Device: Training
        - Mobility Device: Adjust
        - Patient Referral
        - Splint: Adjust
        - Splint: Construct
        - Telephonic Consultation
        - Treatment: Occupation Based Intervention
        - Treatment: Purposeful Activity
        - Treatment: ADL Training
    - Assistive Device Issued**
        - Mobility Device
            - Funding Source
                - New
                - Second-Hand
                - Donation
        - Splint
            - Funding Source
                - New
                - Second-Hand
                - Donation
        - Wheelchair
            - Funding Source
                - New
                - Second-Hand
                - Donation
            - Serial Number (only for wheelchairs)
        - Other (allow user input)

(See Database section for context for the following notes)
*Attended is "Booked Seen".
Walk-ins are "Unbooked Seen".
All the other types contribute to "Total Booked".

**If no device was issued, mark as TREAT.
If a device was issued, mark as TREAT + DEVICE.

## Database

Whenever the mobile phone is connected to the internet, the patient data should automatically sync to the database. For simplicity setting up user authentication, Row Level Security (RLS) for multi-user data isolation, and data syncing, Supabase should be used. The following tables are required:

1. BackEnd
    - Month
    - Year
    - Therapist Name
    - Therapist Type
    - Sub-district
    - Facility
    - Platform
    - Type of Patients
    - Referred From
    - Age or Repeat
    - Tx or Tx+D
    - Totals
2. BookedNumbers
    - Month
    - Year
    - Therapist Name
    - Therapist Type
    - Sub-district
    - Facility
    - Total Booked
    - Booked Seen
    - Unbooked Seen
    - Concatendated Row
    - Count

Examples:

BackEnd table

Month	Year	Therapist Name	Therapist Type	Sub-District	Facility	Platform	Type of Patients	Referred From	Age or repeat	Tx or Tx+D	Totals
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Cloetesville CDC		Repeat	Repeat	Repeat	Tx	2
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Cloetesville CDC		Repeat	Repeat	Repeat	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Cloetesville CDC		New	Hosp	<18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Cloetesville CDC		New	Hosp	<18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Cloetesville CDC		New	PHC	<18	Tx	4
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Klapmuts Clinic		New	PHC	<18	Tx	1
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Klapmuts Clinic		New	PHC	<18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Klapmuts Clinic		New	CBS	<18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Klapmuts Clinic		New	CBS	<18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Klapmuts Clinic		New	Other	<18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Klapmuts Clinic		New	Other	<18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Klapmuts Clinic		New	Hosp	>18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Groendal Clinic		New	PHC	<18	Tx	1
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Groendal Clinic		New	PHC	<18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Groendal Clinic		New	CBS	<18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Groendal Clinic		New	CBS	<18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Groendal Clinic		New	Other	<18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Groendal Clinic		New	Other	<18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Groendal Clinic		New	Hosp	>18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Groendal Clinic		New	Hosp	>18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Kylemore Clinic		New	Other	<18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Kylemore Clinic		New	Other	<18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Kylemore Clinic		New	Hosp	>18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Kylemore Clinic		New	Hosp	>18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Kylemore Clinic		New	PHC	>18	Tx	5
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Kylemore Clinic		New	PHC	>18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (out-patient)		New	Other	<18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (out-patient)		New	Other	<18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (out-patient)		New	Hosp	>18	Tx	3
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (out-patient)		New	Hosp	>18	Tx+D	3
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (out-patient)		New	PHC	>18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (in-patient)		New	PHC	<18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (in-patient)		New	CBS	<18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (in-patient)		New	CBS	<18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (in-patient)		New	Other	<18	Tx	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (in-patient)		New	Other	<18	Tx+D	0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (in-patient)		New	Hosp	>18	Tx	2
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (in-patient)		New	Hosp	>18	Tx+D	2
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (in-patient)		New	PHC	>18	Tx	0
...

BookedNumbers Table

Month	Year	Therapist Name	Therapist Type	Sub-District	Facility	Total booked	Booked seen	Unbooked seen	Concatendated Row	Count
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Cloetesville CDC	18	10	0		0
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Klapmuts Clinic	9	6	0	MayYr 2025A. BEKKERKlapmuts Clinic	1
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Groendal Clinic	9	7	0	MayYr 2025A. BEKKERGroendal Clinic	1
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Kylemore Clinic	14	11	0	MayYr 2025A. BEKKERKylemore Clinic	1
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Other CBS	0	0	3	MayYr 2025A. BEKKEROther CBS	1
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (out-patient)	57	38	3	MayYr 2025A. BEKKERStellenbosch Provincial Hospital (out-patient)	1
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (in-patient)	8	8	0	MayYr 2025A. BEKKERStellenbosch Provincial Hospital (in-patient)	1
May	Yr 2025	A. BEKKER	Occupational Therapist	Stellenbosch	Stellenbosch Intermediate Care Facility	12	12	0	MayYr 2025A. BEKKERStellenbosch Intermediate Care Facility	1
May	Yr 2025	US 4TH YEAR STUDENT	Occupational Therapist	Stellenbosch	Stellenbosch Intermediate Care Facility	33	33	0	MayYr 2025US 4TH YEAR STUDENTStellenbosch Intermediate Care Facility	1
May	Yr 2025	US 4TH YEAR STUDENT	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (in-patient)	11	11	0	MayYr 2025US 4TH YEAR STUDENTStellenbosch Provincial Hospital (in-patient)	1
May	Yr 2025	US 4TH YEAR STUDENT	Occupational Therapist	Stellenbosch	Stellenbosch Provincial Hospital (out-patient)	9	7	0	MayYr 2025US 4TH YEAR STUDENTStellenbosch Provincial Hospital (out-patient)	1
