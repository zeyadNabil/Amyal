import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedisClient } from './redis-client';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Method not allowed' });
  }

  try {
    // Simple password check (store password in Vercel environment variable)
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const body = req.body;
    
    if (body.password !== adminPassword) {
      return res.status(401)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Unauthorized' });
    }

    const theme = {
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      backgroundColor: body.backgroundColor,
      textColor: body.textColor,
      gradientStart: body.gradientStart,
      gradientEnd: body.gradientEnd,
      updatedAt: new Date().toISOString()
    };

    const redis = getRedisClient();
    await redis.set('current-theme', JSON.stringify(theme));

    return res.status(200)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ success: true, theme });
  } catch (error) {
    console.error('Error updating theme:', error);
    return res.status(500)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Failed to update theme' });
  }
}
