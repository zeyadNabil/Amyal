import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Check environment variables
    const hasUrl = !!process.env.UPSTASH_REDIS_REST_URL;
    const hasToken = !!process.env.UPSTASH_REDIS_REST_TOKEN;
    const vercelEnv = process.env.VERCEL_ENV;
    
    // Try to import and initialize Redis
    let redisStatus = 'not tested';
    try {
      const { Redis } = await import('@upstash/redis');
      const redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
      
      // Try a simple ping
      await redis.set('test-key', 'test-value');
      const value = await redis.get('test-key');
      redisStatus = value === 'test-value' ? 'working' : 'failed';
    } catch (redisError: any) {
      redisStatus = `error: ${redisError.message}`;
    }
    
    return res.status(200).json({
      environment: vercelEnv,
      hasRedisUrl: hasUrl,
      hasRedisToken: hasToken,
      redisStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message,
      stack: error.stack
    });
  }
}
