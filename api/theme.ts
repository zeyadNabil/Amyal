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
  [key: string]: unknown;
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
  const send = (status: number, data: unknown) =>
    res.status(status).setHeader('Content-Type', 'application/json').setHeader('Access-Control-Allow-Origin', '*').json(data);

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

    // GET: current theme or saved themes list (?list=presets)
    if (req.method === 'GET') {
      if (req.query?.list === 'presets') {
        const raw = await redis.get('saved-themes');
        const list: SavedTheme[] = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
        return send(200, list);
      }
      const theme = await redis.get('current-theme');
      if (!theme) {
        return send(200, defaultTheme);
      }
      const data = typeof theme === 'string' ? JSON.parse(theme) : theme;
      return send(200, data);
    }

    // POST: update, save preset, or apply preset
    if (req.method === 'POST') {
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
      const body = req.body as Record<string, unknown>;
      if (body?.password !== adminPassword) {
        return send(401, { error: 'Unauthorized' });
      }

      // Apply preset: action=apply, id=themeId
      if (body.action === 'apply' && body.id) {
        const raw = await redis.get('saved-themes');
        const list: SavedTheme[] = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
        const found = list.find((t) => t.id === body.id);
        if (!found) {
          return send(404, { error: 'Saved theme not found' });
        }
        const theme = { ...found.theme, updatedAt: new Date().toISOString() };
        await redis.set('current-theme', JSON.stringify(theme));
        return send(200, { success: true, theme });
      }

      // Delete preset: action=delete, id=themeId
      if (body.action === 'delete' && body.id) {
        const raw = await redis.get('saved-themes');
        const list: SavedTheme[] = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
        const filtered = list.filter((t) => t.id !== body.id);
        if (filtered.length === list.length) {
          return send(404, { error: 'Saved theme not found' });
        }
        await redis.set('saved-themes', JSON.stringify(filtered));
        return send(200, { success: true });
      }

      // Save preset: action=save, name, theme
      if (body.action === 'save' && body.name && String(body.name).trim()) {
        const theme: Theme = (body.theme as Theme) || defaultTheme;
        const raw = await redis.get('saved-themes');
        const list: SavedTheme[] = raw ? (typeof raw === 'string' ? JSON.parse(raw) : raw) : [];
        const id = `theme-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
        const saved: SavedTheme = {
          id,
          name: String(body.name).trim(),
          theme: { ...theme, updatedAt: new Date().toISOString() },
          createdAt: new Date().toISOString()
        };
        list.push(saved);
        await redis.set('saved-themes', JSON.stringify(list));
        return send(200, { success: true, saved });
      }

      // Update current theme: no action, or action=update
      if (!body.action || body.action === 'update') {
        const theme: Record<string, unknown> = {
          primaryColor: body.primaryColor ?? defaultTheme.primaryColor,
          secondaryColor: body.secondaryColor ?? defaultTheme.secondaryColor,
          accentColor: body.accentColor ?? defaultTheme.accentColor,
          backgroundColor: body.backgroundColor ?? defaultTheme.backgroundColor,
          textColor: body.textColor ?? defaultTheme.textColor,
          gradientStart: body.gradientStart ?? defaultTheme.gradientStart,
          gradientEnd: body.gradientEnd ?? defaultTheme.gradientEnd,
          updatedAt: new Date().toISOString()
        };
        if (body.borderColor != null) theme.borderColor = body.borderColor;
        if (body.backgroundColorDarker != null) theme.backgroundColorDarker = body.backgroundColorDarker;
        if (body.backgroundColorNavy != null) theme.backgroundColorNavy = body.backgroundColorNavy;
        if (body.mutedTextColor != null) theme.mutedTextColor = body.mutedTextColor;
        if (body.linkColor != null) theme.linkColor = body.linkColor;
        if (body.cardBorderColor != null) theme.cardBorderColor = body.cardBorderColor;
        await redis.set('current-theme', JSON.stringify(theme));
        return send(200, { success: true, theme });
      }

      return send(400, { error: 'Invalid request' });
    }

    return send(405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Theme API error:', error);
    return send(500, { error: 'Server error' });
  }
}
