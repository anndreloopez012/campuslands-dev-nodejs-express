import { usuariosRepository } from '../repositories/usuarios.repository.js';
import { ConflictError, NoAutenticadoError, ValidationError } from '../utils/errors.js';
import { hashear, verificar } from '../utils/hash.js';
import { usuarioPublico } from '../utils/usuarioPublico.js';

const hashFalso = await hashear('contrasena-de-relleno-1');

const credencialesInvalidas = () => new NoAutenticadoError('Email o contrasena incorrectos', 'CREDENCIALES_INVALIDAS');

export async function registrar({ nombre, email, password, licencia }) {
  if (usuariosRepository.buscarPorEmail(email)) {
    throw new ConflictError('Ya existe una cuenta con ese email', 'EMAIL_DUPLICADO');
  }
  const usuario = usuariosRepository.crear({
    nombre,
    email,
    licencia,
    creadoEn: new Date().toISOString(),
    passwordHash: await hashear(password),
  });
  return usuarioPublico(usuario);
}

export async function iniciarSesion({ email, password }) {
  const usuario = usuariosRepository.buscarPorEmail(email);
  const { coincide, necesitaActualizar } = await verificar(password, usuario ? usuario.passwordHash : hashFalso);
  if (!usuario || !coincide) throw credencialesInvalidas();

  let hashActualizado = false;
  if (necesitaActualizar) {
    usuariosRepository.actualizar(usuario.id, { passwordHash: await hashear(password) });
    hashActualizado = true;
  }
  return { usuario: usuarioPublico(usuario), hashActualizado };
}

export async function cambiarPassword({ email, passwordActual, passwordNueva }) {
  const usuario = usuariosRepository.buscarPorEmail(email);
  const { coincide } = await verificar(passwordActual, usuario ? usuario.passwordHash : hashFalso);
  if (!usuario || !coincide) throw credencialesInvalidas();

  if (passwordNueva === passwordActual) {
    throw new ValidationError('La contrasena nueva debe ser distinta a la actual', [{ campo: 'passwordNueva', mensaje: 'debe ser distinta a la actual' }], 'PASSWORD_IGUAL');
  }
  usuariosRepository.actualizar(usuario.id, { passwordHash: await hashear(passwordNueva) });
}
