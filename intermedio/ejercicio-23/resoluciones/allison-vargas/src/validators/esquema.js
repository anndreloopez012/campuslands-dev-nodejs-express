import { ValidationError } from '../utils/errors.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function leerValor(campo, valor, regla, errores) {
  switch (regla.tipo) {
    case 'texto': {
      if (typeof valor !== 'string') {
        errores.push({ campo, mensaje: 'debe ser un texto' });
        return undefined;
      }
      const texto = valor.trim();
      if (texto.length < regla.min || texto.length > regla.max) {
        errores.push({ campo, mensaje: `debe tener entre ${regla.min} y ${regla.max} caracteres` });
        return undefined;
      }
      return texto;
    }
    case 'email': {
      if (typeof valor !== 'string') {
        errores.push({ campo, mensaje: 'debe ser un texto' });
        return undefined;
      }
      const email = valor.trim().toLowerCase();
      if (email.length > 120 || !EMAIL.test(email)) {
        errores.push({ campo, mensaje: 'debe ser un email valido de hasta 120 caracteres' });
        return undefined;
      }
      return email;
    }
    case 'secreto': {
      if (typeof valor !== 'string') {
        errores.push({ campo, mensaje: 'debe ser un texto' });
        return undefined;
      }
      if (valor.length < regla.min || valor.length > regla.max) {
        errores.push({ campo, mensaje: `debe tener entre ${regla.min} y ${regla.max} caracteres` });
        return undefined;
      }
      return valor;
    }
    case 'password': {
      if (typeof valor !== 'string') {
        errores.push({ campo, mensaje: 'debe ser un texto' });
        return undefined;
      }
      if (valor.length < 8 || valor.length > 72) {
        errores.push({ campo, mensaje: 'debe tener entre 8 y 72 caracteres' });
        return undefined;
      }
      if (!/[A-Za-z]/.test(valor) || !/\d/.test(valor)) {
        errores.push({ campo, mensaje: 'debe incluir al menos una letra y un numero' });
        return undefined;
      }
      return valor;
    }
    case 'entero': {
      if (!Number.isInteger(valor)) {
        errores.push({ campo, mensaje: 'debe ser un numero entero' });
        return undefined;
      }
      if (valor < regla.min || valor > regla.max) {
        errores.push({ campo, mensaje: `debe estar entre ${regla.min} y ${regla.max}` });
        return undefined;
      }
      return valor;
    }
    case 'booleano': {
      if (typeof valor !== 'boolean') {
        errores.push({ campo, mensaje: 'debe ser true o false' });
        return undefined;
      }
      return valor;
    }
    case 'enum': {
      if (!regla.valores.includes(valor)) {
        errores.push({ campo, mensaje: `debe ser uno de: ${regla.valores.join(', ')}` });
        return undefined;
      }
      return valor;
    }
    case 'fecha': {
      const valida = typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(valor)
        && new Date(`${valor}T00:00:00Z`).toISOString().startsWith(valor);
      if (!valida) {
        errores.push({ campo, mensaje: 'debe ser una fecha valida con formato AAAA-MM-DD' });
        return undefined;
      }
      return valor;
    }
    case 'hora': {
      if (typeof valor !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(valor)) {
        errores.push({ campo, mensaje: 'debe ser una hora valida con formato HH:MM' });
        return undefined;
      }
      return valor;
    }
    default:
      return undefined;
  }
}

export function validarCuerpo(body, esquema, { parcial = false } = {}) {
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw new ValidationError('El body debe ser un objeto JSON', undefined, 'BODY_INVALIDO');
  }

  const errores = [];
  const limpio = {};

  for (const clave of Object.keys(body)) {
    if (!Object.hasOwn(esquema, clave)) errores.push({ campo: clave, mensaje: 'campo no permitido' });
  }

  for (const [campo, regla] of Object.entries(esquema)) {
    const valor = body[campo];
    if (valor === undefined) {
      if (parcial) continue;
      if (regla.requerido) errores.push({ campo, mensaje: 'es obligatorio' });
      else if (regla.porDefecto !== undefined) limpio[campo] = regla.porDefecto;
      continue;
    }
    const resultado = leerValor(campo, valor, regla, errores);
    if (resultado !== undefined) limpio[campo] = resultado;
  }

  if (parcial && !errores.length && !Object.keys(limpio).length) {
    errores.push({ campo: 'body', mensaje: 'debe incluir al menos un campo para actualizar' });
  }
  if (errores.length) throw new ValidationError('Datos invalidos', errores);
  return limpio;
}
