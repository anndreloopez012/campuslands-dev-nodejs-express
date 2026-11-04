export const ROLES = ['viajero', 'guia', 'agente', 'admin'];

const BASE = {
  viajero: [
    'reservas:crear',
    'reservas:ver-propias',
    'reservas:cancelar-propias',
  ],
  guia: [
    'tours:gestionar-propios',
    'reservas:ver-de-mis-tours',
    'reservas:confirmar-de-mis-tours',
  ],
  agente: [
    'destinos:gestionar',
    'tours:gestionar-todos',
    'tours:ver-borradores',
    'tours:eliminar',
    'reservas:ver-todas',
    'reservas:confirmar-todas',
    'reservas:cancelar-todas',
    'usuarios:ver',
  ],
  admin: [
    'destinos:eliminar',
    'usuarios:cambiar-rol',
  ],
};

export const PERMISOS_POR_ROL = {
  viajero: [...BASE.viajero],
  guia: [...BASE.viajero, ...BASE.guia],
  agente: [...BASE.viajero, ...BASE.guia, ...BASE.agente],
  admin: [...BASE.viajero, ...BASE.guia, ...BASE.agente, ...BASE.admin],
};

export const permisosDe = (rol) => PERMISOS_POR_ROL[rol] ?? [];

export const tienePermiso = (usuario, permiso) => permisosDe(usuario.rol).includes(permiso);

export const tieneAlguno = (usuario, permisos) => permisos.some((permiso) => tienePermiso(usuario, permiso));
