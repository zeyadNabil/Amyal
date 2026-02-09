import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedisClient } from './redis-client';

interface Review {
  id: string;
  name: string;
  rating: number;
  message: string;
  createdAt: string;
  approved: boolean;
}

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
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const body = req.body;
    
    if (body.password !== adminPassword) {
      return res.status(401)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Unauthorized' });
    }

    if (!body.reviewId) {
      return res.status(400)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Review ID required' });
    }

    let reviewsData: string | null;
    const redis = getRedisClient();
    reviewsData = await redis.get('reviews-list');

    const reviews: Review[] = reviewsData 
      ? (typeof reviewsData === 'string' ? JSON.parse(reviewsData) : reviewsData)
      : [];

    const filteredReviews = reviews.filter(r => r.id !== body.reviewId);

    const redis = getRedisClient();
    await redis.set('reviews-list', JSON.stringify(filteredReviews));

    return res.status(200)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ success: true });
  } catch (error) {
    console.error('Error deleting review:', error);
    return res.status(500)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Failed to delete review' });
  }
}
