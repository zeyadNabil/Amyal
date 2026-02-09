# Theme Manager & Reviews System - Setup Guide

## 🎉 Features Implemented

### 1. **Theme Manager** (Admin Page)
- Customize website colors via admin interface
- Changes apply live to all CSS variables
- Protected by password authentication
- Auto-refresh every 10 seconds for admin

### 2. **Customer Reviews Slider**
- Beautiful slider on home page (like partners slider)
- Drag-and-swipe functionality (desktop & mobile)
- Manual refresh button to load new reviews
- Fully responsive design

### 3. **Review Submission Form**
- User-friendly form with star ratings
- Name, rating (1-5 stars), and message fields
- Form validation and success feedback
- Redirects to home after submission

### 4. **API Endpoints (Netlify Functions)**
- `GET /api/get-theme` - Fetch current theme
- `POST /api/update-theme` - Update theme (admin)
- `GET /api/get-reviews` - Fetch all reviews
- `POST /api/submit-review` - Submit new review
- `POST /api/delete-review` - Delete review (admin)

---

## 📦 Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install:
- `@netlify/functions` - Netlify Functions runtime
- `@netlify/blobs` - Netlify Blobs storage (free tier: 1GB)

### 2. Set Admin Password

In Netlify Dashboard:
1. Go to **Site settings** → **Environment variables**
2. Add a new variable:
   - **Key**: `ADMIN_PASSWORD`
   - **Value**: Your secure admin password (e.g., `MySecurePassword123`)
3. Save

**For local testing:**
Create `.env` file in project root:
```bash
ADMIN_PASSWORD=admin123
```

---

## 🚀 Local Development

### Run Development Server

```bash
npm start
```

### Test Netlify Functions Locally

Install Netlify CLI:
```bash
npm install -g netlify-cli
```

Run local dev server with functions:
```bash
netlify dev
```

This starts:
- Angular app: `http://localhost:4200`
- Netlify Functions: `http://localhost:4200/.netlify/functions/*`

---

## 🌐 Deployment to Netlify

### First Time Setup

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Add theme manager and reviews system"
   git push
   ```

2. **Connect to Netlify**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
   - Build settings are already configured in `netlify.toml`
   - Click "Deploy site"

3. **Set Environment Variable**
   - Go to Site settings → Environment variables
   - Add `ADMIN_PASSWORD` with your secure password
   - Redeploy site

### Subsequent Deployments

Every `git push` to your main branch will auto-deploy! 🎉

---

## 🎨 Using the Theme Manager

### Access Admin Page

1. Navigate to: `https://your-site.netlify.app/admin`
2. Enter your admin password (set in environment variables)
3. Click "Login"

### Customize Theme

1. Select **Theme Manager** tab
2. Adjust colors using color pickers:
   - Primary Color
   - Secondary Color
   - Accent Color
   - Background Color
   - Text Color
   - Gradient Start
   - Gradient End
3. Click **Save Theme**
4. Changes apply instantly to the live website! ✨

### Manage Reviews

1. Select **Review Manager** tab
2. View all submitted reviews
3. Delete inappropriate reviews if needed

---

## ⭐ Customer Reviews Flow

### For Website Visitors

1. **View Reviews**: Scroll to reviews section on home page
2. **Refresh Reviews**: Click "🔄 Refresh Reviews" button
3. **Add Review**: Click "Add Your Review" button
4. Fill form:
   - Name
   - Rating (1-5 stars, click stars to select)
   - Review message
5. Click "Submit Review"
6. Success! Review appears for all visitors

### Review Display

- Reviews slider on home page
- Drag/swipe functionality (like partners)
- Manual refresh to see new reviews
- No auto-polling = 100% free tier!

---

## 🔐 Security Notes

### Admin Password

- **Never commit** admin password to git
- Store only in Netlify environment variables
- Use strong password (min 12 characters)

### Review Moderation

Currently all reviews are auto-approved. To add manual approval:
1. Go to `netlify/functions/submit-review.ts`
2. Change `approved: true` to `approved: false` (line 44)
3. Reviews won't show until approved via admin panel

---

## 💰 Cost Breakdown (FREE!)

### Netlify Free Tier Limits

✅ **Netlify Functions**: 125,000 requests/month  
✅ **Netlify Blobs**: 1 GB storage  
✅ **Bandwidth**: 100 GB/month  

### Your Usage Estimate

- **Theme API**: ~1,500 requests/month (admin only)
- **Reviews API**: ~5,000 requests/month (manual refresh)
- **Storage**: <1 MB (easily fits in 1GB)

**Total Cost: $0.00** ✅

---

## 📁 File Structure

```
src/
├── app/
│   ├── components/
│   │   ├── admin/              # Admin page component
│   │   ├── add-review/         # Review form component
│   │   └── reviews-slider/     # Reviews slider component
│   ├── services/
│   │   ├── theme.service.ts    # Theme API service
│   │   └── review.service.ts   # Review API service
│   └── models/
│       └── api.models.ts       # TypeScript interfaces
├── assets/
│   └── i18n/
│       ├── en.json            # English translations
│       └── ar.json            # Arabic translations
netlify/
└── functions/                 # Serverless API endpoints
    ├── get-theme.ts
    ├── update-theme.ts
    ├── get-reviews.ts
    ├── submit-review.ts
    └── delete-review.ts
netlify.toml                   # Netlify configuration
```

---

## 🐛 Troubleshooting

### Functions Not Working Locally

**Problem**: API calls return 404  
**Solution**: Use `netlify dev` instead of `npm start`

### Theme Not Applying

**Problem**: Theme changes don't show  
**Solution**: Check browser console for errors, ensure API is responding

### Reviews Not Showing

**Problem**: No reviews appear  
**Solution**: 
1. Check if reviews exist (visit `/admin`)
2. Click "Refresh Reviews" button
3. Check browser console for errors

### Admin Password Incorrect

**Problem**: "Invalid password" error  
**Solution**:
1. Verify environment variable is set in Netlify
2. Redeploy site after setting variable
3. Clear browser cache

---

## 🔄 Update Frequency

**Theme Manager** (Admin Only):
- Updates every 10 seconds automatically
- Only when admin page is open
- Zero cost impact

**Reviews**:
- Manual refresh via button
- No automatic polling
- Keeps you in free tier!

---

## 📝 Routes Added

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | Admin | Theme & review management |
| `/add-review` | AddReview | Review submission form |

---

## 🎯 Next Steps (Optional Enhancements)

1. **Email Notifications**: Get notified when new review submitted
2. **Review Approval**: Manual approval before showing reviews
3. **Image Upload**: Allow users to upload photos with reviews
4. **Review Ratings**: Add helpful/not helpful votes
5. **Spam Protection**: Add reCAPTCHA to review form

---

## 📞 Need Help?

- Check browser console for errors
- Check Netlify Function logs in dashboard
- Verify environment variables are set
- Test locally with `netlify dev`

---

## ✅ Deployment Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Code pushed to GitHub
- [ ] Connected to Netlify
- [ ] Environment variable `ADMIN_PASSWORD` set
- [ ] Test admin page works
- [ ] Test review submission works
- [ ] Test review refresh button works
- [ ] Verify theme changes apply live

---

**🎉 You're all set! Enjoy your new theme manager and reviews system!**
