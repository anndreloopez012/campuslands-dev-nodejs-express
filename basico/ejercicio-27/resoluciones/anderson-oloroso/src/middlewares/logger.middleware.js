// Middleware simple de logging de peticiones HTTP
export const simpleLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP LOG] ${timestamp} | ${req.method} ${req.originalUrl} | Status: ${res.statusCode} | ${duration}ms`);
  });

  next();
};
