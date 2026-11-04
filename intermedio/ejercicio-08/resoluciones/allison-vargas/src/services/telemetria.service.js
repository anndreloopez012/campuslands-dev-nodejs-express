import { obtenerRequestId } from '../utils/context.js';
import { HEADER_REQUEST_ID } from '../middlewares/requestId.js';
import { logger } from '../utils/logger.js';

export const construirHeaders = () => {
  const id = obtenerRequestId();
  return id ? { [HEADER_REQUEST_ID]: id } : {};
};

export function enviarEvento(tipo, datos) {
  const headers = construirHeaders();
  logger.info(`Evento de telemetria "${tipo}" enviado al servicio externo`, { headers, datos });
  return { tipo, headers };
}
