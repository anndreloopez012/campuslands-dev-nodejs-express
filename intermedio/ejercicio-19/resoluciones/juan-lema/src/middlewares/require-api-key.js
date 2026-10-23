import { createHash, timingSafeEqual } from "node:crypto";
import { config } from "../config/index.js";

const digest = (value) => createHash("sha256").update(value).digest();

function requireApiKey(req, res, next) {
  const provided = req.get("x-api-key");
  if (!provided) return res.status(401).json({ ok: false, message: "Header x-api-key requerido" });
  if (!timingSafeEqual(digest(provided), digest(config.adminApiKey))) return res.status(401).json({ ok: false, message: "x-api-key invalida" });

  next();
}

export { requireApiKey };
