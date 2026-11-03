const rawOrigins = process.env.ALLOWED_ORIGINS || "http://localhost:5173,https://procreate-gallery.art,https://wacom-studio.dev";

export const corsConfig = Object.freeze({
  allowedOrigins: Object.freeze(
    rawOrigins
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  ),
  allowedMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  allowedHeaders: "Content-Type,Authorization,X-Request-Id",
  allowCredentials: (process.env.ALLOW_CREDENTIALS || "true").trim() === "true",
  maxAgeSeconds: 86400
});
