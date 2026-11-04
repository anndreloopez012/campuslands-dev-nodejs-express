import { usuariosRepository } from '../repositories/usuarios.repository.js';
import { sesionesRepository } from '../repositories/sesiones.repository.js';
import { intentosRepository } from '../repositories/intentos.repository.js';
import {
  ConflictError,
  DemasiadosIntentosError,
  NoAutenticadoError,
  PermisoError,
  ValidationError,
} from '../utils/errors.js';
import { hashear, verificar } from '../utils/password.js';
import { generarToken, huella } from '../utils/tokens.js';
import { usuarioPublico } from '../utils/usuarioPublico.js';
import { config } from '../utils/config.js';

const hashFalso = await hashear('contrasena-de-relleno-1');
const GRACIA_SESIONES_MS = 10 * 60 * 1000;

export async function registrar({ nombre, email, password }) {
  if (usuariosRepository.buscarPorEmail(email)) {
    throw new ConflictError('Ya existe una cuenta con ese email', 'EMAIL_DUPLICADO');
  }
  const usuario = usuariosRepository.crear({
    nombre,
    email,
    rol: 'lector',
    activo: true,
    creadoEn: new Date().toISOString(),
    passwordHash: await hashear(password),
  });
  return usuarioPublico(usuario);
}

export async function iniciarSesion({ email, password }) {
  const ahora = Date.now();
  const espera = intentosRepository.segundosDeBloqueo(email, ahora);
  if (espera > 0) throw new DemasiadosIntentosError(espera);

  const usuario = usuariosRepository.buscarPorEmail(email);
  const coincide = await verificar(password, usuario ? usuario.passwordHash : hashFalso);
  if (!usuario || !coincide) {
    intentosRepository.registrarFallo(email, ahora, config);
    throw new NoAutenticadoError('Email o contrasena incorrectos', 'CREDENCIALES_INVALIDAS');
  }
  if (!usuario.activo) throw new PermisoError('La cuenta esta desactivada', 'CUENTA_DESACTIVADA');

  intentosRepository.limpiar(email);
  sesionesRepository.purgarVencidas(ahora - GRACIA_SESIONES_MS);

  const token = generarToken();
  const expiraEn = ahora + config.sesionSegundos * 1000;
  sesionesRepository.crear({
    huella: huella(token),
    usuarioId: usuario.id,
    creadaEn: new Date(ahora).toISOString(),
    expiraEn,
  });

  return {
    token,
    tipo: 'Bearer',
    expiraEnSegundos: config.sesionSegundos,
    expiraEn: new Date(expiraEn).toISOString(),
    usuario: usuarioPublico(usuario),
  };
}

export function resolverSesion(cabecera) {
  if (!cabecera) throw new NoAutenticadoError();

  const partes = /^Bearer\s+(\S+)$/i.exec(cabecera.trim());
  if (!partes) {
    throw new NoAutenticadoError('El header Authorization debe tener el formato: Bearer <token>', 'TOKEN_INVALIDO');
  }

  const sesion = sesionesRepository.buscar(huella(partes[1]));
  if (!sesion) throw new NoAutenticadoError('El token no es valido o la sesion ya se cerro', 'TOKEN_INVALIDO');
  if (sesion.expiraEn <= Date.now()) {
    throw new NoAutenticadoError('La sesion expiro, inicia sesion de nuevo', 'TOKEN_EXPIRADO');
  }

  const usuario = usuariosRepository.buscar(sesion.usuarioId);
  if (!usuario || !usuario.activo) {
    sesionesRepository.eliminar(sesion.huella);
    throw new NoAutenticadoError('El token no es valido o la sesion ya se cerro', 'TOKEN_INVALIDO');
  }

  return { sesion, usuario: usuarioPublico(usuario) };
}

export function cerrarSesion(sesion) {
  sesionesRepository.eliminar(sesion.huella);
}

export async function cambiarPassword(usuarioActual, sesion, { passwordActual, passwordNueva }) {
  const usuario = usuariosRepository.buscar(usuarioActual.id);
  if (!(await verificar(passwordActual, usuario.passwordHash))) {
    throw new PermisoError('La contrasena actual no es correcta', 'PASSWORD_ACTUAL_INCORRECTA');
  }
  if (passwordActual === passwordNueva) {
    throw new ValidationError('Datos invalidos', [
      { campo: 'passwordNueva', mensaje: 'debe ser distinta a la contrasena actual' },
    ]);
  }
  usuariosRepository.actualizar(usuario.id, { passwordHash: await hashear(passwordNueva) });
  return { sesionesCerradas: sesionesRepository.eliminarDeUsuario(usuario.id, sesion.huella) };
}
