export const ROLES = ['lector', 'editor', 'admin'];

export const tieneRol = (rolUsuario, rolMinimo) => ROLES.indexOf(rolUsuario) >= ROLES.indexOf(rolMinimo);
