import { Esquema, INVALIDO } from './base.js';

export class UnionPor extends Esquema {
  etiqueta = 'un objeto';

  analizar(valor, ruta, ctx) {
    const { clave, variantes } = this.def;
    if (typeof valor !== 'object' || valor === null || Array.isArray(valor)) return this.tipoInvalido(valor, ruta, ctx);
    const discriminante = Object.hasOwn(valor, clave) ? valor[clave] : undefined;
    if (discriminante === undefined) {
      ctx.informar([...ruta, clave], 'requerido', 'es obligatorio');
      return INVALIDO;
    }
    if (typeof discriminante !== 'string' || !Object.hasOwn(variantes, discriminante)) {
      ctx.informar([...ruta, clave], 'enum_invalido', `debe ser uno de: ${Object.keys(variantes).join(', ')}`);
      return INVALIDO;
    }
    return variantes[discriminante].ejecutar(valor, ruta, ctx);
  }

  jsonBase() {
    const { clave, variantes } = this.def;
    return {
      oneOf: Object.values(variantes).map((variante) => variante.aJsonSchema()),
      discriminator: { propertyName: clave },
    };
  }
}
