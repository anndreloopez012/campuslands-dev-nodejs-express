const {
  ValidationError,
  UnauthorizedError,
  ForbiddenError
} = require('../errors/app.error');

const libros = [
  { id: 1, titulo: 'El Cartografo de Sombras', autor: 'R. Mendel', anio: 2014 },
  { id: 2, titulo: 'Lampareros', autor: 'L. Quirce', anio: 1998 },
  { id: 3, titulo: 'Atlas de Papel', autor: 'I. Saburo', anio: 2021 }
];

const usuarios = [
  { id: 1, usuario: 'lectora.ana', contrasena: 'secreta123', rol: 'lector' },
  { id: 2, usuario: 'bibliotecario', contrasena: 'biblio2026', rol: 'bibliotecario' }
];

const sesiones = []; // tokens activos de esta ejecucion

function login(usuario, contrasena) {
  if (!usuario || typeof usuario !== 'string') throw new ValidationError('El campo "usuario" es obligatorio');
  if (!contrasena || typeof contrasena !== 'string') throw new ValidationError('El campo "contrasena" es obligatorio');

  const found = usuarios.find((u) => u.usuario === usuario && u.contrasena === contrasena);
  if (!found) throw new UnauthorizedError();

  const token = `ses-${found.id}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const sesion = { token, usuario: found.usuario, rol: found.rol };
  sesiones.push(sesion);
  return sesion;
}

/** Valida el token y devuelve la sesion activa o lanza UnauthorizedError. */
function validarSesion(token) {
  if (!token) throw new UnauthorizedError('Token no enviado');
  const sesion = sesiones.find((s) => s.token === token);
  if (!sesion) throw new UnauthorizedError('Token invalido o sesion cerrada');
  return sesion;
}

function logout(token) {
  const indice = sesiones.findIndex((s) => s.token === token);
  if (indice === -1) throw new UnauthorizedError('Sesion no encontrada o ya cerrada');
  sesiones.splice(indice, 1);
}

function registrarLibro(token, datos) {
  const sesion = validarSesion(token);

  if (sesion.rol !== 'bibliotecario') {
    throw new ForbiddenError('Solo el rol "bibliotecario" registra libros');
  }

  const { titulo, autor, anio } = datos;
  if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
    throw new ValidationError('El campo "titulo" es obligatorio (minimo 3 caracteres)');
  }
  if (!autor || typeof autor !== 'string' || autor.trim().length < 3) {
    throw new ValidationError('El campo "autor" es obligatorio (minimo 3 caracteres)');
  }
  if (!Number.isInteger(anio) || anio < 1450 || anio > 2100) {
    throw new ValidationError('El campo "anio" debe ser un entero entre 1450 y 2100');
  }

  const nuevo = { id: libros.length + 1, titulo: titulo.trim(), autor: autor.trim(), anio };
  libros.push(nuevo);
  return nuevo;
}

function listarLibros() {
  return libros;
}

module.exports = { login, logout, validarSesion, registrarLibro, listarLibros };
