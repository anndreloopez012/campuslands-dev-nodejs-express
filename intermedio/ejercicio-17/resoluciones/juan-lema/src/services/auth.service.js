import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

const ROLE_PERMISSIONS = {
  viajero: ["tours:read"],
  guia: ["tours:read", "tours:create"],
  admin: ["tours:read", "tours:create", "tours:delete"],
};

const users = [
  { id: 1, username: "mia", password: "demo123", name: "Mia Viajera", role: "viajero" },
  { id: 2, username: "gabo", password: "demo456", name: "Gabo Guia", role: "guia" },
  { id: 3, username: "ada", password: "demo789", name: "Ada Admin", role: "admin" },
];

const permissionsOf = (role) => ROLE_PERMISSIONS[role] ?? [];
const hasPermission = (role, permission) => permissionsOf(role).includes(permission);

function login({ username, password }) {
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return null;

  const token = jwt.sign({ sub: String(user.id), username: user.username, role: user.role }, SECRET, { algorithm: "HS256", expiresIn: EXPIRES_IN });
  return { token, expiresIn: EXPIRES_IN, user: { id: user.id, username: user.username, name: user.name, role: user.role } };
}

const verifyToken = (token) => jwt.verify(token, SECRET, { algorithms: ["HS256"] });

export { login, verifyToken, permissionsOf, hasPermission };
