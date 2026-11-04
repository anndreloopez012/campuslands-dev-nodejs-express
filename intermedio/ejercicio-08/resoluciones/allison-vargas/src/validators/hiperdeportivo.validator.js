import { ValidationError } from '../utils/errors.js';

export const CIRCUITOS = ['Nurburgring', 'Monza', 'Suzuka', 'Spa'];

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

export function validarId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('El id debe ser un entero positivo', undefined, 'ID_INVALIDO');
  }
  return id;
}

export function validarHiperdeportivo(body) {
  const errores = [];
  const marca = texto(body?.marca);
  const modelo = texto(body?.modelo);
  const { anio, potenciaCv, velocidadMaxKmh } = body ?? {};

  if (marca.length < 2) errores.push({ campo: 'marca', mensaje: 'marca debe tener al menos 2 caracteres' });
  if (!modelo) errores.push({ campo: 'modelo', mensaje: 'modelo es obligatorio' });
  if (!Number.isInteger(anio) || anio < 2000 || anio > new Date().getFullYear() + 1) {
    errores.push({ campo: 'anio', mensaje: 'anio debe ser un entero entre 2000 y el proximo anio' });
  }
  if (!Number.isInteger(potenciaCv) || potenciaCv < 700) {
    errores.push({ campo: 'potenciaCv', mensaje: 'potenciaCv debe ser un entero mayor o igual a 700' });
  }
  if (!Number.isInteger(velocidadMaxKmh) || velocidadMaxKmh < 300 || velocidadMaxKmh > 600) {
    errores.push({ campo: 'velocidadMaxKmh', mensaje: 'velocidadMaxKmh debe ser un entero entre 300 y 600' });
  }

  if (errores.length) throw new ValidationError('Datos invalidos', errores);
  return { marca, modelo, anio, potenciaCv, velocidadMaxKmh };
}

export function validarVuelta(body) {
  const errores = [];
  const { circuito, tiempoSegundos } = body ?? {};

  if (!CIRCUITOS.includes(circuito)) {
    errores.push({ campo: 'circuito', mensaje: `circuito debe ser uno de: ${CIRCUITOS.join(', ')}` });
  }
  if (typeof tiempoSegundos !== 'number' || !Number.isFinite(tiempoSegundos) || tiempoSegundos < 30 || tiempoSegundos > 600) {
    errores.push({ campo: 'tiempoSegundos', mensaje: 'tiempoSegundos debe ser un numero entre 30 y 600' });
  }

  if (errores.length) throw new ValidationError('Datos invalidos', errores);
  return { circuito, tiempoSegundos };
}
