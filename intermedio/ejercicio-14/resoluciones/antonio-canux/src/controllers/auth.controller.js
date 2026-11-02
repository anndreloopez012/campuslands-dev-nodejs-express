import { randomUUID } from 'node:crypto';
import { users, sessions } from '../data/users.data.js';

export const login = (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ ok: false, message: "Credenciales inválidas" });

  // Token simulado: un UUID guardado en memoria (no es un JWT)
  const token = randomUUID();
  sessions.set(token, user.id);
  res.status(200).json({ ok: true, token });
};

export const me = (req, res) => {
  const { password, ...user } = users.find((u) => u.id === req.userId);
  res.status(200).json({ ok: true, data: user });
};

export const logout = (req, res) => {
  sessions.delete((req.headers.authorization || '').replace('Bearer ', ''));
  res.status(200).json({ ok: true, message: "Sesión cerrada" });
};
