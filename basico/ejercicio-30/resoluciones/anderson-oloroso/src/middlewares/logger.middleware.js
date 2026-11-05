export const logger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    console.log(`[WORKSHOP API] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - start}ms)`);
  });
  next();
};
