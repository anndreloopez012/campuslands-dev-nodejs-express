import { rateLimitConfig } from "../config/rateLimit.config.js";
import { TooManyRequestsError } from "../utils/customErrors.js";

const clientBuckets = new Map();

export const rateLimiterMiddleware = (req, res, next) => {
  const clientKey = req.headers["x-client-id"] || req.ip || "anonymous-node";
  const now = Date.now();
  const { windowMs, maxRequests } = rateLimitConfig;

  let record = clientBuckets.get(clientKey);

  if (!record || now >= record.resetTime) {
    record = {
      count: 0,
      resetTime: now + windowMs
    };
  }

  record.count += 1;
  clientBuckets.set(clientKey, record);

  const remaining = Math.max(0, maxRequests - record.count);
  const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);

  res.setHeader("X-RateLimit-Limit", String(maxRequests));
  res.setHeader("X-RateLimit-Remaining", String(remaining));
  res.setHeader("X-RateLimit-Reset", String(Math.ceil(record.resetTime / 1000)));

  if (record.count > maxRequests) {
    res.setHeader("Retry-After", String(retryAfterSeconds));
    return next(new TooManyRequestsError(retryAfterSeconds, maxRequests));
  }

  next();
};
