import { randomUUID } from 'node:crypto';

export const HEADER_REQUEST_ID = 'x-request-id';

const FORMATO_VALIDO = /^[A-Za-z0-9._-]{8,64}$/;

export const requestId = (req, res, next) => {
  const entrante = req.get(HEADER_REQUEST_ID);
  req.id = entrante && FORMATO_VALIDO.test(entrante) ? entrante : randomUUID();
  res.locals.requestId = req.id;
  res.set(HEADER_REQUEST_ID, req.id);
  next();
};
