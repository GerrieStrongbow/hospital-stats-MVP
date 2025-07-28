# Hospital Stats MVP - Database Schema Documentation

## Overview

This document provides comprehensive documentation of the Hospital Stats MVP database schema, data models, and relationships. The application uses Supabase (PostgreSQL) as the primary database with Row Level Security (RLS) for data isolation.

## Table of Contents

- [Database Structure](#database-structure)
- [Table Definitions](#table-definitions)
- [Data Models](#data-models)
- [Relationships](#relationships)
- [Security Policies](#security-policies)
- [Constraints and Validations](#constraints-and-validations)
- [Indexing Strategy](#indexing-strategy)
- [Data Flow](#data-flow)

---

## Database Structure

### Architecture Overview

```
┌─────────────────────┐
│   Supabase Auth     │ ── User Authentication
│   (auth.users)      │
└─────────────────────┘
           │
           ├── user_profiles (1:1)
           │
           └── patient_records (1:Many)
                    │
                    └── backend_aggregation (Derived)
                         │
                         └── booked_numbers (Derived)
```

### Database Components

1. **Authentication**: Supabase Auth system
2. **User Data**: `user_profiles` table
3. **Core Data**: `patient_records` table  
4. **Reporting**: `backend_aggregation` and `booked_numbers` tables
5. **Security**: Row Level Security (RLS) policies

---

## Table Definitions

### 1. user_profiles

Stores additional user information beyond Supabase Auth.

```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    surname TEXT NOT NULL,
    therapist_type TEXT NOT NULL CHECK (therapist_type IN (
        'Physiotherapist',
        'Occupational Therapist', 
        'Speech Therapist',
        'Audiologist'
    )),
    employment_status TEXT NOT NULL CHECK (employment_status IN (
        'full-time',
        'community-service', 
        'student'
    )),
    sub_district TEXT NOT NULL CHECK (sub_district IN (
        'Breede Valley',
        'Drakenstein',
        'Langeberg', 
        'Stellenbosch',
        'Witzenberg'
    )),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Purpose**: Store therapist profile information for registration and reporting.

**Key Features**:
- Links to Supabase Auth via foreign key
- Enforces valid therapist types and sub-districts
- Tracks creation and modification times

### 2. patient_records

Core table storing individual patient treatment records.

```sql
CREATE TABLE patient_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_identifier TEXT NOT NULL,
    age_group TEXT NOT NULL CHECK (age_group IN ('<18', '>18')),
    facility TEXT NOT NULL,
    facility_type TEXT NOT NULL CHECK (facility_type IN (
        'in-hospital', 
        'out-hospital', 
        'icf', 
        'phc'
    )),
    appointment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    appointment_type TEXT NOT NULL CHECK (appointment_type IN ('new', 'repeat')),
    referral_source TEXT NOT NULL CHECK (referral_source IN (
        'hospital', 
        'phc', 
        'cbs', 
        'other'
    )),
    referral_source_other TEXT,
    clinical_area TEXT NOT NULL,
    clinical_area_other TEXT,
    attendance TEXT NOT NULL,
    disposal TEXT NOT NULL,
    outcome TEXT NOT NULL,
    duration_minutes INTEGER,
    activities TEXT[] DEFAULT '{}',
    assistive_devices JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    synced_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    UNIQUE(user_id, patient_identifier),
    CHECK (duration_minutes > 0 AND duration_minutes <= 480),
    CHECK (appointment_date <= CURRENT_DATE)
);
```

**Purpose**: Store individual patient treatment sessions and outcomes.

**Key Features**:
- Unique patient identifiers per user
- Comprehensive treatment data
- JSONB for flexible assistive device storage
- Text arrays for multiple activities
- Sync tracking for offline functionality

### 3. backend_aggregation

Monthly aggregated reporting data matching department requirements.

```sql
CREATE TABLE backend_aggregation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    therapist_name TEXT NOT NULL,
    therapist_type TEXT NOT NULL,
    sub_district TEXT NOT NULL,
    facility TEXT NOT NULL,
    platform TEXT,
    type_of_patients TEXT NOT NULL,
    referred_from TEXT NOT NULL,
    age_or_repeat TEXT NOT NULL,
    tx_or_tx_d TEXT NOT NULL,
    totals INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate aggregations
    UNIQUE(month, year, therapist_name, therapist_type, sub_district, 
           facility, type_of_patients, referred_from, age_or_repeat, tx_or_tx_d)
);
```

**Purpose**: Store monthly aggregated statistics for department reporting.

**Key Features**:
- Matches exact department reporting format
- Prevents duplicate aggregations
- Tracks totals for each category combination

### 4. booked_numbers

Monthly booking statistics for capacity planning.

```sql
CREATE TABLE booked_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    therapist_name TEXT NOT NULL,
    therapist_type TEXT NOT NULL,
    sub_district TEXT NOT NULL,
    facility TEXT NOT NULL,
    type_of_patients TEXT NOT NULL,
    new_total INTEGER NOT NULL DEFAULT 0,
    repeat_total INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate booking records
    UNIQUE(month, year, therapist_name, therapist_type, sub_district, 
           facility, type_of_patients)
);
```

**Purpose**: Track monthly booking numbers for new vs. repeat patients.

**Key Features**:
- Separate totals for new and repeat appointments
- Organized by therapist and facility
- Monthly reporting structure

---

## Data Models

### Patient Record Model

**JavaScript Object Structure:**
```javascript
{
    // Database Fields
    id: "550e8400-e29b-41d4-a716-446655440000",
    user_id: "550e8400-e29b-41d4-a716-446655440001", 
    patient_identifier: "JD2025001",
    age_group: "<18",
    facility: "Avian Park Clinic",
    facility_type: "phc",
    appointment_date: "2025-01-15",
    appointment_type: "new",
    referral_source: "hospital",
    referral_source_other: null,
    clinical_area: "Neurology",
    clinical_area_other: null,
    attendance: "Attended",
    disposal: "Completed Treatment",
    outcome: "Improved",
    duration_minutes: 45,
    activities: ["Assessment", "Treatment", "Education"],
    assistive_devices: {
        "wheelchair": {
            "used": true,
            "details": {
                "type": "Standard",
                "condition": "Good"
            }
        }
    },
    created_at: "2025-01-15T10:30:00.000Z",
    updated_at: "2025-01-15T10:30:00.000Z",
    synced_at: "2025-01-15T10:31:00.000Z",
    
    // Application Fields (not in database)
    source: "supabase",
    syncStatus: "synced",
    local_id: null // Only for localStorage records
}
```

### User Profile Model

**JavaScript Object Structure:**
```javascript
{
    id: "550e8400-e29b-41d4-a716-446655440001",
    name: "Jane",
    surname: "Doe", 
    therapist_type: "Physiotherapist",
    employment_status: "full-time",
    sub_district: "Stellenbosch",
    created_at: "2025-01-10T08:00:00.000Z",
    updated_at: "2025-01-10T08:00:00.000Z",
    
    // From auth.users (via join or session)
    email: "jane.doe@westerncape.gov.za"
}
```

### Aggregation Model

**JavaScript Object Structure:**
```javascript
{
    id: "550e8400-e29b-41d4-a716-446655440002",
    month: "January",
    year: "2025",
    therapist_name: "Jane Doe",
    therapist_type: "Physiotherapist", 
    sub_district: "Stellenbosch",
    facility: "Stellenbosch Hospital",
    platform: "Hospital Stats MVP",
    type_of_patients: "Neuro",
    referred_from: "Hospital",
    age_or_repeat: "<18",
    tx_or_tx_d: "Tx",
    totals: 15,
    created_at: "2025-02-01T00:00:00.000Z"
}
```

---

## Relationships

### Entity Relationship Diagram

```
auth.users (Supabase)
    │
    ├─── user_profiles (1:1)
    │    ├── id (FK to auth.users.id)
    │    ├── name
    │    ├── surname  
    │    ├── therapist_type
    │    ├── employment_status
    │    └── sub_district
    │
    └─── patient_records (1:Many)
         ├── id (PK)
         ├── user_id (FK to auth.users.id)
         ├── patient_identifier (Unique per user)
         ├── treatment_data...
         └── timestamps
         
patient_records ──(aggregated)──> backend_aggregation
                 └─(aggregated)──> booked_numbers
```

### Relationship Details

1. **auth.users ↔ user_profiles (1:1)**
   - Each authenticated user has one profile
   - Profile deleted when user is deleted (CASCADE)

2. **auth.users ↔ patient_records (1:Many)**  
   - Each user can have multiple patient records
   - Records deleted when user is deleted (CASCADE)
   - Patient identifiers unique per user

3. **patient_records → backend_aggregation (Many:Many)**
   - Patient records aggregated into monthly reports
   - One patient record can contribute to multiple aggregation rows
   - Aggregation computed from patient records

4. **patient_records → booked_numbers (Many:Many)**
   - Patient records contribute to booking statistics
   - Monthly aggregation of new vs. repeat appointments

---

## Security Policies

### Row Level Security (RLS)

All tables have RLS enabled to ensure data isolation between users.

#### user_profiles Policies

```sql
-- Users can only view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

-- Users can insert their own profile  
CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles  
    FOR UPDATE USING (auth.uid() = id);
```

#### patient_records Policies

```sql
-- Users can only access their own patient records
CREATE POLICY "Users can view own records" ON patient_records
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own records
CREATE POLICY "Users can insert own records" ON patient_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own records  
CREATE POLICY "Users can update own records" ON patient_records
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own records
CREATE POLICY "Users can delete own records" ON patient_records  
    FOR DELETE USING (auth.uid() = user_id);
```

#### Aggregation Table Policies

```sql
-- Read-only access to aggregation data (for reports)
CREATE POLICY "Authenticated users can view aggregations" ON backend_aggregation
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can view booking numbers" ON booked_numbers
    FOR SELECT TO authenticated USING (true);
```

---

## Constraints and Validations

### Data Integrity Constraints

#### patient_records Table

1. **Unique Constraints**:
   - `(user_id, patient_identifier)`: Unique patient IDs per user
   
2. **Check Constraints**:
   - `age_group IN ('<18', '>18')`: Valid age groups only
   - `facility_type IN ('in-hospital', 'out-hospital', 'icf', 'phc')`: Valid facility types
   - `appointment_type IN ('new', 'repeat')`: Valid appointment types  
   - `referral_source IN ('hospital', 'phc', 'cbs', 'other')`: Valid referral sources
   - `duration_minutes > 0 AND duration_minutes <= 480`: Reasonable duration (8 hours max)
   - `appointment_date <= CURRENT_DATE`: No future appointments

3. **Foreign Key Constraints**:
   - `user_id REFERENCES auth.users(id) ON DELETE CASCADE`: User relationship

#### user_profiles Table

1. **Check Constraints**:
   - `therapist_type IN (...)`: Valid therapist types only
   - `employment_status IN (...)`: Valid employment statuses only  
   - `sub_district IN (...)`: Valid sub-districts only

2. **Foreign Key Constraints**:
   - `id REFERENCES auth.users(id) ON DELETE CASCADE`: User relationship

### Application-Level Validations

#### JavaScript Validations (Client-Side)

```javascript
// Patient ID validation
const PATIENT_ID_PATTERN = /^[A-Za-z0-9_-]+$/;
const MIN_LENGTH = 2;
const MAX_LENGTH = 20;

// Duration validation  
const MIN_DURATION = 1;
const MAX_DURATION = 480; // 8 hours

// Date validation
const isValidDate = (date) => {
    const appointmentDate = new Date(date);
    const today = new Date();
    return appointmentDate <= today;
};
```

---

## Indexing Strategy

### Primary Indexes

All tables have primary key indexes automatically:
- `patient_records.id` (UUID, clustered)
- `user_profiles.id` (UUID, clustered)  
- `backend_aggregation.id` (UUID, clustered)
- `booked_numbers.id` (UUID, clustered)

### Secondary Indexes

**Recommended Indexes for Performance:**

```sql
-- Patient records by user (most common query)
CREATE INDEX idx_patient_records_user_id ON patient_records(user_id);

-- Patient records by date (for date range queries)
CREATE INDEX idx_patient_records_date ON patient_records(appointment_date);

-- Patient records by identifier (for uniqueness and lookups)
CREATE INDEX idx_patient_records_identifier ON patient_records(user_id, patient_identifier);

-- Aggregation data by period
CREATE INDEX idx_backend_aggregation_period ON backend_aggregation(year, month);

-- Booking numbers by period  
CREATE INDEX idx_booked_numbers_period ON booked_numbers(year, month);
```

### Query Optimization

**Common Query Patterns:**

1. **User's Patient Records**:
   ```sql
   SELECT * FROM patient_records 
   WHERE user_id = $1 
   ORDER BY appointment_date DESC;
   ```

2. **Patient Search**:
   ```sql
   SELECT * FROM patient_records 
   WHERE user_id = $1 
   AND patient_identifier ILIKE '%' || $2 || '%';
   ```

3. **Date Range Queries**:
   ```sql
   SELECT * FROM patient_records 
   WHERE user_id = $1 
   AND appointment_date BETWEEN $2 AND $3;
   ```

---

## Data Flow

### Data Lifecycle

```
User Input (Form)
       ↓
JavaScript Validation
       ↓
Local Storage (Offline)
       ↓
Network Available?
    ┌─ No ─→ Store Locally
    └─ Yes ─→ Supabase Insert/Update
              ↓
         RLS Policy Check
              ↓
         Database Storage
              ↓
         Background Aggregation
         (backend_aggregation, booked_numbers)
```

### Synchronization Flow

```
Application Startup
       ↓
Fetch from Supabase (user_id filter)
       ↓
Merge with Local Storage
       ↓
Resolve Conflicts (last-write-wins)
       ↓
Update Local Storage
       ↓
Background Sync (every 5 minutes)
```

### Aggregation Process

```
Patient Records
       ↓
Monthly Batch Job
       ↓
Group by (therapist, facility, type, etc.)
       ↓
Calculate Totals
       ↓
Insert/Update backend_aggregation
       ↓
Calculate Booking Numbers
       ↓
Insert/Update booked_numbers
```

---

## Migration Scripts

### Initial Setup

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE backend_aggregation ENABLE ROW LEVEL SECURITY; 
ALTER TABLE booked_numbers ENABLE ROW LEVEL SECURITY;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_records_updated_at  
    BEFORE UPDATE ON patient_records
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### Data Migration Considerations

1. **Backup Strategy**: Always backup before schema changes
2. **Rollback Plan**: Keep rollback scripts for each migration
3. **Testing**: Test migrations on staging environment first
4. **User Communication**: Notify users of any downtime

---

## Performance Considerations

### Query Performance

1. **Use Appropriate Indexes**: Ensure queries use existing indexes
2. **Limit Result Sets**: Use pagination for large datasets  
3. **Optimize Joins**: Minimize unnecessary table joins
4. **Cache Aggregations**: Pre-compute monthly statistics

### Storage Optimization

1. **JSONB Indexing**: Index frequently queried JSONB fields
2. **Text Arrays**: More efficient than separate tables for simple lists
3. **Archiving**: Consider archiving old records for performance

### Monitoring

1. **Query Performance**: Monitor slow queries
2. **Index Usage**: Check index hit rates
3. **Storage Growth**: Track table sizes over time
4. **Connection Pooling**: Manage database connections efficiently

---

This database schema documentation provides a comprehensive reference for understanding the Hospital Stats MVP data architecture, relationships, and constraints. For implementation details, refer to the `database_setup.sql` file in the project root.