import { randomUUID } from 'node:crypto';

export const requestId = (req, res, next) => {
  req.id = req.get('x-request-id') || randomUUID();
  res.set('x-request-id', req.id);
  next();
};
