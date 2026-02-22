import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

interface Review {
  id: string;
  name: string;
  rating: number;
  message: string;
  createdAt: string;
  approved: boolean;
  image?: string;
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

    // GET: list reviews (public - approved only)
    if (req.method === 'GET') {
      const data = await redis.get('reviews-list');
      const reviews: Review[] = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
      const approved = Array.isArray(reviews) ? reviews.filter((r) => r.approved !== false) : [];
      return send(200, approved);
    }

    // POST: submit, delete, approve, deny, listAll (action in body)
    if (req.method === 'POST') {
      const body = req.body as Record<string, unknown>;
      const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

      if (body.action === 'listAll') {
        if (body.password !== adminPassword) return send(401, { error: 'Unauthorized' });
        const data = await redis.get('reviews-list');
        const reviews = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
        return send(200, Array.isArray(reviews) ? reviews : []);
      }

      if (body.action === 'approve') {
        if (body.password !== adminPassword) return send(401, { error: 'Unauthorized' });
        if (!body.reviewId) return send(400, { error: 'Review ID required' });
        const data = await redis.get('reviews-list');
        const reviews: Review[] = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
        const idx = reviews.findIndex((r) => r.id === body.reviewId);
        if (idx < 0) return send(404, { error: 'Review not found' });
        reviews[idx] = { ...reviews[idx], approved: true };
        await redis.set('reviews-list', JSON.stringify(reviews));
        return send(200, { success: true });
      }

      if (body.action === 'deny') {
        if (body.password !== adminPassword) return send(401, { error: 'Unauthorized' });
        if (!body.reviewId) return send(400, { error: 'Review ID required' });
        const data = await redis.get('reviews-list');
        const reviews: Review[] = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
        const filtered = reviews.filter((r) => r.id !== body.reviewId);
        await redis.set('reviews-list', JSON.stringify(filtered));
        return send(200, { success: true });
      }

      if (body.action === 'delete') {
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

      // Submit review (no action or action=submit)
      if (body.rating == null || !body.message) {
        return send(400, { error: 'Missing required fields (rating and message required)' });
      }
      if (Number(body.rating) < 1 || Number(body.rating) > 5) {
        return send(400, { error: 'Rating must be between 1 and 5' });
      }

      const isAdminSubmit = body.password === adminPassword;
      const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim()
        || (req.headers['x-real-ip'] as string) || 'unknown';

      if (!isAdminSubmit) {
        const rateKey = `review-ratelimit:${ip}`;
        const lastDate = await redis.get(rateKey) as string | null;
        if (lastDate === today) {
          return send(429, { error: 'One review per day. You can submit again tomorrow.' });
        }
      }

      const data = await redis.get('reviews-list');
      const reviews: Review[] = data ? (typeof data === 'string' ? JSON.parse(data) : data) : [];
      const nameValue = body.name != null ? String(body.name).trim() : '';
      let imageValue: string | undefined;
      if (body.image && typeof body.image === 'string' && body.image.startsWith('data:image/')) {
        if (body.image.length <= 800000) imageValue = body.image;
      }
      const newReview: Review = {
        id: Date.now().toString(),
        name: nameValue || 'Anonymous User',
        rating: Number(body.rating),
        message: String(body.message).trim(),
        createdAt: new Date().toISOString(),
        approved: isAdminSubmit,
        ...(imageValue && { image: imageValue })
      };
      reviews.unshift(newReview);
      await redis.set('reviews-list', JSON.stringify(reviews));

      if (!isAdminSubmit) {
        const rateKey = `review-ratelimit:${ip}`;
        await redis.set(rateKey, today, { ex: 86400 }); // 24h TTL
      }

      return send(201, { success: true, review: newReview });
    }

    return send(405, { error: 'Method not allowed' });
  } catch (error) {
    console.error('Reviews API error:', error);
    return send(500, { error: 'Server error' });
  }
}
