// Configuration file for Hospital Stats MVP
// Note: For MVP purposes, credentials are included directly
// In production, these would be injected during build process

window.APP_CONFIG = {
    SUPABASE_URL: 'https://qnipfhctucuvqbpazmbh.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFuaXBmaGN0dWN1dnFicGF6bWJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MzYwNDksImV4cCI6MjA2OTExMjA0OX0.MnH4yRnK4kb9wtqBArmgrREJ9TvRWUccYuykX7B8WF4'
};

// Note: The anon key is safe to expose in client-side code as it only allows
// operations that are permitted by Row Level Security (RLS) policies