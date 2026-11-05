import { randomUUID } from 'node:crypto';

const VALIDO = /^[A-Za-z0-9_-]{8,64}$/;

export const idPeticion = () => (req, res, next) => {
  const entrante = req.headers['x-request-id'];
  req.idPeticion = typeof entrante === 'string' && VALIDO.test(entrante) ? entrante : randomUUID();
  res.set('X-Request-Id', req.idPeticion);
  next();
};
