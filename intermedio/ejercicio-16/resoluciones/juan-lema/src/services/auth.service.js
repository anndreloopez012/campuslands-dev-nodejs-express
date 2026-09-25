import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const EXPIRES_IN = process.env.JWT_EXPIRES_IN || "15m";

const users = [
  { id: 1, username: "ana", password: "demo123", name: "Ana Suela" },
  { id: 2, username: "luis", password: "demo456", name: "Luis Cordon" },
];

function login({ username, password }) {
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return null;

  const token = jwt.sign({ sub: String(user.id), username: user.username }, SECRET, { algorithm: "HS256", expiresIn: EXPIRES_IN });
  return { token, expiresIn: EXPIRES_IN, user: { id: user.id, username: user.username, name: user.name } };
}

const verifyToken = (token) => jwt.verify(token, SECRET, { algorithms: ["HS256"] });

export { login, verifyToken };
