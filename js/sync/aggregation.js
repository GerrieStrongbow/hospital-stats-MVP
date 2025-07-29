// Hospital Stats MVP - Data Aggregation Module
(function(window) {
    'use strict';
    
    const Aggregation = {
        // Module state
        isAggregating: false,
        
        // Initialize the module
        init() {
            console.log('Aggregation module initializing...');
        },
        
        // Main aggregation function - processes all patient records
        async aggregatePatientData(userId) {
            if (this.isAggregating) {
                console.log('Aggregation already in progress, skipping');
                return { success: false, message: 'Aggregation already in progress' };
            }
            
            console.log('Starting data aggregation for user:', userId);
            this.isAggregating = true;
            
            try {
                const supabase = State.get('supabase');
                const user = State.get('user');
                
                if (!supabase || !user) {
                    throw new Error('Database connection or user not available');
                }
                
                // Get all patient records for the user
                const { data: patientRecords, error: recordsError } = await supabase
                    .from('patient_records')
                    .select('*')
                    .eq('user_id', userId);
                
                if (recordsError) throw recordsError;
                
                if (!patientRecords || patientRecords.length === 0) {
                    console.log('No patient records found for aggregation');
                    return { success: true, message: 'No records to aggregate' };
                }
                
                // Get user profile for therapist info
                const { data: userProfile, error: profileError } = await supabase
                    .from('user_profiles')
                    .select('*')
                    .eq('id', userId)
                    .single();
                
                if (profileError) throw profileError;
                
                // Group records by month/year
                const groupedRecords = this.groupRecordsByMonth(patientRecords);
                
                // Process each month
                const results = {
                    aggregatedMonths: 0,
                    backendRecords: 0,
                    bookedNumbersRecords: 0,
                    errors: []
                };
                
                for (const [monthYear, records] of Object.entries(groupedRecords)) {
                    try {
                        const [month, year] = monthYear.split('-');
                        
                        // Generate backend aggregation data
                        const backendData = this.generateBackendAggregation(records, userProfile, month, year);
                        
                        // Generate booked numbers data
                        const bookedData = this.generateBookedNumbers(records, userProfile, month, year);
                        
                        // Save to database
                        await this.saveBackendAggregation(backendData);
                        await this.saveBookedNumbers(bookedData);
                        
                        results.aggregatedMonths++;
                        results.backendRecords += backendData.length;
                        results.bookedNumbersRecords += bookedData.length;
                        
                        console.log(`Aggregated data for ${month} ${year}: ${backendData.length} backend records, ${bookedData.length} booked records`);
                        
                    } catch (error) {
                        console.error(`Failed to aggregate data for ${monthYear}:`, error);
                        results.errors.push(`${monthYear}: ${error.message}`);
                    }
                }
                
                console.log('Aggregation completed:', results);
                return {
                    success: true,
                    message: `Aggregated ${results.aggregatedMonths} months`,
                    ...results
                };
                
            } catch (error) {
                console.error('Aggregation process failed:', error);
                return {
                    success: false,
                    message: 'Aggregation failed: ' + error.message
                };
                
            } finally {
                this.isAggregating = false;
            }
        },
        
        // Group patient records by month and year
        groupRecordsByMonth(records) {
            const grouped = {};
            
            records.forEach(record => {
                const date = new Date(record.appointment_date);
                const month = date.toLocaleString('default', { month: 'long' });
                const year = `Yr ${date.getFullYear()}`;
                const key = `${month}-${year}`;
                
                if (!grouped[key]) {
                    grouped[key] = [];
                }
                
                grouped[key].push(record);
            });
            
            return grouped;
        },
        
        // Generate backend aggregation data
        generateBackendAggregation(records, userProfile, month, year) {
            const therapistName = `${userProfile.first_name} ${userProfile.last_name}`;
            const aggregationData = [];
            
            // Create aggregation buckets based on requirements
            const buckets = this.createAggregationBuckets();
            
            // Process each record
            records.forEach(record => {
                const classification = this.classifyRecord(record);
                
                // Find or create the appropriate bucket
                const bucketKey = this.getBucketKey(classification);
                
                if (!buckets[bucketKey]) {
                    buckets[bucketKey] = {
                        month: month,
                        year: year,
                        therapist_name: therapistName,
                        therapist_type: userProfile.therapist_type,
                        sub_district: userProfile.sub_district,
                        facility: classification.facility,
                        platform: classification.platform || '',
                        type_of_patients: classification.type_of_patients,
                        referred_from: classification.referred_from,
                        age_or_repeat: classification.age_or_repeat,
                        tx_or_tx_d: classification.tx_or_tx_d,
                        totals: 0
                    };
                }
                
                buckets[bucketKey].totals++;
            });
            
            // Convert buckets to array
            Object.values(buckets).forEach(bucket => {
                if (bucket.totals > 0) {
                    aggregationData.push(bucket);
                }
            });
            
            return aggregationData;
        },
        
        // Generate booked numbers data
        generateBookedNumbers(records, userProfile, month, year) {
            const therapistName = `${userProfile.first_name} ${userProfile.last_name}`;
            const facilityGroups = {};
            
            // Group by facility
            records.forEach(record => {
                const facility = this.normalizeFacilityName(record.facility, record.facility_type);
                
                if (!facilityGroups[facility]) {
                    facilityGroups[facility] = {
                        month: month,
                        year: year,
                        therapist_name: therapistName,
                        therapist_type: userProfile.therapist_type,
                        sub_district: userProfile.sub_district,
                        facility: facility,
                        total_booked: 0,
                        booked_seen: 0,
                        unbooked_seen: 0,
                        concatenated_row: '',
                        count: 0
                    };
                }
                
                const attendanceCategory = this.categorizeAttendance(record.attendance);
                
                // Update counts based on attendance
                switch (attendanceCategory) {
                    case 'booked_seen':
                        facilityGroups[facility].total_booked++;
                        facilityGroups[facility].booked_seen++;
                        break;
                    case 'unbooked_seen':
                        facilityGroups[facility].unbooked_seen++;
                        break;
                    case 'total_booked':
                        facilityGroups[facility].total_booked++;
                        break;
                }
            });
            
            // Generate concatenated rows and set count
            Object.values(facilityGroups).forEach(group => {
                group.concatenated_row = `${month}${year}${therapistName}${group.facility}`;
                group.count = 1; // Each facility gets count of 1 as per requirements
            });
            
            return Object.values(facilityGroups);
        },
        
        // Classify a patient record for aggregation
        classifyRecord(record) {
            return {
                facility: this.normalizeFacilityName(record.facility, record.facility_type),
                platform: this.getPlatform(record),
                type_of_patients: this.getTypeOfPatients(record.appointment_type),
                referred_from: this.getReferredFrom(record.referral_source),
                age_or_repeat: this.getAgeOrRepeat(record.appointment_type, record.age_group),
                tx_or_tx_d: this.getTxOrTxD(record.assistive_devices)
            };
        },
        
        // Normalize facility name based on type
        normalizeFacilityName(facility, facilityType) {
            switch (facilityType) {
                case 'in-hospital':
                    return `${facility} (in-patient)`;
                case 'out-hospital':
                    return `${facility} (out-patient)`;
                case 'icf':
                    return facility; // ICF facilities keep their name
                case 'phc':
                    return facility; // PHC clinics keep their name
                default:
                    return facility;
            }
        },
        
        // Get platform (currently empty in requirements)
        getPlatform(record) {
            return ''; // Platform field is empty in all examples
        },
        
        // Get type of patients
        getTypeOfPatients(appointmentType) {
            return appointmentType === 'new' ? 'New' : 'Repeat';
        },
        
        // Get referred from classification
        getReferredFrom(referralSource) {
            switch (referralSource) {
                case 'hospital':
                    return 'Hosp';
                case 'phc':
                    return 'PHC';
                case 'cbs':
                    return 'CBS';
                case 'other':
                    return 'Other';
                default:
                    return 'Other';
            }
        },
        
        // Get age or repeat classification
        getAgeOrRepeat(appointmentType, ageGroup) {
            if (appointmentType === 'repeat') {
                return 'Repeat';
            }
            return ageGroup; // '<18' or '>18'
        },
        
        // Determine Tx vs Tx+D based on assistive devices
        getTxOrTxD(assistiveDevices) {
            if (!assistiveDevices || typeof assistiveDevices !== 'object') {
                return 'Tx';
            }
            
            // Check if any assistive device was issued
            const deviceTypes = ['mobility_device', 'splint', 'wheelchair', 'other'];
            const hasDevice = deviceTypes.some(deviceType => 
                assistiveDevices[deviceType] && assistiveDevices[deviceType].used
            );
            
            return hasDevice ? 'Tx+D' : 'Tx';
        },
        
        // Categorize attendance for booked numbers
        categorizeAttendance(attendance) {
            switch (attendance) {
                case 'Attended':
                    return 'booked_seen'; // "Booked Seen"
                case 'Attended Without Appointment (Walk-in)':
                    return 'unbooked_seen'; // "Unbooked Seen"
                case 'Attended Not Treated':
                case 'Cancelled On Day':
                case 'Rescheduled':
                case 'Did Not Attend (DNA)':
                    return 'total_booked'; // Contributes to "Total Booked"
                default:
                    return 'total_booked';
            }
        },
        
        // Create empty aggregation buckets
        createAggregationBuckets() {
            return {};
        },
        
        // Generate bucket key for aggregation
        getBucketKey(classification) {
            return `${classification.facility}|${classification.type_of_patients}|${classification.referred_from}|${classification.age_or_repeat}|${classification.tx_or_tx_d}`;
        },
        
        // Save backend aggregation data to database
        async saveBackendAggregation(aggregationData) {
            if (aggregationData.length === 0) return;
            
            const supabase = State.get('supabase');
            
            try {
                // Delete existing data for this month/year/therapist to avoid duplicates
                const firstRecord = aggregationData[0];
                await supabase
                    .from('backend_aggregation')
                    .delete()
                    .eq('month', firstRecord.month)
                    .eq('year', firstRecord.year)
                    .eq('therapist_name', firstRecord.therapist_name);
                
                // Insert new aggregation data
                const { error } = await supabase
                    .from('backend_aggregation')
                    .insert(aggregationData);
                
                if (error) throw error;
                
                console.log(`Saved ${aggregationData.length} backend aggregation records`);
                
            } catch (error) {
                console.error('Failed to save backend aggregation:', error);
                throw error;
            }
        },
        
        // Save booked numbers data to database
        async saveBookedNumbers(bookedData) {
            if (bookedData.length === 0) return;
            
            const supabase = State.get('supabase');
            
            try {
                // Delete existing data for this month/year/therapist to avoid duplicates
                const firstRecord = bookedData[0];
                await supabase
                    .from('booked_numbers')
                    .delete()
                    .eq('month', firstRecord.month)
                    .eq('year', firstRecord.year)
                    .eq('therapist_name', firstRecord.therapist_name);
                
                // Insert new booked numbers data
                const { error } = await supabase
                    .from('booked_numbers')
                    .insert(bookedData);
                
                if (error) throw error;
                
                console.log(`Saved ${bookedData.length} booked numbers records`);
                
            } catch (error) {
                console.error('Failed to save booked numbers:', error);
                throw error;
            }
        },
        
        // Trigger aggregation after sync (called by sync module)
        async triggerAggregationAfterSync(userId) {
            try {
                console.log('Triggering aggregation after successful sync...');
                
                // Small delay to ensure all sync operations are complete
                setTimeout(async () => {
                    const result = await this.aggregatePatientData(userId);
                    
                    if (result.success) {
                        console.log('Post-sync aggregation completed successfully');
                    } else {
                        console.warn('Post-sync aggregation failed:', result.message);
                    }
                }, 1000);
                
            } catch (error) {
                console.error('Failed to trigger post-sync aggregation:', error);
            }
        },
        
        // Manual aggregation trigger (for UI buttons)
        async manualAggregation() {
            const user = State.get('user');
            if (!user) {
                throw new Error('User not authenticated');
            }
            
            console.log('Manual aggregation triggered');
            return await this.aggregatePatientData(user.id);
        },
        
        // Get aggregation status
        getAggregationStatus() {
            return {
                isAggregating: this.isAggregating
            };
        },
        
        // Test aggregation with sample data (for development)
        async testAggregation() {
            console.log('Testing aggregation logic...');
            
            const sampleRecord = {
                patient_identifier: 'TEST001',
                age_group: '<18',
                facility: 'Test Clinic',
                facility_type: 'phc',
                appointment_date: '2025-01-15',
                appointment_type: 'new',
                referral_source: 'phc',
                attendance: 'Attended',
                assistive_devices: {
                    wheelchair: { used: true, details: { funding_source: 'new' } }
                }
            };
            
            const classification = this.classifyRecord(sampleRecord);
            console.log('Sample record classification:', classification);
            
            const attendanceCategory = this.categorizeAttendance(sampleRecord.attendance);
            console.log('Sample attendance category:', attendanceCategory);
            
            return {
                classification,
                attendanceCategory,
                txOrTxD: this.getTxOrTxD(sampleRecord.assistive_devices)
            };
        }
    };
    
    // Export to global scope
    window.Aggregation = Aggregation;
    
    // Auto-initialize when module loads
    Aggregation.init();
    
    console.log('Aggregation module loaded');
    
})(window);