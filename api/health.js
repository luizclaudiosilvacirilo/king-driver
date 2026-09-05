export default function handler(request, response) {
  response.status(200).json({
    ok: true,
    service: 'king-driver-api',
    environment: process.env.APP_ENV || 'development',
    timestamp: new Date().toISOString()
  });
}
