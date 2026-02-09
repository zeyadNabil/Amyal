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
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    const body = JSON.parse(event.body || '{}');
    
    if (body.password !== adminPassword) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Unauthorized' })
      };
    }

    if (!body.reviewId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ error: 'Review ID required' })
      };
    }

    const reviewsData = isLocalDev()
      ? await localStore.get('reviews-list')
      : await getStore('reviews-store').get('reviews-list');
    const reviews: Review[] = reviewsData ? JSON.parse(reviewsData) : [];

    const filteredReviews = reviews.filter(r => r.id !== body.reviewId);

    if (isLocalDev()) {
      await localStore.set('reviews-list', JSON.stringify(filteredReviews));
    } else {
      await getStore('reviews-store').set('reviews-list', JSON.stringify(filteredReviews));
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true })
    };
  } catch (error) {
    console.error('Error deleting review:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to delete review' })
    };
  }
};
