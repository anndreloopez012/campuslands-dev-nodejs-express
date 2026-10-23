import jwt from "jsonwebtoken";
import { AppError } from "../errors.js";

const ROLE_PERMISSIONS = Object.freeze({
  recepcionista: ["motorcycles:read", "motorcycles:create", "workorders:read", "workorders:create"],
  mecanico: ["motorcycles:read", "workorders:read", "workorders:update"],
  admin: ["motorcycles:read", "motorcycles:create", "workorders:read", "workorders:create", "workorders:update", "workorders:delete"],
});

const SEED_USERS = Object.freeze([
  { id: 1, username: "recepcion", password: "demo123", name: "Nora Recepcion", role: "recepcionista" },
  { id: 2, username: "mecanico", password: "demo456", name: "Beto Mecanico", role: "mecanico" },
  { id: 3, username: "jefe", password: "demo789", name: "Ada Jefa", role: "admin" },
]);

const permissionsOf = (role) => ROLE_PERMISSIONS[role] ?? [];
const hasPermission = (role, permission) => permissionsOf(role).includes(permission);

function createAuthService({ users = SEED_USERS, jwtSecret, jwtExpiresIn = "15m" } = {}) {
  if (typeof jwtSecret !== "string" || !jwtSecret) throw new Error("createAuthService requiere jwtSecret");

  function login({ username, password }) {
    if (typeof username !== "string" || typeof password !== "string" || !username || !password) throw new AppError(400, "INVALID_BODY", "username y password son obligatorios");

    const user = users.find((candidate) => candidate.username === username && candidate.password === password);
    if (!user) throw new AppError(401, "INVALID_CREDENTIALS", "Credenciales invalidas");

    const token = jwt.sign({ sub: String(user.id), username: user.username, role: user.role }, jwtSecret, { algorithm: "HS256", expiresIn: jwtExpiresIn });
    return { token, expiresIn: jwtExpiresIn, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
  }

  function verify(token) {
    try {
      const { sub, username, role } = jwt.verify(token, jwtSecret, { algorithms: ["HS256"] });
      return { id: Number(sub), username, role };
    } catch (error) {
      throw new AppError(401, error.name === "TokenExpiredError" ? "TOKEN_EXPIRED" : "INVALID_TOKEN", error.name === "TokenExpiredError" ? "Token expirado" : "Token invalido");
    }
  }

  return { login, verify };
}

export { createAuthService, permissionsOf, hasPermission, SEED_USERS };
