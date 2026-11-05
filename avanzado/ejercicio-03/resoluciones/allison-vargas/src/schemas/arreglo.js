import { Esquema, INVALIDO } from './base.js';

const plural = (n) => (n === 1 ? 'elemento' : 'elementos');

export class Arreglo extends Esquema {
  etiqueta = 'un arreglo';

  min(n) {
    return this._con({ minimo: n });
  }

  max(n) {
    return this._con({ maximo: n });
  }

  largo(n) {
    return this._con({ exacto: n });
  }

  unico(selector = (elemento) => elemento, campo) {
    return this._con({
      unicos: [...(this.def.unicos ?? []), { selector, campo }],
      reglas: [...this.def.reglas, `elementos unicos${campo ? ` por ${campo}` : ''}`],
    });
  }

  analizar(valor, ruta, ctx) {
    if (!Array.isArray(valor)) return this.tipoInvalido(valor, ruta, ctx);
    const { item, minimo, maximo, exacto } = this.def;
    const antes = ctx.incidencias.length;
    const elementos = valor.map((elemento, indice) => item.ejecutar(elemento, [...ruta, indice], ctx));

    if (exacto !== undefined && valor.length !== exacto) {
      ctx.informar(ruta, 'largo_invalido', `debe tener exactamente ${exacto} ${plural(exacto)}`);
    } else {
      if (minimo !== undefined && valor.length < minimo) {
        ctx.informar(ruta, 'muy_corto', `debe tener al menos ${minimo} ${plural(minimo)}`);
      }
      if (maximo !== undefined && valor.length > maximo) {
        ctx.informar(ruta, 'muy_largo', `debe tener como maximo ${maximo} ${plural(maximo)}`);
      }
    }

    if (ctx.incidencias.length === antes) {
      for (const { selector, campo } of this.def.unicos ?? []) {
        const vistos = new Map();
        elementos.forEach((elemento, indice) => {
          const clave = selector(elemento);
          if (vistos.has(clave)) {
            ctx.informar(
              [...ruta, indice, ...(campo ? [campo] : [])],
              'duplicado',
              `ya aparece en la posicion ${vistos.get(clave)}`,
            );
          } else {
            vistos.set(clave, indice);
          }
        });
      }
    }

    return ctx.incidencias.length > antes ? INVALIDO : elementos;
  }

  jsonBase() {
    const { item, minimo, maximo, exacto } = this.def;
    return {
      type: 'array',
      items: item.aJsonSchema(),
      ...(minimo !== undefined || exacto !== undefined ? { minItems: exacto ?? minimo } : {}),
      ...(maximo !== undefined || exacto !== undefined ? { maxItems: exacto ?? maximo } : {}),
    };
  }
}
