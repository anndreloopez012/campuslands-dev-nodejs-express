import { randomUUID } from "node:crypto";

const users = [
  { id: 1, username: "lector", password: "demo123", name: "Laura Lector" },
  { id: 2, username: "editor", password: "demo456", name: "Erik Editor" },
];
const sessions = new Map();

const publicUser = ({ id, username, name }) => ({ id, username, name });

function login({ username, password }) {
  const user = users.find((u) => u.username === username && u.password === password);
  if (!user) return null;

  const token = randomUUID();
  sessions.set(token, user.id);
  return { token, user: publicUser(user) };
}

function getUserByToken(token) {
  const user = users.find((u) => u.id === sessions.get(token));
  return user ? publicUser(user) : null;
}

const logout = (token) => sessions.delete(token);

export { login, getUserByToken, logout };
