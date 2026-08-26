import config from "../config/index.js";

function requestLogger(req, res, next) {
  if (config.logLevel !== "verbose") {
    next();
    return;
  }

  const start = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${durationMs}ms)`);
  });

  next();
}

export { requestLogger };
