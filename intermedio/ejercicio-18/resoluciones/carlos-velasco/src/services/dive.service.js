const { ValidationError, UnauthorizedError } = require('../errors/app.error');
const passwordModule = require('../auth/password.hash');

const saltadores = [
  // hash precalculado de "salto2026" para el usuario de ejemplo
  { id: 1, nombre: 'Alura Diaz', licencia: 'AFF', hash: passwordModule.hash('salto2026') }
];

function listarSaltadores() {
  return saltadores.map(({ id, nombre, licencia }) => ({ id, nombre, licencia }));
}

function registrar(datos) {
  const { nombre, licencia, contrasena } = datos;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3) {
    throw new ValidationError('El campo "nombre" es obligatorio (minimo 3 caracteres)');
  }
  if (!['AFF', 'tandem', 'solo'].includes(licencia)) {
    throw new ValidationError('La licencia debe ser: AFF, tandem o solo');
  }

  const nivel = passwordModule.robustez(contrasena ?? '');
  if (typeof contrasena !== 'string' || contrasena.length < 8) {
    throw new ValidationError('El campo "contrasena" debe tener al menos 8 caracteres');
  }

  const nuevo = {
    id: saltadores.length + 1,
    nombre: nombre.trim(),
    licencia,
    // NUNCA se guarda la contrasena plana: se guarda el hash con su salt
    hash: passwordModule.hash(contrasena)
  };
  saltadores.push(nuevo);

  return { ...listarSaltadores().slice(-1)[0], contrasena_nivel: nivel.nivel };
}

function login(nombre, contrasena) {
  if (!nombre || !contrasena) throw new ValidationError('Los campos "nombre" y "contrasena" son obligatorios');

  const found = saltadores.find((s) => s.nombre === nombre);
  // Mensaje unico aunque el usuario no exista: no se filtra informacion de registro
  if (!found || !passwordModule.verificar(contrasena, found.hash)) {
    throw new UnauthorizedError('Credenciales invalidas');
  }
  return { id: found.id, nombre: found.nombre, licencia: found.licencia };
}

module.exports = { listarSaltadores, registrar, login };
