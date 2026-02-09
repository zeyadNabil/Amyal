import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedisClient } from './redis-client';
import { localStore, isLocalDev } from './local-storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
      .end();
  }

  try {
    let theme: string | null;
    
    if (isLocalDev()) {
      theme = await localStore.get('current-theme');
    } else {
      const redis = getRedisClient();
      theme = await redis.get('current-theme');
    }
    
    if (!theme) {
      // Return default theme matching styles.css :root variables
      const defaultTheme = {
        primaryColor: '#0E37AD',      // --blue (dark blue)
        secondaryColor: '#027DF8',    // --purple / --blue-mid
        accentColor: '#60CEFE',       // --blue-bright / --pink
        backgroundColor: '#0a0e1a',   // --bg-dark
        textColor: '#FFFFFF',         // --white
        gradientStart: '#0E37AD',     // gradient start
        gradientEnd: '#60CEFE'        // gradient end
      };
      
      return res.status(200)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json(defaultTheme);
    }
    
    const themeData = typeof theme === 'string' ? JSON.parse(theme) : theme;
    
    return res.status(200)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json(themeData);
  } catch (error) {
    console.error('Error fetching theme:', error);
    return res.status(500)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Failed to fetch theme' });
  }
}
