import { Esquema, INVALIDO } from './base.js';

const NUMERO_EN_TEXTO = /^-?(0|[1-9]\d*)(\.\d+)?$/;

class Numerico extends Esquema {
  esEntero = false;

  min(n) {
    return this._con({ minimo: n });
  }

  max(n) {
    return this._con({ maximo: n });
  }

  coaccionar() {
    return this._con({ coaccion: true });
  }

  analizar(valor, ruta, ctx) {
    const { minimo, maximo, coaccion } = this.def;
    let numero = valor;
    if (coaccion && typeof valor === 'string' && NUMERO_EN_TEXTO.test(valor)) numero = Number(valor);
    if (typeof numero !== 'number' || !Number.isFinite(numero)) return this.tipoInvalido(valor, ruta, ctx);
    if (this.esEntero && !Number.isInteger(numero)) {
      ctx.informar(ruta, 'no_entero', 'debe ser un numero entero');
      return INVALIDO;
    }
    if (minimo !== undefined && numero < minimo) {
      ctx.informar(ruta, 'muy_pequeno', `debe ser mayor o igual a ${minimo}`);
      return INVALIDO;
    }
    if (maximo !== undefined && numero > maximo) {
      ctx.informar(ruta, 'muy_grande', `debe ser menor o igual a ${maximo}`);
      return INVALIDO;
    }
    return numero;
  }

  jsonBase() {
    const { minimo, maximo } = this.def;
    return {
      type: this.esEntero ? 'integer' : 'number',
      ...(minimo !== undefined ? { minimum: minimo } : {}),
      ...(maximo !== undefined ? { maximum: maximo } : {}),
    };
  }
}

export class Numero extends Numerico {
  etiqueta = 'un numero';
}

export class Entero extends Numerico {
  etiqueta = 'un numero entero';

  esEntero = true;
}
