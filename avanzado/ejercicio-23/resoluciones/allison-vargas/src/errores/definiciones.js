import { erroresBase } from './base.js';

export const definiciones = {
  ...erroresBase,
  CRON_INVALIDO: [400, (c) => `Expresion cron invalida "${c.expresion}": ${c.motivo}`],
  JOB_NO_ENCONTRADO: [404, (c) => `No existe el job ${c.nombre}`],
  MAQUINA_NO_ENCONTRADA: [404, (c) => `No existe la maquina ${c.maquinaId}`],
  CONSUMIBLE_NO_ENCONTRADO: [404, (c) => `No existe el consumible ${c.consumibleId}`],
  ALERTA_NO_ENCONTRADA: [404, (c) => `No existe la alerta ${c.alertaId}`],
  JOB_EN_EJECUCION: [409, (c) => `El job ${c.nombre} ya se esta ejecutando`],
  STOCK_INSUFICIENTE: [409, (c) => `Solo quedan ${c.stock} ${c.unidad}`],
};
