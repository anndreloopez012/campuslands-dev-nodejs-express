import { erroresBase } from './base.js';

export const definiciones = {
  ...erroresBase,
  FORMULA_INVALIDA: [400, (c) => `La formula "${c.formula}" no es valida en la posicion ${c.posicion}: ${c.motivo}`],
  ELEMENTO_NO_ENCONTRADO: [404, (c) => `No existe el elemento ${c.simbolo}`],
  COMPUESTO_NO_ENCONTRADO: [404, (c) => `No existe el compuesto ${c.compuestoId}`],
  COMPUESTO_DUPLICADO: [409, (c) => `Ya existe un compuesto con la formula ${c.formula}`],
};
