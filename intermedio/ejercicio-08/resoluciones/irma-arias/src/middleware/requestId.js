import { randomUUID } from 'node:crypto';

export function requestId(request, response, next) {
  request.id = randomUUID();
  response.setHeader('X-Request-Id', request.id);
  next();
}
