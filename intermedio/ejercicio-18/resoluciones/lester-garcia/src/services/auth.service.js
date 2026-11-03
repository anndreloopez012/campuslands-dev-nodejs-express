import jwt from "jsonwebtoken";
import * as usersRepo from "../repositories/users.inMemory.repository.js";
import { hashPassword, verifyPassword } from "../utils/passwordHasher.js";
import { UnauthorizedError, ConflictError } from "../utils/customErrors.js";

export const registerSkydiverService = async ({ name, email, password, licenseLevel }) => {
  const existing = await usersRepo.findUserByEmail(email);
  if (existing) {
    throw new ConflictError(`El correo '${email}' ya se encuentra registrado en el club.`);
  }

  // 1. Hashear contraseña con sal criptográfica única
  const passwordHash = await hashPassword(password);

  // 2. Persistir usuario sin almacenar texto plano
  const newUser = await usersRepo.saveUser({
    id: `USR-SKYDIVER-${Date.now()}`,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    passwordHash,
    licenseLevel: licenseLevel ? licenseLevel.trim() : "Tandem_Student"
  });

  return {
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
    licenseLevel: newUser.licenseLevel
  };
};

export const loginSkydiverService = async ({ email, password }) => {
  const user = await usersRepo.findUserByEmail(email);
  if (!user) {
    throw new UnauthorizedError("Credenciales inválidas. Correo o contraseña errónea.");
  }

  // Verificación computacionalmente segura resistente a Timing Attacks
  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Credenciales inválidas. Correo o contraseña errónea.");
  }

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    licenseLevel: user.licenseLevel
  };

  const secret = process.env.JWT_SECRET || "fallback_default_secret_jwt_2026";
  const expiresIn = process.env.JWT_EXPIRES_IN || "2h";
  const token = jwt.sign(payload, secret, { expiresIn });

  return {
    skydiver: payload,
    token,
    tokenType: "Bearer",
    expiresIn
  };
};

export const getProfileService = async (userId) => {
  const user = await usersRepo.findUserById(userId);
  if (!user) {
    throw new UnauthorizedError("El paracaidista no fue encontrado.");
  }
  const { passwordHash, ...safeProfile } = user;
  return safeProfile;
};