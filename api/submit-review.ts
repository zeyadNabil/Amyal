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
    const body = req.body;
    
    // Validate input
    if (!body.name || !body.rating || !body.message) {
      return res.status(400)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Missing required fields' });
    }

    if (body.rating < 1 || body.rating > 5) {
      return res.status(400)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Rating must be between 1 and 5' });
    }

    // Get Redis client
    let reviewsData: string | null;
    try {
      const redis = getRedisClient();
      reviewsData = await redis.get('reviews-list');
    } catch (redisError) {
      console.error('Redis connection error:', redisError);
      return res.status(500)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Database connection failed. Please check environment variables.' });
    }

    const reviews: Review[] = reviewsData 
      ? (typeof reviewsData === 'string' ? JSON.parse(reviewsData) : reviewsData)
      : [];

    const newReview: Review = {
      id: Date.now().toString(),
      name: body.name.trim(),
      rating: parseInt(body.rating),
      message: body.message.trim(),
      createdAt: new Date().toISOString(),
      approved: true
    };

    reviews.unshift(newReview);

    // Save to Redis
    try {
      const redis = getRedisClient();
      await redis.set('reviews-list', JSON.stringify(reviews));
    } catch (redisError) {
      console.error('Redis save error:', redisError);
      return res.status(500)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Failed to save review to database' });
    }

    return res.status(201)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ success: true, review: newReview });
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Failed to submit review' });
  }
}

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
    const body = req.body;
    
    // Validate input
    if (!body.name || !body.rating || !body.message) {
      return res.status(400)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Missing required fields' });
    }

    if (body.rating < 1 || body.rating > 5) {
      return res.status(400)
        .setHeader('Content-Type', 'application/json')
        .setHeader('Access-Control-Allow-Origin', '*')
        .json({ error: 'Rating must be between 1 and 5' });
    }

    let reviewsData: string | null;
    
    if (isLocalDev()) {
      reviewsData = await localStore.get('reviews-list');
    } else {
      try {
        const redis = getRedisClient();
        reviewsData = await redis.get('reviews-list');
      } catch (redisError) {
        console.error('Redis connection error:', redisError);
        return res.status(500)
          .setHeader('Content-Type', 'application/json')
          .setHeader('Access-Control-Allow-Origin', '*')
          .json({ error: 'Database connection failed. Please check environment variables.' });
      }
    }

    const reviews: Review[] = reviewsData 
      ? (typeof reviewsData === 'string' ? JSON.parse(reviewsData) : reviewsData)
      : [];

    const newReview: Review = {
      id: Date.now().toString(),
      name: body.name.trim(),
      rating: parseInt(body.rating),
      message: body.message.trim(),
      createdAt: new Date().toISOString(),
      approved: true // Auto-approve for now (you can add manual approval later)
    };

    reviews.unshift(newReview); // Add to beginning of array

    if (isLocalDev()) {
      await localStore.set('reviews-list', JSON.stringify(reviews));
    } else {
      try {
        const redis = getRedisClient();
        await redis.set('reviews-list', JSON.stringify(reviews));
      } catch (redisError) {
        console.error('Redis save error:', redisError);
        return res.status(500)
          .setHeader('Content-Type', 'application/json')
          .setHeader('Access-Control-Allow-Origin', '*')
          .json({ error: 'Failed to save review to database' });
      }
    }

    return res.status(201)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ success: true, review: newReview });
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ error: 'Failed to submit review' });
  }
}
