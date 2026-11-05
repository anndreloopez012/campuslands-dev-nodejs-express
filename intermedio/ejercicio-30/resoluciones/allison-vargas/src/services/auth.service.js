import { NoAutenticadoError } from '../utils/errors.js';
import { hashPassword, verificarPassword } from '../utils/password.js';

const HASH_FALSO = hashPassword('contrasena-que-nadie-usa');

export const publico = ({ id, usuario, nombre, rol }) => ({ id, usuario, nombre, rol });

export function crearAuthService({ repositorio, tokens }) {
  function login({ usuario, password }) {
    const encontrado = repositorio.listar((u) => u.usuario === usuario)[0];
    const correcto = verificarPassword(password, encontrado ? encontrado.passwordHash : HASH_FALSO);
    if (!encontrado || !correcto || !encontrado.activo) {
      throw new NoAutenticadoError('Usuario o password incorrectos', 'CREDENCIALES_INVALIDAS');
    }
    const { token, exp } = tokens.emitir({ sub: encontrado.id });
    return { token, tipo: 'Bearer', expira: new Date(exp * 1000).toISOString(), usuario: publico(encontrado) };
  }

  function autenticar(token) {
    const { sub } = tokens.verificar(token);
    const usuario = repositorio.buscar(sub);
    if (!usuario || !usuario.activo) {
      throw new NoAutenticadoError('El usuario ya no tiene acceso', 'TOKEN_INVALIDO');
    }
    return publico(usuario);
  }

  return { login, autenticar };
}
