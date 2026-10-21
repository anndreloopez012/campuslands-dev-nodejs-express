import jwt from "jsonwebtoken";
import * as usersRepo from "../repositories/users.inMemory.repository.js";
import { UnauthorizedError } from "../utils/customErrors.js";

export const loginService = async ({ email, password }) => {
  const user = await usersRepo.findUserByEmail(email);

  if (!user || user.password !== password) {
    throw new UnauthorizedError("Credenciales inválidas. Email o contraseña incorrectos.");
  }

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  const secret = process.env.JWT_SECRET || "fallback_default_secret_jwt_2026";
  const expiresIn = process.env.JWT_EXPIRES_IN || "2h";

  // Firma del token JWT estándar RFC 7519
  const token = jwt.sign(payload, secret, { expiresIn });

  return {
    user: payload,
    token,
    tokenType: "Bearer",
    expiresIn
  };
};

export const getProfileService = async (userId) => {
  const user = await usersRepo.findUserById(userId);
  if (!user) {
    throw new UnauthorizedError("El usuario asociado al token ya no existe.");
  }

  const { password, ...safeUser } = user;
  return safeUser;
};