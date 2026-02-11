import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

interface Theme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  gradientStart: string;
  gradientEnd: string;
  updatedAt?: string;
}

interface SavedTheme {
  id: string;
  name: string;
  theme: Theme;
  createdAt: string;
}

const defaultTheme: Theme = {
  primaryColor: '#0E37AD',
  secondaryColor: '#027DF8',
  accentColor: '#60CEFE',
  backgroundColor: '#0a0e1a',
  textColor: '#FFFFFF',
  gradientStart: '#0E37AD',
  gradientEnd: '#60CEFE'
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .end();
  }

  try {
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    if (req.method === 'GET') {
      const raw = await redis.get('saved-themes');
      const list: SavedTheme[] = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
      return res.status(200)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json(list);
    }

    if (req.method === 'POST') {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const body = req.body as { name?: string; theme?: Theme; password?: string };
      if (body?.password !== adminPassword) {
        return res.status(401)
          .setHeader('Content-Type', 'application/json')
          .setHeader('Access-Control-Allow-Origin', '*')
          .json({ error: 'Unauthorized' });
      }
      if (!body?.name?.trim()) {
        return res.status(400)
          .setHeader('Content-Type', 'application/json')
          .setHeader('Access-Control-Allow-Origin', '*')
          .json({ error: 'Theme name is required' });
      }

      const theme: Theme = body.theme || defaultTheme;
      const raw = await redis.get('saved-themes');
      const list: SavedTheme[] = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
      const id = `theme-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const saved: SavedTheme = {
        id,
        name: body.name.trim(),
        theme: { ...theme, updatedAt: new Date().toISOString() },
        createdAt: new Date().toISOString()
      };
      list.push(saved);
      await redis.set('saved-themes', JSON.stringify(list));

      return res.status(200)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ success: true, saved });
    }

    return res.status(405)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Saved themes error:', error);
    return res.status(500)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Failed to process saved themes' });
  }
}
