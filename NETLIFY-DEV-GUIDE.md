# Netlify Development Guide

## ✅ Local Testing Solution

With Node.js v22.12.0 installed via nvm, you can now test locally!

### Start Local Development

**Open 2 terminals:**

**Terminal 1** - Start Angular:
```powershell
# Make sure you're using Node v22.12.0
nvm use 22.12.0
npm start
```

**Terminal 2** - Start Netlify Functions (after Angular compiles):
```powershell
npx netlify functions:serve
```

Your app will be at:
- **Frontend**: http://localhost:4200  
- **API Functions**: http://localhost:9999/.netlify/functions/*

The services automatically detect localhost and use the correct API URL! ✅

### Local Storage

Functions use local JSON files (`.local-storage/`) for development and Netlify Blobs in production. This means:
- ✅ Submit reviews locally
- ✅ Change theme colors locally  
- ✅ Test everything without deploying
- 📁 Data stored in `.local-storage/` (git-ignored)

### Switching Node Versions

```powershell
# For testing this project (Angular 20.3)
nvm use 22.12.0

# Switch back to your old version
nvm use 20.15.0

# List all installed versions
nvm list
```

## Issue Fixed ✅

The "failed to submit review" error was caused by missing CORS headers in the Netlify Functions. This has been fixed!

## What Changed

1. **CORS Headers Added**: All 5 Netlify Functions now include proper CORS headers:
   - `Access-Control-Allow-Origin: *`
   - `Access-Control-Allow-Headers: Content-Type`
   - `Access-Control-Allow-Methods: GET/POST, OPTIONS`

2. **Netlify CLI Installed**: Added `netlify-cli` as a dev dependency

3. **New Scripts**: Added development scripts to [package.json](package.json):
   - `npm run dev` - Runs Netlify dev server (localhost only)
   - `npm run dev:mobile` - Runs Netlify dev server (accessible on network)

## How to Test Locally

### Option 1: With Netlify Functions (Recommended for Testing Reviews)

```bash
npm run dev
```

This will:
- Start Angular dev server on `http://localhost:4200`
- Start Netlify Functions on `http://localhost:8888/.netlify/functions/*`  
- Automatically proxy API calls to Functions

**Test the review form at:** `http://localhost:8888/add-review`

### Option 2: Without Netlify Functions (Current `npm start`)

```bash
npm start
```

This runs Angular only without Functions support. The review submission will fail because there's no API backend.

## Environment Variables

For production, set this in Netlify dashboard:
- `ADMIN_PASSWORD` - Password for admin access (default: `admin123`)

For local development, create a `.env` file:
```
ADMIN_PASSWORD=your_admin_password_here
```

## Testing Checklist

1. ✅ Submit a review from `/add-review`
2. ✅ View reviews on home page
3. ✅ Refresh reviews manually using "Load More" button
4. ✅ Access admin at `/admin` with password
5. ✅ Update theme colors and see changes live
6. ✅ Delete reviews from admin panel

## Deployment

When you deploy to Netlify, everything will work automatically:
- Functions are deployed to `/.netlify/functions/*`
- Environment variables from dashboard are used
- CORS headers allow your frontend to call the APIs
- Netlify Blobs storage is available (1GB free tier)

## Notes

- The `dev` scripts use Netlify dev server which includes both Angular and Functions
- The `start` scripts use only Angular (no Functions, reviews won't work)
- Always use `npm run dev` when testing reviews or theme features
- CORS is now properly configured for all API endpoints
