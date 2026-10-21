import * as usersRepo from "../repositories/users.inMemory.repository.js";
import { generateSimulatedToken } from "../utils/tokenSimulator.js";
import { UnauthorizedError } from "../utils/customErrors.js";

export const loginService = async ({ email, password }) => {
  const user = await usersRepo.findUserByEmail(email);

  if (!user || user.password !== password) {
    throw new UnauthorizedError("Credenciales inválidas. Correo o contraseña errónea.");
  }

  // Generar token con payload del usuario (válido por 2 horas)
  const token = generateSimulatedToken({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    token,
    tokenType: "Bearer",
    expiresIn: "2 hours"
  };
};

export const getSessionProfileService = async (userId) => {
  const user = await usersRepo.findUserById(userId);
  if (!user) {
    throw new UnauthorizedError("El usuario de la sesión ya no existe en el sistema.");
  }

  const { password, ...safeUser } = user;
  return safeUser;
};