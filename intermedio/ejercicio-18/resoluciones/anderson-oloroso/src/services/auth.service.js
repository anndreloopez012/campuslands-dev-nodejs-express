import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';

let instructors = [];

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = scryptSync(password, salt, 64).toString('hex');
  return { salt, hash: derivedKey };
};

export const verifyPassword = (password, salt, storedHash) => {
  const derivedKey = scryptSync(password, salt, 64);
  const keyBuffer = Buffer.from(storedHash, 'hex');
  return timingSafeEqual(derivedKey, keyBuffer);
};

export const registerInstructor = ({ nombre, email, password, saltosRealizados }) => {
  const existing = instructors.find(i => i.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    const err = new Error('El correo electrónico ya está registrado.');
    err.statusCode = 409;
    throw err;
  }

  const { salt, hash } = hashPassword(password);
  const instructor = {
    id: instructors.length + 1,
    nombre,
    email: email.toLowerCase(),
    saltosRealizados: Number(saltosRealizados) || 50,
    salt,
    passwordHash: hash
  };

  instructors.push(instructor);
  return { id: instructor.id, nombre: instructor.nombre, email: instructor.email, saltosRealizados: instructor.saltosRealizados };
};

export const loginInstructor = ({ email, password }) => {
  const instructor = instructors.find(i => i.email.toLowerCase() === email.toLowerCase());
  if (!instructor) {
    const err = new Error('Credenciales incorrectas.');
    err.statusCode = 401;
    throw err;
  }

  const isValid = verifyPassword(password, instructor.salt, instructor.passwordHash);
  if (!isValid) {
    const err = new Error('Credenciales incorrectas.');
    err.statusCode = 401;
    throw err;
  }

  return { id: instructor.id, nombre: instructor.nombre, email: instructor.email, saltosRealizados: instructor.saltosRealizados };
};
