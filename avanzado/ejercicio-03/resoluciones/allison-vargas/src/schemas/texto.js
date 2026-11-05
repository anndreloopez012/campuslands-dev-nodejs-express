import { Esquema, INVALIDO } from './base.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const plural = (n) => (n === 1 ? 'caracter' : 'caracteres');

export class Texto extends Esquema {
  etiqueta = 'un texto';

  _preparar(funcion) {
    return this._con({ preparacion: [...(this.def.preparacion ?? []), funcion] });
  }

  _chequear(chequeo) {
    return this._con({ chequeos: [...(this.def.chequeos ?? []), chequeo] });
  }

  recortar() {
    return this._preparar((texto) => texto.trim());
  }

  minusculas() {
    return this._preparar((texto) => texto.toLowerCase());
  }

  mayusculas() {
    return this._preparar((texto) => texto.toUpperCase());
  }

  normalizarEspacios() {
    return this._preparar((texto) => texto.replace(/\s+/g, ' '));
  }

  min(n) {
    return this._chequear({
      codigo: 'muy_corto',
      ok: (texto) => texto.length >= n,
      mensaje: `debe tener al menos ${n} ${plural(n)}`,
      json: { minLength: n },
    });
  }

  max(n) {
    return this._chequear({
      codigo: 'muy_largo',
      ok: (texto) => texto.length <= n,
      mensaje: `debe tener como maximo ${n} ${plural(n)}`,
      json: { maxLength: n },
    });
  }

  largo(n) {
    return this._chequear({
      codigo: 'largo_invalido',
      ok: (texto) => texto.length === n,
      mensaje: `debe tener exactamente ${n} ${plural(n)}`,
      json: { minLength: n, maxLength: n },
    });
  }

  patron(expresion, mensaje = 'tiene un formato invalido') {
    return this._chequear({
      codigo: 'patron_invalido',
      ok: (texto) => expresion.test(texto),
      mensaje,
      json: { pattern: expresion.source },
    });
  }

  email() {
    return this._chequear({
      codigo: 'formato_invalido',
      ok: (texto) => texto.length <= 120 && EMAIL.test(texto),
      mensaje: 'debe ser un email valido de hasta 120 caracteres',
      json: { format: 'email' },
    });
  }

  analizar(valor, ruta, ctx) {
    if (typeof valor !== 'string') return this.tipoInvalido(valor, ruta, ctx);
    const texto = (this.def.preparacion ?? []).reduce((actual, preparar) => preparar(actual), valor);
    for (const chequeo of this.def.chequeos ?? []) {
      if (!chequeo.ok(texto)) {
        ctx.informar(ruta, chequeo.codigo, chequeo.mensaje);
        return INVALIDO;
      }
    }
    return texto;
  }

  jsonBase() {
    return Object.assign({ type: 'string' }, ...(this.def.chequeos ?? []).map((chequeo) => chequeo.json));
  }
}
