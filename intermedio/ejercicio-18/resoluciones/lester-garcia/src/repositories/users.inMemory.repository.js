import { hashPassword } from "../utils/passwordHasher.js";

const inMemoryUsers = [
  {
    id: "USR-SKYDIVER-01",
    name: "Felix Baumgartner",
    email: "felix@stratos.dropzone",
    passwordHash: await hashPassword("sky_jump_secret_2026"),
    licenseLevel: "Instructor_Tandem"
  }
];

export const findUserByEmail = async (email) => {
  const user = inMemoryUsers.find(
    (u) => u.email.toLowerCase() === email.toLowerCase().trim()
  );
  return user ? { ...user } : null;
};

export const findUserById = async (id) => {
  const user = inMemoryUsers.find((u) => u.id === String(id));
  return user ? { ...user } : null;
};

export const saveUser = async (userData) => {
  const newUser = { ...userData };
  inMemoryUsers.push(newUser);
  return { ...newUser };
};