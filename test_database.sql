-- Hospital Stats MVP - Database Test Suite
-- Run this after executing database_setup.sql to verify everything works

-- Test 1: Verify all tables were created
SELECT 'TEST 1: Checking table creation' as test_name;
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('patient_records', 'backend_aggregation', 'booked_numbers', 'user_profiles')
ORDER BY table_name;

-- Test 2: Verify all indexes were created
SELECT 'TEST 2: Checking indexes' as test_name;
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND tablename IN ('patient_records', 'backend_aggregation', 'booked_numbers', 'user_profiles')
ORDER BY tablename, indexname;

-- Test 3: Verify RLS is enabled
SELECT 'TEST 3: Checking Row Level Security' as test_name;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('patient_records', 'backend_aggregation', 'booked_numbers', 'user_profiles');

-- Test 4: Verify policies exist
SELECT 'TEST 4: Checking RLS Policies' as test_name;
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test 5: Verify triggers exist
SELECT 'TEST 5: Checking Triggers' as test_name;
SELECT event_object_table, trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE event_object_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Test 6: Verify column constraints
SELECT 'TEST 6: Checking Column Constraints' as test_name;
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name IN ('patient_records', 'backend_aggregation', 'booked_numbers', 'user_profiles')
ORDER BY table_name, ordinal_position;

-- Test 7: Verify check constraints
SELECT 'TEST 7: Checking Check Constraints' as test_name;
SELECT cc.constraint_name, tc.table_name, cc.check_clause
FROM information_schema.check_constraints cc
JOIN information_schema.table_constraints tc ON cc.constraint_name = tc.constraint_name
WHERE tc.constraint_schema = 'public' AND tc.constraint_type = 'CHECK'
ORDER BY tc.table_name, cc.constraint_name;

-- Test 8: Verify foreign key constraints
SELECT 'TEST 8: Checking Foreign Key Constraints' as test_name;
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_name;

-- Test 9: Test basic insert/select operations (this will only work if you're authenticated)
-- Note: This test will fail if no user is authenticated, which is expected
SELECT 'TEST 9: Testing basic operations (requires authentication)' as test_name;

-- This should return empty results since no user is authenticated in SQL editor
SELECT COUNT(*) as patient_records_accessible FROM patient_records;
SELECT COUNT(*) as user_profiles_accessible FROM user_profiles;
SELECT COUNT(*) as backend_aggregation_accessible FROM backend_aggregation;
SELECT COUNT(*) as booked_numbers_accessible FROM booked_numbers;

-- Final summary
SELECT 'DATABASE SETUP VERIFICATION COMPLETE' as summary,
       'All tests above should show expected results' as note,
       'If any tables/indexes/policies are missing, re-run database_setup.sql' as troubleshooting;