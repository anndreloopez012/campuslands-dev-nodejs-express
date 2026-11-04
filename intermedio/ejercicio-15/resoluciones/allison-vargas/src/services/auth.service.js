import { usuariosRepository } from '../repositories/usuarios.repository.js';
import { ConflictError, NoAutenticadoError } from '../utils/errors.js';
import { hashear, verificar } from '../utils/password.js';
import { firmar, verificar as verificarToken } from '../utils/jwt.js';
import { usuarioPublico } from '../utils/usuarioPublico.js';
import { config } from '../utils/config.js';
import { ROLES } from '../constants/roles.js';

const hashFalso = await hashear('contrasena-de-relleno-1');

const opcionesJwt = () => ({ secreto: config.jwtSecreto, emisor: config.jwtEmisor });

export async function registrar({ nombre, email, password }) {
  if (usuariosRepository.buscarPorEmail(email)) {
    throw new ConflictError('Ya existe una cuenta con ese email', 'EMAIL_DUPLICADO');
  }
  const usuario = usuariosRepository.crear({
    nombre,
    email,
    rol: 'cliente',
    creadoEn: new Date().toISOString(),
    passwordHash: await hashear(password),
  });
  return usuarioPublico(usuario);
}

export async function iniciarSesion({ email, password }) {
  const usuario = usuariosRepository.buscarPorEmail(email);
  const coincide = await verificar(password, usuario ? usuario.passwordHash : hashFalso);
  if (!usuario || !coincide) {
    throw new NoAutenticadoError('Email o contrasena incorrectos', 'CREDENCIALES_INVALIDAS');
  }

  const { token, claims } = firmar(
    { sub: String(usuario.id), rol: usuario.rol },
    { ...opcionesJwt(), segundos: config.jwtExpiraSegundos },
  );

  return {
    accessToken: token,
    tipo: 'Bearer',
    expiraEnSegundos: config.jwtExpiraSegundos,
    expiraEn: new Date(claims.exp * 1000).toISOString(),
    usuario: usuarioPublico(usuario),
  };
}

export function leerToken(cabecera) {
  if (!cabecera) throw new NoAutenticadoError();

  const partes = /^Bearer\s+(\S+)$/i.exec(cabecera.trim());
  if (!partes) {
    throw new NoAutenticadoError('El header Authorization debe tener el formato: Bearer <token>', 'TOKEN_INVALIDO');
  }

  const claims = verificarToken(partes[1], opcionesJwt());
  const id = Number(claims.sub);
  if (!Number.isInteger(id) || id < 1 || !ROLES.includes(claims.rol)) {
    throw new NoAutenticadoError('El token no trae un usuario o rol valido', 'TOKEN_INVALIDO');
  }
  return { claims, usuario: { id, rol: claims.rol } };
}

export function perfil(id) {
  const usuario = usuariosRepository.buscar(id);
  if (!usuario) throw new NoAutenticadoError('El usuario del token ya no existe', 'TOKEN_INVALIDO');
  return usuarioPublico(usuario);
}

export function detalleToken(claims, ahora = Date.now()) {
  return {
    claims,
    emitidoEn: new Date(claims.iat * 1000).toISOString(),
    expiraEn: new Date(claims.exp * 1000).toISOString(),
    segundosRestantes: Math.max(0, claims.exp - Math.floor(ahora / 1000)),
  };
}
