import { Esquema, INVALIDO } from './base.js';

export class Booleano extends Esquema {
  etiqueta = 'verdadero o falso';

  coaccionar() {
    return this._con({ coaccion: true });
  }

  analizar(valor, ruta, ctx) {
    if (this.def.coaccion && (valor === 'true' || valor === 'false')) return valor === 'true';
    if (typeof valor !== 'boolean') return this.tipoInvalido(valor, ruta, ctx);
    return valor;
  }

  jsonBase() {
    return { type: 'boolean' };
  }
}

export class Enumerado extends Esquema {
  etiqueta = 'uno de los valores permitidos';

  analizar(valor, ruta, ctx) {
    const { valores } = this.def;
    if (!valores.includes(valor)) {
      ctx.informar(ruta, 'enum_invalido', `debe ser uno de: ${valores.join(', ')}`);
      return INVALIDO;
    }
    return valor;
  }

  jsonBase() {
    const { valores } = this.def;
    const tipos = new Set(valores.map((valor) => typeof valor));
    return {
      ...(tipos.size === 1 && tipos.has('string') ? { type: 'string' } : {}),
      enum: [...valores],
    };
  }
}

export class Literal extends Esquema {
  etiqueta = 'un valor fijo';

  analizar(valor, ruta, ctx) {
    if (valor !== this.def.valor) {
      ctx.informar(ruta, 'literal_invalido', `debe ser exactamente ${JSON.stringify(this.def.valor)}`);
      return INVALIDO;
    }
    return valor;
  }

  jsonBase() {
    return { const: this.def.valor };
  }
}
