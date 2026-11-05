const ALLOWED_ORIGINS = [
  'https://campuslands.com',
  'https://artstation-draw.dev',
  'http://localhost:5173'
];

export const customCors = (req, res, next) => {
  const origin = req.headers.origin;

  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  // Responder a peticiones preflight OPTIONS inmediatamente
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};
