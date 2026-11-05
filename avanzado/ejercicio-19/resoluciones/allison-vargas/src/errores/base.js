export const erroresBase = {
  VALIDACION: [400, () => 'Los datos enviados no son validos'],
  JSON_INVALIDO: [400, () => 'El body no es un JSON valido'],
  RUTA_NO_ENCONTRADA: [404, (c) => `Ruta no encontrada: ${c.metodo} ${c.ruta}`],
  METODO_NO_PERMITIDO: [405, (c) => `El metodo ${c.metodo} no esta permitido en esta ruta`],
  PAYLOAD_GRANDE: [413, () => 'El body supera el tamano permitido'],
  FORMATO_NO_SOPORTADO: [415, (c) => `El Content-Type debe ser ${c.esperado}`],
  ERROR_INTERNO: [500, () => 'Error interno del servidor'],
};
