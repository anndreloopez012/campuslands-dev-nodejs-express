import { ValidationError } from '../utils/errors.js';
import { EXTENSIONES_BLOQUEADAS } from '../constants/archivos.js';

const NOMBRE_SEGURO = /^[A-Za-z0-9][A-Za-z0-9 ._()-]*\.[A-Za-z0-9]{1,8}$/;
const SHA256 = /^[a-f0-9]{64}$/;

const invalido = (campo, mensaje) => new ValidationError('Datos invalidos', [{ campo, mensaje }]);

export function analizarNombre(nombre) {
  if (!NOMBRE_SEGURO.test(nombre) || nombre.includes('..')) {
    throw invalido('nombre', 'solo admite letras, numeros, espacios, punto, guion, guion bajo y parentesis, y debe terminar en una extension');
  }
  const partes = nombre.toLowerCase().split('.');
  const extension = `.${partes.pop()}`;
  if (partes.slice(1).some((parte) => EXTENSIONES_BLOQUEADAS.includes(parte.trim()))) {
    throw invalido('nombre', 'no se permiten extensiones ejecutables dentro del nombre');
  }
  return { nombreOriginal: nombre, extension };
}

export function normalizarChecksum(valor, campo = 'checksum') {
  const checksum = valor.toLowerCase();
  if (!SHA256.test(checksum)) throw invalido(campo, 'debe ser un hash SHA-256 en hexadecimal de 64 caracteres');
  return checksum;
}
