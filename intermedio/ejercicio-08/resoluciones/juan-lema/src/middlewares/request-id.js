import { randomUUID } from "node:crypto";

function requestId(req, res, next) {
  req.id = randomUUID();
  res.setHeader("X-Request-Id", req.id);
  next();
}

export { requestId };
