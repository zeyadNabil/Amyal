import { Redis } from '@upstash/redis';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type')
      .setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
      .end();
  }

  try {
    let reviewsData = null;

    try {
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      });
      reviewsData = await redis.get('reviews-list');
    } catch (redisError) {
      console.error('Redis connection error:', redisError);
      return res.status(500)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Database connection failed. Please check environment variables.' });
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
