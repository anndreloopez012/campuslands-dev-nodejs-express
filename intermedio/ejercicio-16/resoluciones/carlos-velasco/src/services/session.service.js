const usuarios = [
  { id: 1, usuario: 'clienta.lu', contrasena: 'tienda1', rol: 'cliente' },
  { id: 2, usuario: 'stock.dana', contrasena: 'bodega9', rol: 'inventario' },
  { id: 3, usuario: 'admin.max', contrasena: 'root2026', rol: 'admin' }
];

const sesiones = [];

function login(usuario, contrasena) {
  if (!usuario || !contrasena) {
    throw new ValidationError('Los campos "usuario" y "contrasena" son obligatorios');
  }

  const found = usuarios.find((u) => u.usuario === usuario && u.contrasena === contrasena);
  if (!found) throw new UnauthorizedError('Credenciales invalidas');

  const token = `tk-${found.id}-${Math.random().toString(36).slice(2, 12)}`;
  const sesion = { token, usuario: found.usuario, rol: found.rol };
  sesiones.push(sesion);
  return sesion;
}

function sesionPorToken(token) {
  if (!token) throw new UnauthorizedError('Token no enviado');
  const sesion = sesiones.find((s) => s.token === token);
  if (!sesion) throw new UnauthorizedError('Token invalido');
  return sesion;
}

function logout(token) {
  const indice = sesiones.findIndex((s) => s.token === token);
  if (indice === -1) throw new UnauthorizedError('Sesion no encontrada');
  sesiones.splice(indice, 1);
}

module.exports = { login, sesionPorToken, logout };
