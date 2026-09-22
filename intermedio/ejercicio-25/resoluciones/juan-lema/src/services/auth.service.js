import { randomUUID } from "node:crypto";
import { AppError } from "../errors.js";

const SEED_USERS = Object.freeze([
  { id: 1, username: "aria", password: "demo123", role: "player" },
  { id: 2, username: "brom", password: "demo456", role: "player" },
  { id: 3, username: "gm", password: "demo789", role: "admin" },
]);

const publicUser = ({ id, username, role }) => ({ id, username, role });

function createAuthService({ users = SEED_USERS } = {}) {
  const sessions = new Map();

  function login(input) {
    const { username, password } = input ?? {};
    if (typeof username !== "string" || typeof password !== "string" || !username || !password) throw new AppError(400, "INVALID_BODY", "username y password son obligatorios");

    const user = users.find((candidate) => candidate.username === username && candidate.password === password);
    if (!user) throw new AppError(401, "INVALID_CREDENTIALS", "Credenciales invalidas");

    const token = randomUUID();
    sessions.set(token, user);
    return { token, user: publicUser(user) };
  }

  const verify = (token) => (sessions.has(token) ? publicUser(sessions.get(token)) : null);
  const logout = (token) => sessions.delete(token);

  return { login, verify, logout };
}

export { createAuthService, SEED_USERS };
