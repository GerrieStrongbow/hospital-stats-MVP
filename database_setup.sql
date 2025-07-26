-- Hospital Stats MVP Database Setup
-- Execute this SQL in your Supabase SQL Editor

-- 1. Create patient_records table for storing individual patient data entries
CREATE TABLE patient_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    patient_identifier TEXT NOT NULL,
    age_group TEXT NOT NULL CHECK (age_group IN ('<18', '>18')),
    facility TEXT NOT NULL,
    facility_type TEXT NOT NULL CHECK (facility_type IN ('in-hospital', 'out-hospital', 'icf', 'phc')),
    appointment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    appointment_type TEXT NOT NULL CHECK (appointment_type IN ('new', 'repeat')),
    referral_source TEXT NOT NULL CHECK (referral_source IN ('hospital', 'phc', 'cbs', 'other')),
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
    
    -- Ensure patient_identifier is unique per user
    UNIQUE(user_id, patient_identifier)
);

-- 2. Create backend_aggregation table for monthly reports (matches requirements exactly)
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
    
    -- Unique constraint to prevent duplicate aggregations
    UNIQUE(month, year, therapist_name, therapist_type, sub_district, facility, type_of_patients, referred_from, age_or_repeat, tx_or_tx_d)
);

-- 3. Create booked_numbers table for booking statistics (matches requirements exactly)
CREATE TABLE booked_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    month TEXT NOT NULL,
    year TEXT NOT NULL,
    therapist_name TEXT NOT NULL,
    therapist_type TEXT NOT NULL,
    sub_district TEXT NOT NULL,
    facility TEXT NOT NULL,
    total_booked INTEGER NOT NULL DEFAULT 0,
    booked_seen INTEGER NOT NULL DEFAULT 0,
    unbooked_seen INTEGER NOT NULL DEFAULT 0,
    concatenated_row TEXT,
    count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique constraint to prevent duplicate entries
    UNIQUE(month, year, therapist_name, therapist_type, sub_district, facility)
);

-- 4. Create indexes for better performance
CREATE INDEX idx_patient_records_user_id ON patient_records(user_id);
CREATE INDEX idx_patient_records_date ON patient_records(appointment_date);
CREATE INDEX idx_patient_records_facility ON patient_records(facility);
CREATE INDEX idx_patient_records_sync ON patient_records(synced_at);

CREATE INDEX idx_backend_aggregation_therapist ON backend_aggregation(therapist_name, month, year);
CREATE INDEX idx_backend_aggregation_facility ON backend_aggregation(facility, month, year);

CREATE INDEX idx_booked_numbers_therapist ON booked_numbers(therapist_name, month, year);
CREATE INDEX idx_booked_numbers_facility ON booked_numbers(facility, month, year);

-- 5. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Create trigger for patient_records updated_at
CREATE TRIGGER update_patient_records_updated_at 
    BEFORE UPDATE ON patient_records 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable Row Level Security (RLS) on patient_records
ALTER TABLE patient_records ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS policies for patient_records
-- Users can only see their own patient records
CREATE POLICY "Users can view own patient records" ON patient_records
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own patient records
CREATE POLICY "Users can insert own patient records" ON patient_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own patient records
CREATE POLICY "Users can update own patient records" ON patient_records
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can delete their own patient records
CREATE POLICY "Users can delete own patient records" ON patient_records
    FOR DELETE USING (auth.uid() = user_id);

-- 9. Create a user_profiles table to store additional user information
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    therapist_type TEXT NOT NULL,
    employment_status TEXT NOT NULL CHECK (employment_status IN ('full-time', 'community-service', 'student')),
    sub_district TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Create trigger for user_profiles updated_at
CREATE TRIGGER update_user_profiles_updated_at 
    BEFORE UPDATE ON user_profiles 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 10. Create aggregation tables with proper RLS (therapists can see their own aggregations)
ALTER TABLE backend_aggregation ENABLE ROW LEVEL SECURITY;
ALTER TABLE booked_numbers ENABLE ROW LEVEL SECURITY;

-- RLS policies for aggregation tables based on therapist name matching user profile
CREATE POLICY "Users can view own aggregations" ON backend_aggregation
    FOR SELECT USING (
        therapist_name = (
            SELECT CONCAT(first_name, ' ', last_name) 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can view own booking numbers" ON booked_numbers
    FOR SELECT USING (
        therapist_name = (
            SELECT CONCAT(first_name, ' ', last_name) 
            FROM user_profiles 
            WHERE id = auth.uid()
        )
    );

-- Insert/Update policies for aggregation tables (system level, might need service role)
CREATE POLICY "System can manage aggregations" ON backend_aggregation
    FOR ALL USING (true);

CREATE POLICY "System can manage booking numbers" ON booked_numbers
    FOR ALL USING (true);