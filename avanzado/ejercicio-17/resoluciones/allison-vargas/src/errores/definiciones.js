import { erroresBase } from './base.js';

export const definiciones = {
  ...erroresBase,
  NO_AUTENTICADO: [401, () => 'Falta el token de acceso (Authorization: Bearer ...)'],
  TOKEN_INVALIDO: [401, () => 'El token de acceso no es valido'],
  TOKEN_EXPIRADO: [401, () => 'El token de acceso expiro; usa el refresh token para obtener otro'],
  CREDENCIALES_INVALIDAS: [401, () => 'Correo o contrasena incorrectos'],
  REFRESH_INVALIDO: [401, () => 'El refresh token no es valido'],
  REFRESH_EXPIRADO: [401, () => 'El refresh token expiro; inicia sesion de nuevo'],
  REFRESH_REUTILIZADO: [401, () => 'Se uso un refresh token ya cambiado; por seguridad se cerro la sesion'],
  SESION_REVOCADA: [401, () => 'La sesion fue cerrada'],
  PROHIBIDO: [403, () => 'No tienes permiso para esta accion'],
  DESTINO_NO_ENCONTRADO: [404, (c) => `No existe el destino ${c.destinoId}`],
  RESERVA_NO_ENCONTRADA: [404, (c) => `No existe la reserva ${c.reservaId}`],
  SESION_NO_ENCONTRADA: [404, (c) => `No existe la sesion ${c.sesionId}`],
  CUPOS_INSUFICIENTES: [409, (c) => `Quedan ${c.disponibles} cupos para ${c.destino}`],
  LOGIN_BLOQUEADO: [429, () => 'Demasiados intentos fallidos; espera antes de intentar de nuevo'],
};
