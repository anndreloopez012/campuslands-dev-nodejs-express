export const rateLimitConfig = Object.freeze({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000,
  maxRequests: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 5
});
