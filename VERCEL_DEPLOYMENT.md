# Vercel Deployment Guide

## Overview
Hospital Stats MVP is configured for deployment on Vercel with the following optimizations:

## What's Included

### 1. **vercel.json Configuration**
- SPA routing configuration (all routes redirect to index.html)
- Service Worker cache headers for offline functionality
- Security headers (X-Content-Type-Options, X-Frame-Options, X-XSS-Protection)

### 2. **Enhanced Network Detection**
- Improved online/offline detection to prevent false "database offline" messages
- Actual connectivity verification using manifest.json fetch
- Graceful fallback to navigator.onLine

### 3. **Sync Status Indicator**
- Visual indicator in bottom-right corner showing:
  - Online (green dot) / Offline (red dot) / Syncing (blue pulsing dot)
  - Number of pending records to sync (orange badge)
  - Updates automatically every 5 seconds

### 4. **Environment Variables**
Since this is an MVP, the Supabase credentials are configured in `config.js` for client-side access. For production, consider:
- Using Vercel environment variables
- Implementing a backend API to handle database operations
- Using Vercel Edge Functions for secure database access

## Deployment Steps

1. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository

2. **Configure Project**
   - Framework Preset: Other (no build step required)
   - Root Directory: ./
   - Build Command: (leave empty)
   - Output Directory: ./

3. **Deploy**
   - Click "Deploy"
   - Your app will be available at your-project.vercel.app

## Features Working on Vercel

✅ **Progressive Web App (PWA)**
- Install prompt
- Offline functionality
- Service Worker caching

✅ **Database Sync**
- Real-time sync with Supabase
- Offline queue management
- Auto-sync when connection restored

✅ **Authentication**
- Supabase Auth integration
- Session persistence
- Secure user management

## Monitoring

The sync status indicator shows:
- **Green dot + "Online"**: Connected to internet and database
- **Red dot + "Offline"**: No internet connection
- **Blue pulsing dot + "Syncing..."**: Currently syncing data
- **Orange badge with number**: Count of records pending sync

## Troubleshooting

### "Database is offline" but data is saving
This was fixed by improving network detection. The app now:
1. Verifies actual connectivity (not just navigator.onLine)
2. Shows accurate status in the sync indicator
3. Continues to work offline with local storage

### CORS Issues
The vercel.json configuration handles SPA routing. No CORS issues should occur.

### Service Worker Updates
Service Worker is configured with `Cache-Control: public, max-age=0, must-revalidate` to ensure updates are detected promptly.

## Next Steps for Production

1. **Environment Variables**
   - Move credentials to Vercel environment variables
   - Create API routes for database operations

2. **Security**
   - Implement Row Level Security (RLS) in Supabase
   - Add API rate limiting
   - Enable CORS restrictions

3. **Performance**
   - Add Vercel Analytics
   - Implement lazy loading for routes
   - Optimize bundle size with code splitting

4. **Monitoring**
   - Set up error tracking (Sentry)
   - Add performance monitoring
   - Configure uptime monitoring