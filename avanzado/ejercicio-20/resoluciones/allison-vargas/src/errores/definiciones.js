import { erroresBase } from './base.js';

export const definiciones = {
  ...erroresBase,
  CLAVE_IDEMPOTENCIA_REQUERIDA: [400, () => 'Esta operacion exige la cabecera Idempotency-Key'],
  CLAVE_IDEMPOTENCIA_INVALIDA: [400, () => 'Idempotency-Key debe tener de 8 a 64 letras, numeros, guiones o guiones bajos'],
  CLIENTE_REQUERIDO: [401, () => 'Falta la cabecera X-Cliente-Id'],
  ARTISTA_NO_ENCONTRADO: [404, (c) => `No existe el artista ${c.artistaId}`],
  COMISION_NO_ENCONTRADA: [404, (c) => `No existe la comision ${c.comisionId}`],
  PETICION_EN_CURSO: [409, () => 'Una peticion con esta Idempotency-Key todavia se esta procesando'],
  PAGO_EXCEDE_SALDO: [409, (c) => `El saldo pendiente es ${c.saldo}`],
  TRANSICION_INVALIDA: [409, (c) => `No se puede pasar de ${c.desde} a ${c.hacia}`],
  CLAVE_REUTILIZADA: [422, () => 'Esta Idempotency-Key ya se uso con otra peticion distinta'],
  PASARELA_NO_DISPONIBLE: [502, () => 'La pasarela de pago no respondio; puedes reintentar con la misma Idempotency-Key'],
};
