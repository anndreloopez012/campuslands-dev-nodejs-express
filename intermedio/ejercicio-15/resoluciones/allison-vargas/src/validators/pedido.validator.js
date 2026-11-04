import { ValidationError } from '../utils/errors.js';

const MAX_LINEAS = 10;

const esObjeto = (valor) => valor !== null && typeof valor === 'object' && !Array.isArray(valor);

export function validarPedido(body) {
  if (!esObjeto(body)) throw new ValidationError('El body debe ser un objeto JSON', undefined, 'BODY_INVALIDO');

  const errores = [];
  for (const clave of Object.keys(body)) {
    if (!['items', 'nota'].includes(clave)) errores.push({ campo: clave, mensaje: 'campo no permitido' });
  }

  const items = [];
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > MAX_LINEAS) {
    errores.push({ campo: 'items', mensaje: `debe ser una lista de 1 a ${MAX_LINEAS} elementos` });
  } else {
    const vistos = new Set();
    body.items.forEach((item, indice) => {
      const base = `items[${indice}]`;
      if (!esObjeto(item)) {
        errores.push({ campo: base, mensaje: 'debe ser un objeto con platoId y cantidad' });
        return;
      }
      for (const clave of Object.keys(item)) {
        if (!['platoId', 'cantidad'].includes(clave)) errores.push({ campo: `${base}.${clave}`, mensaje: 'campo no permitido' });
      }
      const { platoId, cantidad } = item;
      let valido = true;
      if (!Number.isInteger(platoId) || platoId < 1) {
        errores.push({ campo: `${base}.platoId`, mensaje: 'debe ser un entero positivo' });
        valido = false;
      } else if (vistos.has(platoId)) {
        errores.push({ campo: `${base}.platoId`, mensaje: 'el plato esta repetido, suma las cantidades en una sola linea' });
        valido = false;
      }
      if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 20) {
        errores.push({ campo: `${base}.cantidad`, mensaje: 'debe ser un entero entre 1 y 20' });
        valido = false;
      }
      if (valido) {
        vistos.add(platoId);
        items.push({ platoId, cantidad });
      }
    });
  }

  let nota;
  if (body.nota !== undefined) {
    const texto = typeof body.nota === 'string' ? body.nota.trim() : '';
    if (texto.length < 1 || texto.length > 140) errores.push({ campo: 'nota', mensaje: 'debe ser un texto de 1 a 140 caracteres' });
    else nota = texto;
  }

  if (errores.length) throw new ValidationError('Datos invalidos', errores);
  return nota === undefined ? { items } : { items, nota };
}
