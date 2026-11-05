import { randomUUID } from 'node:crypto';

export const PATRON_REQUEST_ID = /^[A-Za-z0-9._-]{8,64}$/;

export const requestId = ({ logger, generar = randomUUID }) => (req, res, next) => {
  const recibido = req.get('x-request-id');
  const valido = typeof recibido === 'string' && PATRON_REQUEST_ID.test(recibido);
  req.id = valido ? recibido : generar();
  req.log = logger.hijo({ requestId: req.id });
  res.set('X-Request-Id', req.id);
  if (recibido !== undefined && !valido) {
    req.log.warn('request_id.descartado', { motivo: 'formato invalido', largo: recibido.length });
  }
  next();
};
