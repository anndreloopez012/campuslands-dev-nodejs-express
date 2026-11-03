import { hashPassword, verifyPassword } from "./password.service.js";

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i;
const MIN_PASSWORD_LENGTH = 8;
const TIMING_DECOY_HASH = await hashPassword("decoy-password");

const users = [{ id: 1, username: "skydiver", name: "Sofia Salto", passwordHash: await hashPassword("paracaidas123") }];
let nextId = 2;

const publicUser = ({ id, username, name }) => ({ id, username, name });

function fail(status, message) {
  const error = new Error(message);
  error.status = status;
  throw error;
}

async function registerUser({ username, password, name }) {
  if (typeof username !== "string" || !USERNAME_PATTERN.test(username)) fail(400, "username debe tener 3-20 caracteres: letras, numeros o guion bajo");
  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) fail(400, `password debe tener al menos ${MIN_PASSWORD_LENGTH} caracteres`);
  if (typeof name !== "string" || !name.trim()) fail(400, "name es obligatorio");
  if (users.some((u) => u.username.toLowerCase() === username.toLowerCase())) fail(409, `username ${username} ya esta registrado`);

  const user = { id: nextId++, username, name: name.trim(), passwordHash: await hashPassword(password) };
  users.push(user);
  return publicUser(user);
}

async function authenticateUser({ username, password }) {
  const user = users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  if (!user) {
    await verifyPassword(password, TIMING_DECOY_HASH);
    return null;
  }

  return (await verifyPassword(password, user.passwordHash)) ? publicUser(user) : null;
}

export { registerUser, authenticateUser };
