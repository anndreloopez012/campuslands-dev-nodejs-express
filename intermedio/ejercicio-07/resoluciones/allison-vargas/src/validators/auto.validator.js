import { ValidationError } from '../utils/errors.js';

const texto = (valor) => (typeof valor === 'string' ? valor.trim() : '');

export function validarAuto(body) {
  const errores = [];
  const marca = texto(body?.marca);
  const modelo = texto(body?.modelo);
  const { anio, precio } = body ?? {};

  if (marca.length < 2) errores.push({ campo: 'marca', mensaje: 'marca debe tener al menos 2 caracteres' });
  if (!modelo) errores.push({ campo: 'modelo', mensaje: 'modelo es obligatorio' });
  if (!Number.isInteger(anio) || anio < 1990 || anio > new Date().getFullYear() + 1) {
    errores.push({ campo: 'anio', mensaje: 'anio debe ser un entero entre 1990 y el proximo anio' });
  }
  if (typeof precio !== 'number' || !Number.isFinite(precio) || precio < 50000) {
    errores.push({ campo: 'precio', mensaje: 'precio debe ser un numero mayor o igual a 50000' });
  }

  if (errores.length) throw new ValidationError('Datos invalidos', errores);
  return { marca, modelo, anio, precio };
}

export function validarReserva(body) {
  const cliente = texto(body?.cliente);
  if (cliente.length < 3) {
    throw new ValidationError('Datos invalidos', [
      { campo: 'cliente', mensaje: 'cliente debe tener al menos 3 caracteres' },
    ]);
  }
  return { cliente };
}

export function validarId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ValidationError('El id debe ser un entero positivo', undefined, 'ID_INVALIDO');
  }
  return id;
}
