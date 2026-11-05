import { erroresBase } from './base.js';

export const definiciones = {
  ...erroresBase,
  CLIENTE_REQUERIDO: [401, () => 'Falta la cabecera X-Cliente-Id'],
  ESCENA_NO_ENCONTRADA: [404, (c) => `No existe la escena ${c.escenaId}`],
  RENDER_NO_ENCONTRADO: [404, (c) => `No existe el render ${c.renderId}`],
  RENDER_TERMINADO: [409, (c) => `El render ${c.renderId} ya termino (${c.estado})`],
  CONFLICTO_DE_VERSION: [412, (c) => `La escena cambio mientras la editabas; la version actual es ${c.actual}`],
  PRECONDICION_REQUERIDA: [428, () => 'Para modificar una escena envia If-Match con su ETag'],
  LIMITE_POR_CLIENTE: [429, (c) => `Ya tienes ${c.maximo} renders activos`],
  COLA_LLENA: [503, (c) => `La cola de render esta llena (${c.maximo} en espera)`],
};
