import { resolver } from '../src/docs/modelo.js';

const FECHA = /^\d{4}-\d{2}-\d{2}$/;
const FECHA_HORA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

function tipoDe(valor) {
  if (Array.isArray(valor)) return 'array';
  if (valor === null) return 'null';
  return typeof valor;
}

export function validarEsquema(spec, esquema, valor, ruta = '$') {
  const s = resolver(spec, esquema);
  const errores = [];
  const tipo = tipoDe(valor);

  if (s.type === 'integer') {
    if (!Number.isInteger(valor)) return [`${ruta}: se esperaba un entero y llego ${tipo}`];
  } else if (s.type === 'number') {
    if (tipo !== 'number') return [`${ruta}: se esperaba un numero y llego ${tipo}`];
  } else if (s.type && s.type !== tipo) {
    return [`${ruta}: se esperaba ${s.type} y llego ${tipo}`];
  }

  if (s.enum && !s.enum.includes(valor)) errores.push(`${ruta}: ${JSON.stringify(valor)} no esta en el enum`);
  if (typeof valor === 'string') {
    if (s.minLength !== undefined && valor.length < s.minLength) errores.push(`${ruta}: texto demasiado corto`);
    if (s.maxLength !== undefined && valor.length > s.maxLength) errores.push(`${ruta}: texto demasiado largo`);
    if (s.pattern && !new RegExp(s.pattern).test(valor)) errores.push(`${ruta}: no cumple el patron`);
    if (s.format === 'date' && !FECHA.test(valor)) errores.push(`${ruta}: fecha invalida`);
    if (s.format === 'date-time' && !FECHA_HORA.test(valor)) errores.push(`${ruta}: fecha y hora invalidas`);
  }
  if (typeof valor === 'number') {
    if (s.minimum !== undefined && valor < s.minimum) errores.push(`${ruta}: menor que el minimo`);
    if (s.maximum !== undefined && valor > s.maximum) errores.push(`${ruta}: mayor que el maximo`);
  }
  if (tipo === 'array' && s.items) {
    valor.forEach((item, posicion) => errores.push(...validarEsquema(spec, s.items, item, `${ruta}[${posicion}]`)));
  }
  if (tipo === 'object') {
    for (const campo of s.required ?? []) {
      if (!Object.hasOwn(valor, campo)) errores.push(`${ruta}.${campo}: falta el campo`);
    }
    for (const [campo, contenido] of Object.entries(valor)) {
      if (s.properties?.[campo]) errores.push(...validarEsquema(spec, s.properties[campo], contenido, `${ruta}.${campo}`));
      else if (s.additionalProperties === false) errores.push(`${ruta}.${campo}: campo no documentado`);
    }
  }
  return errores;
}
