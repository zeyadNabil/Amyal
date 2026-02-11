import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

interface SavedTheme {
  id: string;
  name: string;
  theme: Record<string, unknown>;
  createdAt: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
      .end();
  }

  if (req.method !== 'POST') {
    return res.status(405)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Method not allowed' });
  }

  try {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const body = req.body as { id?: string; password?: string };
    if (body?.password !== adminPassword) {
      return res.status(401)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Unauthorized' });
    }
    if (!body?.id) {
      return res.status(400)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Theme ID is required' });
    }

    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    const raw = await redis.get('saved-themes');
    const list: SavedTheme[] = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
    const found = list.find((t) => t.id === body.id);
    if (!found) {
      return res.status(404)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Saved theme not found' });
    }

    const theme = {
      ...found.theme,
      updatedAt: new Date().toISOString()
    };
    await redis.set('current-theme', JSON.stringify(theme));

    return res.status(200)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ success: true, theme });
  } catch (error) {
    console.error('Apply theme preset error:', error);
    return res.status(500)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Failed to apply theme' });
  }
}
