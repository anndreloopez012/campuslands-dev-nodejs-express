import { ValidationError } from '../utils/errors.js';

const MAX_LINEAS = 5;

const esObjeto = (valor) => valor !== null && typeof valor === 'object' && !Array.isArray(valor);

const entero = (valor, minimo, maximo) => Number.isInteger(valor) && valor >= minimo && valor <= maximo;

export function validarPedido(body) {
  if (!esObjeto(body)) throw new ValidationError('El body debe ser un objeto JSON', undefined, 'BODY_INVALIDO');

  const errores = [];
  for (const clave of Object.keys(body)) {
    if (!['items', 'direccion'].includes(clave)) errores.push({ campo: clave, mensaje: 'campo no permitido' });
  }

  const items = [];
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > MAX_LINEAS) {
    errores.push({ campo: 'items', mensaje: `debe ser una lista de 1 a ${MAX_LINEAS} elementos` });
  } else {
    const vistos = new Set();
    body.items.forEach((item, indice) => {
      const base = `items[${indice}]`;
      if (!esObjeto(item)) {
        errores.push({ campo: base, mensaje: 'debe ser un objeto con productoId, talla y cantidad' });
        return;
      }
      for (const clave of Object.keys(item)) {
        if (!['productoId', 'talla', 'cantidad'].includes(clave)) {
          errores.push({ campo: `${base}.${clave}`, mensaje: 'campo no permitido' });
        }
      }
      const { productoId, talla, cantidad } = item;
      let valido = true;
      if (!entero(productoId, 1, 1000000000)) {
        errores.push({ campo: `${base}.productoId`, mensaje: 'debe ser un entero positivo' });
        valido = false;
      }
      if (!entero(talla, 35, 46)) {
        errores.push({ campo: `${base}.talla`, mensaje: 'debe ser un entero entre 35 y 46' });
        valido = false;
      }
      if (!entero(cantidad, 1, 5)) {
        errores.push({ campo: `${base}.cantidad`, mensaje: 'debe ser un entero entre 1 y 5' });
        valido = false;
      }
      if (valido) {
        if (vistos.has(productoId)) {
          errores.push({ campo: `${base}.productoId`, mensaje: 'el producto esta repetido, suma las cantidades en una sola linea' });
        } else {
          vistos.add(productoId);
          items.push({ productoId, talla, cantidad });
        }
      }
    });
  }

  let direccion;
  if (body.direccion === undefined) {
    errores.push({ campo: 'direccion', mensaje: 'es obligatorio' });
  } else {
    const texto = typeof body.direccion === 'string' ? body.direccion.trim() : '';
    if (texto.length < 5 || texto.length > 120) {
      errores.push({ campo: 'direccion', mensaje: 'debe ser un texto de 5 a 120 caracteres' });
    } else {
      direccion = texto;
    }
  }

  if (errores.length) throw new ValidationError('Datos invalidos', errores);
  return { items, direccion };
}
