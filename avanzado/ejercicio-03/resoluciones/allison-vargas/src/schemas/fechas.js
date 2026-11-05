import { Esquema, INVALIDO } from './base.js';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FECHA_HORA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d{1,3})?)?Z$/;

const fechaReal = (texto) => {
  const fecha = new Date(`${texto.slice(0, 10)}T00:00:00Z`);
  return !Number.isNaN(fecha.getTime()) && fecha.toISOString().startsWith(texto.slice(0, 10));
};

export class Fecha extends Esquema {
  etiqueta = 'una fecha AAAA-MM-DD';

  desde(limite) {
    return this._con({ desde: limite, reglas: [...this.def.reglas, `fecha desde ${limite}`] });
  }

  hasta(limite) {
    return this._con({ hasta: limite, reglas: [...this.def.reglas, `fecha hasta ${limite}`] });
  }

  analizar(valor, ruta, ctx) {
    if (typeof valor !== 'string') return this.tipoInvalido(valor, ruta, ctx);
    if (!FECHA.test(valor) || !fechaReal(valor)) {
      ctx.informar(ruta, 'formato_invalido', 'debe ser una fecha valida con formato AAAA-MM-DD');
      return INVALIDO;
    }
    if (this.def.desde !== undefined && valor < this.def.desde) {
      ctx.informar(ruta, 'muy_pequeno', `debe ser ${this.def.desde} o posterior`);
      return INVALIDO;
    }
    if (this.def.hasta !== undefined && valor > this.def.hasta) {
      ctx.informar(ruta, 'muy_grande', `debe ser ${this.def.hasta} o anterior`);
      return INVALIDO;
    }
    return valor;
  }

  jsonBase() {
    return { type: 'string', format: 'date' };
  }
}

export class FechaHora extends Esquema {
  etiqueta = 'una fecha y hora ISO 8601 en UTC';

  analizar(valor, ruta, ctx) {
    if (typeof valor !== 'string') return this.tipoInvalido(valor, ruta, ctx);
    const instante = new Date(valor);
    if (!FECHA_HORA.test(valor) || Number.isNaN(instante.getTime()) || !fechaReal(valor)) {
      ctx.informar(ruta, 'formato_invalido', 'debe ser una fecha y hora valida como 2026-11-04T18:30:00Z');
      return INVALIDO;
    }
    return instante.toISOString();
  }

  jsonBase() {
    return { type: 'string', format: 'date-time' };
  }
}
