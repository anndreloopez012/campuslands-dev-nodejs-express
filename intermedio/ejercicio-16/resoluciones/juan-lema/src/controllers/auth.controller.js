import { login } from "../services/auth.service.js";

function postLogin(req, res) {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) return res.status(400).json({ ok: false, message: "username y password son obligatorios" });

  const session = login({ username, password });
  if (!session) return res.status(401).json({ ok: false, message: "Credenciales invalidas" });

  res.json({ ok: true, data: session });
}

export { postLogin };
