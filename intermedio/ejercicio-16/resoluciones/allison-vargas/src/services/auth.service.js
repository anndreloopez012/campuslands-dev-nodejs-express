import { usuariosRepository } from '../repositories/usuarios.repository.js';
import { ConflictError, NoAutenticadoError } from '../utils/errors.js';
import { hashear, verificar } from '../utils/password.js';
import { firmar, verificar as verificarToken } from '../utils/jwt.js';
import { usuarioPublico } from '../utils/usuarioPublico.js';
import { config } from '../utils/config.js';

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

  const { token, claims } = firmar({ sub: String(usuario.id) }, { ...opcionesJwt(), segundos: config.jwtExpiraSegundos });

  return {
    accessToken: token,
    tipo: 'Bearer',
    expiraEnSegundos: config.jwtExpiraSegundos,
    expiraEn: new Date(claims.exp * 1000).toISOString(),
    usuario: usuarioPublico(usuario),
  };
}

export function identificar(cabecera) {
  const partes = /^Bearer\s+(\S+)$/i.exec(cabecera.trim());
  if (!partes) {
    throw new NoAutenticadoError('El header Authorization debe tener el formato: Bearer <token>', 'TOKEN_INVALIDO');
  }

  const claims = verificarToken(partes[1], opcionesJwt());
  const usuario = usuariosRepository.buscar(Number(claims.sub));
  if (!usuario) throw new NoAutenticadoError('El usuario del token ya no existe', 'TOKEN_INVALIDO');
  return usuarioPublico(usuario);
}
