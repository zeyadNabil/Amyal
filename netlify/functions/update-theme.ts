import { Handler } from '@netlify/functions';
import { getStore } from '@netlify/blobs';
import { localStore, isLocalDev } from './local-storage';

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
    // Simple password check (store password in Netlify environment variable)
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

    const theme = {
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      backgroundColor: body.backgroundColor,
      textColor: body.textColor,
      gradientStart: body.gradientStart,
      gradientEnd: body.gradientEnd,
      updatedAt: new Date().toISOString()
    };

    if (isLocalDev()) {
      await localStore.set('current-theme', JSON.stringify(theme));
    } else {
      await getStore('theme-store').set('current-theme', JSON.stringify(theme));
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ success: true, theme })
    };
  } catch (error) {
    console.error('Error updating theme:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to update theme' })
    };
  }
};
