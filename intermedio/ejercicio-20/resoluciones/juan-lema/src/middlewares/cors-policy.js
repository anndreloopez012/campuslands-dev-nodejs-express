import cors from "cors";

const DEFAULT_ORIGINS = "http://localhost:5173,http://localhost:3000";

const allowedOrigins = (process.env.CORS_ORIGINS ?? DEFAULT_ORIGINS)
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (allowedOrigins.includes("*")) throw new Error("CORS_ORIGINS no admite '*': lista cada origen permitido");

const corsSettings = Object.freeze({ allowedOrigins, methods: ["GET", "POST", "DELETE"], allowedHeaders: ["Content-Type"], maxAge: 600 });

const corsPolicy = cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);

    const error = new Error(`Origen no permitido por CORS: ${origin}`);
    error.status = 403;
    callback(error);
  },
  methods: corsSettings.methods,
  allowedHeaders: corsSettings.allowedHeaders,
  maxAge: corsSettings.maxAge,
});

export { corsPolicy, corsSettings };
