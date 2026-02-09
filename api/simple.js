export default function handler(req, res) {
  res.status(200).json({
    message: 'Hello from simple JavaScript API!',
    timestamp: new Date().toISOString(),
    method: req.method,
    environment: process.env.VERCEL_ENV || 'local'
  });
}
