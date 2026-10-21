import { randomUUID } from "node:crypto";

export const requestIdMiddleware = (req, res, next) => {
  const incoming = req.headers["x-request-id"];
  const requestId = (typeof incoming === "string" && incoming.trim() !== "")
    ? incoming.trim()
    : randomUUID();

  req.id = requestId;
  res.setHeader("X-Request-Id", requestId);
  next();
};