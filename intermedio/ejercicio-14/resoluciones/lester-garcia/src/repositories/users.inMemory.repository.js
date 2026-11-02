const inMemoryUsers = [
  {
    id: "USR-01",
    name: "Gabriel García",
    email: "editor@macondo.org",
    password: "literary_pass_123", // Contraseña simple para el simulador
    role: "Editor"
  },
  {
    id: "USR-02",
    name: "Sor Juana Inés",
    email: "lectora@barroco.lit",
    password: "poesia_secreta_456",
    role: "Lector"
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