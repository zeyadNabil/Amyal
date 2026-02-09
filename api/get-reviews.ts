import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getRedisClient } from './redis-client';
import { localStore, isLocalDev } from './local-storage';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
      .end();
  }

  try {
    let reviewsData: string | null;

    if (isLocalDev()) {
      reviewsData = await localStore.get('reviews-list');
    } else {
      const redis = getRedisClient();
      reviewsData = await redis.get('reviews-list');
    }
    
    if (!reviewsData) {
      return res.status(200)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json([]);
    }
    
    const reviews = typeof reviewsData === 'string' ? JSON.parse(reviewsData) : reviewsData;
    
    return res.status(200)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Failed to fetch reviews' });
  }
}
