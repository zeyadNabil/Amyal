import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { localStore, isLocalDev } from './local-storage';

interface Review {
  id: string;
  name: string;
  rating: number;
  message: string;
  createdAt: string;
  approved: boolean;
}

export const handler: Handler = async (event, context) => {
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: ''
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    
    // Validate input
    if (!body.name || !body.rating || !body.message) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Missing required fields' })
      };
    }

    if (body.rating < 1 || body.rating > 5) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Rating must be between 1 and 5' })
      };
    }

    const reviewsData = isLocalDev()
      ? await localStore.get('reviews-list')
      : await getStore('reviews-store').get('reviews-list');
    const reviews: Review[] = reviewsData ? JSON.parse(reviewsData) : [];

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
      await getStore('reviews-store').set('reviews-list', JSON.stringify(reviews));
    }

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, review: newReview })
    };
  } catch (error) {
    console.error('Error submitting review:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to submit review' })
    };
  }
};
