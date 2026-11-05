import { erroresBase } from './base.js';

export const definiciones = {
  ...erroresBase,
  NO_AUTENTICADO: [401, () => 'Falta la cabecera X-Usuario-Id con un usuario del estudio'],
  PROHIBIDO: [403, (c) => `Tu rol no permite ${c.accion}`],
  CLIENTE_NO_ENCONTRADO: [404, (c) => `No existe el cliente ${c.clienteId}`],
  CITA_NO_ENCONTRADA: [404, (c) => `No existe la cita ${c.citaId}`],
  ESTADO_INVALIDO: [409, (c) => `La cita esta ${c.estado} y no permite ${c.accion}`],
  SIN_CONSENTIMIENTO: [409, () => 'No se puede tatuar sin el consentimiento firmado'],
  AUDITORIA_NO_DISPONIBLE: [503, () => 'No se pudo registrar la auditoria; la accion no se aplico'],
};
