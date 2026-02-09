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
        'Access-Control-Allow-Methods': 'GET, OPTIONS'
      },
      body: ''
    };
  }

  try {
    const theme = isLocalDev()
      ? await localStore.get('current-theme')
      : await getStore('theme-store').get('current-theme');
    
    if (!theme) {
      // Return default theme matching styles.css :root variables
      const defaultTheme = {
        primaryColor: '#0E37AD',      // --blue (dark blue)
        secondaryColor: '#027DF8',    // --purple / --blue-mid
        accentColor: '#60CEFE',       // --blue-bright / --pink
        backgroundColor: '#0a0e1a',   // --bg-dark
        textColor: '#FFFFFF',         // --white
        gradientStart: '#0E37AD',     // gradient start
        gradientEnd: '#60CEFE'        // gradient end
      };
      
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify(defaultTheme)
      };
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: theme
    };
  } catch (error) {
    console.error('Error fetching theme:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: 'Failed to fetch theme' })
    };
  }
};
