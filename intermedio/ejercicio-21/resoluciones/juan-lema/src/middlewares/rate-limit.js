const WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60_000;

function rateLimit({ limit, windowMs = WINDOW_MS }) {
  const hits = new Map();

  setInterval(() => {
    const cutoff = Date.now() - windowMs;
    for (const [key, stamps] of hits) if (stamps.at(-1) <= cutoff) hits.delete(key);
  }, windowMs).unref();

  return (req, res, next) => {
    const now = Date.now();
    const stamps = (hits.get(req.ip) ?? []).filter((time) => time > now - windowMs);
    const blocked = stamps.length >= limit;

    if (!blocked) stamps.push(now);
    hits.set(req.ip, stamps);

    const resetSeconds = Math.ceil((stamps[0] + windowMs - now) / 1000);
    res.set({ "RateLimit-Limit": limit, "RateLimit-Remaining": Math.max(limit - stamps.length, 0), "RateLimit-Reset": resetSeconds });

    if (!blocked) return next();

    res.set("Retry-After", resetSeconds);
    res.status(429).json({ ok: false, message: `Demasiadas peticiones. Reintenta en ${resetSeconds}s`, retryAfterSeconds: resetSeconds });
  };
}

const readLimiter = rateLimit({ limit: 10 });
const renderLimiter = rateLimit({ limit: 3 });

export { rateLimit, readLimiter, renderLimiter };
