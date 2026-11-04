const escribir = (nivel, mensaje, contexto) => {
  const linea = `[${new Date().toISOString()}] ${nivel.toUpperCase()} ${mensaje}`;
  const salida = nivel === 'error' ? console.error : console.log;
  if (contexto === undefined) salida(linea);
  else salida(linea, contexto);
};

export const logger = {
  info: (mensaje, contexto) => escribir('info', mensaje, contexto),
  warn: (mensaje, contexto) => escribir('warn', mensaje, contexto),
  error: (mensaje, contexto) => escribir('error', mensaje, contexto),
};
