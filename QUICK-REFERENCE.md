# 🚀 Quick Reference Card

## Admin Access
**URL:** `https://your-site.com/admin`  
**Password:** Set via `ADMIN_PASSWORD` in Netlify environment variables

## Routes Added
- `/admin` - Theme & review management  
- `/add-review` - Review submission form

## API Endpoints
- `GET /.netlify/functions/get-theme`
- `POST /.netlify/functions/update-theme` (admin)
- `GET /.netlify/functions/get-reviews`
- `POST /.netlify/functions/submit-review`
- `POST /.netlify/functions/delete-review` (admin)

## Environment Variables (Required)
```bash
ADMIN_PASSWORD=your_secure_password
```

## Local Development
```bash
# Install dependencies
npm install

# Run Angular dev server
npm start

# Run with Netlify Functions (recommended)
netlify dev
```

## Deployment Steps
1. Set `ADMIN_PASSWORD` in Netlify dashboard
2. Push code to GitHub
3. Netlify auto-deploys
4. Done! ✅

## Default Admin Password (for local dev)
`admin123` (change in `.env` file)

## Storage
- **Netlify Blobs** (free tier: 1GB)
- Theme: `theme-store/current-theme`
- Reviews: `reviews-store/reviews-list`

## Cost
**$0.00** on Netlify free tier 🎉

## Support
Check SETUP-GUIDE.md for detailed instructions  
Check FEATURES-SUMMARY.md for feature overview
