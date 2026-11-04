export const ROLES = ['cliente', 'vendedor', 'admin'];

export const tieneRol = (rolUsuario, rolMinimo) => ROLES.indexOf(rolUsuario) >= ROLES.indexOf(rolMinimo);
