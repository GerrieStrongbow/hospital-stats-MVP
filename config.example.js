// Configuration file for Hospital Stats MVP
// Copy this file to config.js and fill in your actual values

window.APP_CONFIG = {
    SUPABASE_URL: 'your_supabase_project_url_here',
    SUPABASE_ANON_KEY: 'your_supabase_anon_key_here'
};

// Note: The anon key is safe to expose in client-side code as it only allows
// operations that are permitted by Row Level Security (RLS) policies

// For production builds, these values would be injected from environment variables
// during the build process, not hardcoded in the source files.