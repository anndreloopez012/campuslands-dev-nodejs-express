import { randomUUID } from 'node:crypto';

const ID_VALIDO = /^[A-Za-z0-9_.-]{8,64}$/;

export const idPeticion = (logger) => (req, res, next) => {
  const entrante = req.get('x-request-id');
  req.id = entrante && ID_VALIDO.test(entrante) ? entrante : randomUUID();
  req.log = logger.hijo({ idPeticion: req.id });
  res.set('X-Request-Id', req.id);
  next();
};
