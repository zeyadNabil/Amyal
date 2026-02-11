/**
 * Local API server for development when backend is not running.
 * Serves /api/* routes with file-based storage in .local-storage/
 * Run: node scripts/dev-api.js (listens on port 3001)
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3001;
const STORAGE = path.join(process.cwd(), '.local-storage');
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const defaultTheme = {
  primaryColor: '#0E37AD',
  secondaryColor: '#027DF8',
  accentColor: '#60CEFE',
  backgroundColor: '#0a0e1a',
  textColor: '#FFFFFF',
  gradientStart: '#0E37AD',
  gradientEnd: '#60CEFE',
  borderColor: '#1e293b',
  backgroundColorDarker: '#050810',
  backgroundColorNavy: '#141824',
  mutedTextColor: '#94A3B8',
  linkColor: '#60CEFE',
  cardBorderColor: '#334155'
};

function ensureStorage() {
  if (!fs.existsSync(STORAGE)) fs.mkdirSync(STORAGE, { recursive: true });
}

function readJson(name) {
  ensureStorage();
  const fp = path.join(STORAGE, `${name}.json`);
  if (fs.existsSync(fp)) {
    return JSON.parse(fs.readFileSync(fp, 'utf8'));
  }
  return null;
}

function writeJson(name, data) {
  ensureStorage();
  const fp = path.join(STORAGE, `${name}.json`);
  fs.writeFileSync(fp, JSON.stringify(data), 'utf8');
}

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function jsonRes(res, status, data) {
  cors(res);
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

const handlers = {
  'GET /api/theme': async (body, req) => {
    if (req?.url?.includes('list=presets')) {
      const s = readJson('saved-themes');
      return Array.isArray(s) ? s : [];
    }
    const t = readJson('current-theme');
    return t || defaultTheme;
  },
  'POST /api/theme': async (body) => {
    if (body.password !== ADMIN_PASSWORD) {
      return { status: 401, data: { error: 'Unauthorized' } };
    }
    if (body.action === 'apply' && body.id) {
      const list = readJson('saved-themes') || [];
      const found = list.find(t => t.id === body.id);
      if (!found) return { status: 404, data: { error: 'Saved theme not found' } };
      const theme = { ...found.theme, updatedAt: new Date().toISOString() };
      writeJson('current-theme', theme);
      return { status: 200, data: { success: true, theme } };
    }
    if (body.action === 'save' && body.name && String(body.name).trim()) {
      const theme = body.theme || defaultTheme;
      const list = readJson('saved-themes') || [];
      const id = `theme-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const saved = { id, name: String(body.name).trim(), theme: { ...theme, updatedAt: new Date().toISOString() }, createdAt: new Date().toISOString() };
      list.push(saved);
      writeJson('saved-themes', list);
      return { status: 200, data: { success: true, saved } };
    }
    const theme = {
      ...defaultTheme,
      primaryColor: body.primaryColor ?? defaultTheme.primaryColor,
      secondaryColor: body.secondaryColor ?? defaultTheme.secondaryColor,
      accentColor: body.accentColor ?? defaultTheme.accentColor,
      backgroundColor: body.backgroundColor ?? defaultTheme.backgroundColor,
      textColor: body.textColor ?? defaultTheme.textColor,
      gradientStart: body.gradientStart ?? defaultTheme.gradientStart,
      gradientEnd: body.gradientEnd ?? defaultTheme.gradientEnd,
      borderColor: body.borderColor ?? defaultTheme.borderColor,
      backgroundColorDarker: body.backgroundColorDarker ?? defaultTheme.backgroundColorDarker,
      backgroundColorNavy: body.backgroundColorNavy ?? defaultTheme.backgroundColorNavy,
      mutedTextColor: body.mutedTextColor ?? defaultTheme.mutedTextColor,
      linkColor: body.linkColor ?? defaultTheme.linkColor,
      cardBorderColor: body.cardBorderColor ?? defaultTheme.cardBorderColor,
      updatedAt: new Date().toISOString()
    };
    writeJson('current-theme', theme);
    return { status: 200, data: { success: true, theme } };
  },
  'GET /api/reviews': async () => {
    const r = readJson('reviews-list');
    return Array.isArray(r) ? r : [];
  },
  'POST /api/reviews': async (body) => {
    if (body.action === 'delete') {
      if (body.password !== ADMIN_PASSWORD) return { status: 401, data: { error: 'Unauthorized' } };
      if (!body.reviewId) return { status: 400, data: { error: 'Review ID required' } };
      const list = readJson('reviews-list') || [];
      const filtered = list.filter(r => r.id !== body.reviewId);
      writeJson('reviews-list', filtered);
      return { status: 200, data: { success: true } };
    }
    if (!body.name || !body.rating || !body.message) return { status: 400, data: { error: 'Missing required fields' } };
    if (body.rating < 1 || body.rating > 5) return { status: 400, data: { error: 'Rating must be between 1 and 5' } };
    const list = readJson('reviews-list') || [];
    const newReview = { id: Date.now().toString(), name: String(body.name).trim(), rating: Number(body.rating), message: String(body.message).trim(), createdAt: new Date().toISOString(), approved: true };
    list.unshift(newReview);
    writeJson('reviews-list', list);
    return { status: 201, data: { success: true, review: newReview } };
  },
  'POST /api/validate-admin': async (body) => {
    if (body.password === ADMIN_PASSWORD) {
      return { status: 200, data: { success: true, isValid: true } };
    }
    return { status: 401, data: { success: false, isValid: false, error: 'Invalid password' } };
  }
};

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    cors(res);
    res.writeHead(200);
    res.end();
    return;
  }

  const key = `${req.method} ${req.url}`;
  const baseKey = key.split('?')[0];
  const handler = handlers[baseKey];

  if (!handler) {
    jsonRes(res, 404, { error: 'Not found' });
    return;
  }

  try {
    let body = {};
    if (req.method === 'POST') {
      body = await parseBody(req);
    }
    const result = await handler(body, req);
    if (result && typeof result.status === 'number') {
      jsonRes(res, result.status, result.data);
    } else {
      jsonRes(res, 200, result);
    }
  } catch (err) {
    console.error('API error:', err);
    jsonRes(res, 500, { error: 'Internal server error' });
  }
});

server.listen(PORT, () => {
  console.log(`\n  Dev API server running at http://localhost:${PORT}`);
  console.log(`  Proxy /api/* from Angular dev server targets this.\n`);
});
