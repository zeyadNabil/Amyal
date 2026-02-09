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

    // Initialize Redis client once
    const redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });

    // Get existing reviews
    const reviewsData = await redis.get('reviews-list');
    const reviews: Review[] = reviewsData 
      ? (typeof reviewsData === 'string' ? JSON.parse(reviewsData) : reviewsData)
      : [];

    // Create new review
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
    await redis.set('reviews-list', JSON.stringify(reviews));

    return res.status(201)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ success: true, review: newReview });
  } catch (error) {
    console.error('Error submitting review:', error);
    return res.status(500)
      .setHeader('Content-Type', 'application/json')
      .setHeader('Access-Control-Allow-Origin', '*')
      .json({ 
        error: 'Failed to submit review',
        details: error instanceof Error ? error.message : String(error)
      });
  }
}
