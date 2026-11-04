import { ROLES, permisosDe } from '../constants/permisos.js';

export const matriz = () => ROLES.map((rol) => ({ rol, permisos: permisosDe(rol) }));
