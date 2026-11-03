import { login } from "../services/auth.service.js";

function postLogin(req, res) {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) return res.status(400).json({ ok: false, message: "username y password son obligatorios" });

  const session = login({ username, password });
  if (!session) return res.status(401).json({ ok: false, message: "Credenciales invalidas" });

  res.json({ ok: true, data: session });
}

function getMe(req, res) {
  const { sub, username, iat, exp } = req.user;
  res.json({ ok: true, data: { id: Number(sub), username, issuedAt: new Date(iat * 1000).toISOString(), expiresAt: new Date(exp * 1000).toISOString() } });
}

export { postLogin, getMe };
