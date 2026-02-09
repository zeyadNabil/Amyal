# Vercel + Upstash Migration Guide

## 🎉 Migration Complete!

Your serverless backend has been successfully migrated from Netlify to Vercel with Upstash Redis (FREE tier).

---

## 📋 What Changed

### ✅ Files Added
- `api/` directory - New Vercel serverless functions
  - `get-reviews.ts`
  - `submit-review.ts`
  - `delete-review.ts`
  - `get-theme.ts`
  - `update-theme.ts`
  - `redis-client.ts`
  - `local-storage.ts`
- `vercel.json` - Vercel configuration
- `VERCEL-SETUP.md` - This guide

### ✅ Files Modified
- `package.json` - Updated dependencies and scripts
- `src/app/services/review.service.ts` - API endpoints updated
- `src/app/services/theme.service.ts` - API endpoints updated

### ❌ Files to Remove (Optional - after testing)
- `netlify/` directory - Old Netlify functions
- `netlify.toml` - Old Netlify configuration
- `NETLIFY-DEV-GUIDE.md` - Old guide

---

## 🚀 Setup Instructions

✅ **Status**: Upstash Redis Connected!

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Free Upstash Redis Database

#### Step 2.1: Create Upstash Account
1. Go to https://upstash.com/
2. Sign up for FREE account (GitHub/Google login available)
3. Click "Create Database"

#### Step 2.2: Configure Database
- **Name**: `amyal-redis` (or any name)
- **Type**: Regional
- **Region**: Choose closest to you
- **Plan**: FREE (10,000 commands/day)
- Click "Create"

#### Step 2.3: Get Redis Credentials
After creating database, you'll see:
- **UPSTASH_REDIS_REST_URL**
- **UPSTASH_REDIS_REST_TOKEN**

Copy these - you'll need them next!

---

### 3. Local Development Setup

Create `.env` file in project root:

```env
# Upstash Redis (for local testing with production)
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here

# Admin Password (optional - defaults to admin123)
ADMIN_PASSWORD=your_secure_password_here
```

**Note**: Local development uses file-based storage by default. Add Upstash credentials only if you want to test with production database locally.

---

### 4. Deploy to Vercel

#### Option A: One-Click Deploy (Easiest)
1. Push your code to GitHub
2. Go to https://vercel.com/
3. Click "New Project"
4. Import your GitHub repository
5. Vercel will auto-detect Angular settings
6. Click "Deploy"

#### Option B: CLI Deploy
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel
```

---

### 5. Connect Upstash to Vercel

#### Easy Way (Recommended):
1. In Vercel Dashboard → Your Project
2. Go to **Settings** → **Integrations**
3. Search for **"Upstash"**
4. Click **"Add Integration"**
5. Select your project and Upstash database
6. Click **"Connect"** - Done! ✅

Environment variables are automatically added.

#### Manual Way:
1. In Vercel Dashboard → Your Project
2. Go to **Settings** → **Environment Variables**
3. Add these variables:
   - `UPSTASH_REDIS_REST_URL` = your_url
   - `UPSTASH_REDIS_REST_TOKEN` = your_token
   - `ADMIN_PASSWORD` = your_password (optional)
4. Click "Save"
5. **Redeploy** your project for changes to take effect

---

## 🧪 Testing

### Local Development
```bash
# Start dev server (uses file storage)
npm run dev

# Or with Angular dev server
npm start
```

App runs at: http://localhost:3000
API endpoints: http://localhost:3000/api/*

### Test API Endpoints
- GET http://localhost:3000/api/get-reviews
- POST http://localhost:3000/api/submit-review
- GET http://localhost:3000/api/get-theme
- POST http://localhost:3000/api/update-theme
- POST http://localhost:3000/api/delete-review

---

## 📊 API Comparison

| Feature | Netlify | Vercel |
|---------|---------|--------|
| Functions Dir | `netlify/functions/` | `api/` |
| Local Dev | `netlify dev` | `vercel dev` |
| Dev Port | 9999 | 3000 |
| Endpoints | `/.netlify/functions/name` | `/api/name` |
| Storage | `@netlify/blobs` | `@upstash/redis` |
| Free Tier | 125K requests/month | 100GB-Hours/month |
| Data Storage | Netlify Blobs | Upstash Redis (FREE) |

---

## 🔐 Environment Variables

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `UPSTASH_REDIS_REST_URL` | Production Only | - | Redis connection URL |
| `UPSTASH_REDIS_REST_TOKEN` | Production Only | - | Redis auth token |
| `ADMIN_PASSWORD` | Optional | `admin123` | Admin panel password |

---

## 🌍 Deployment URLs

After deployment, your app will be available at:
- **Production**: `https://your-project.vercel.app`
- **API**: `https://your-project.vercel.app/api/*`

---

## 🛠️ Common Commands

```bash
# Install dependencies
npm install

# Local development (file storage)
npm run dev

# Local dev on mobile/network
npm run dev:mobile

# Build for production
npm run build

# Run Angular dev server only
npm start

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

---

## 🐛 Troubleshooting

### Issue: API returns 500 errors in production
**Solution**: Make sure Upstash environment variables are set in Vercel and you've redeployed.

### Issue: Local dev can't connect to Redis
**Solution**: Local dev uses file storage by default (`.local-storage/` folder). This is normal and expected!

### Issue: "Module not found" errors
**Solution**: Run `npm install` to install new dependencies.

### Issue: CORS errors
**Solution**: CORS is already configured in `vercel.json` and API functions. Clear browser cache.

### Issue: Reviews/theme not persisting locally
**Solution**: Check `.local-storage/` folder exists. It's created automatically on first API call.

---

## 📚 Documentation

- [Vercel Documentation](https://vercel.com/docs)
- [Upstash Redis Documentation](https://upstash.com/docs/redis)
- [Vercel CLI Documentation](https://vercel.com/docs/cli)

---

## 🎯 Next Steps

1. ✅ Complete Upstash setup
2. ✅ Deploy to Vercel
3. ✅ Connect Upstash integration
4. ✅ Test all features
5. ✅ Set custom domain (optional)
6. 🗑️ Remove old `netlify/` folder and `netlify.toml`

---

## 💡 Pro Tips

- **Free Tier Limits**: Upstash free tier gives 10,000 commands/day (plenty for your use case)
- **Monitoring**: Check Upstash dashboard to see Redis command usage
- **Backups**: Upstash free tier includes daily backups
- **Scaling**: If you outgrow free tier, upgrade is seamless
- **Custom Domain**: Add in Vercel → Settings → Domains

---

## 🎊 Migration Complete!

Your app now runs on:
- **Frontend**: Vercel (Angular)
- **Backend**: Vercel Serverless Functions
- **Database**: Upstash Redis (FREE)

All features work exactly the same as before! 🚀
