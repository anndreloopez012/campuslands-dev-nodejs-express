import { obtenerRequestId } from './context.js';

const escribir = (nivel, mensaje, contexto) => {
  const id = obtenerRequestId() ?? '-';
  const linea = `[${new Date().toISOString()}] ${nivel.toUpperCase()} [${id}] ${mensaje}`;
  const salida = nivel === 'error' ? console.error : console.log;
  if (contexto === undefined) salida(linea);
  else salida(linea, contexto);
};

export const logger = {
  info: (mensaje, contexto) => escribir('info', mensaje, contexto),
  warn: (mensaje, contexto) => escribir('warn', mensaje, contexto),
  error: (mensaje, contexto) => escribir('error', mensaje, contexto),
};
