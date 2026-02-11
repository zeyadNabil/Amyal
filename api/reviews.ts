import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

interface Review {
  id: string;
  name: string;
  rating: number;
  message: string;
  createdAt: string;
  approved: boolean;
}

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

    // GET: list reviews
    if (req.method === 'GET') {
      const data = await redis.get('reviews-list');
      const reviews = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
      return send(200, Array.isArray(reviews) ? reviews : []);
    }

    // POST: submit or delete (action in body)
    if (req.method === 'POST') {
      const body = req.body as Record<string, unknown>;

      if (body.action === 'delete') {
        const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
        if (body.password !== adminPassword) {
          return send(401, { error: 'Unauthorized' });
        }
        if (!body.reviewId) {
          return send(400, { error: 'Review ID required' });
        }
        const data = await redis.get('reviews-list');
        const reviews: Review[] = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
        const filtered = reviews.filter((r) => r.id !== body.reviewId);
        await redis.set('reviews-list', JSON.stringify(filtered));
        return send(200, { success: true });
      }

      // Submit review (no action or action=submit) - name is optional (Anonymous User if empty)
      if (body.rating == null || !body.message) {
        return send(400, { error: 'Missing required fields (rating and message required)' });
      }
      if (Number(body.rating) < 1 || Number(body.rating) > 5) {
        return send(400, { error: 'Rating must be between 1 and 5' });
      }
      const data = await redis.get('reviews-list');
      const reviews: Review[] = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
      const nameValue = body.name != null ? String(body.name).trim() : '';
      const newReview: Review = {
        id: Date.now().toString(),
        name: nameValue || 'Anonymous User',
        rating: Number(body.rating),
        message: String(body.message).trim(),
        createdAt: new Date().toISOString(),
        approved: true
      };
      reviews.unshift(newReview);
      await redis.set('reviews-list', JSON.stringify(reviews));
      return send(201, { success: true, review: newReview });
    }

    return send(405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Reviews API error:', error);
    return send(500, { error: 'Server error' });
  }
}
