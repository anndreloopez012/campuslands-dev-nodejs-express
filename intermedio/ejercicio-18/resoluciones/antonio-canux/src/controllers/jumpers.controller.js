import { jumpers } from '../data/jumpers.data.js';
import { hashPassword, verifyPassword } from '../utils/password.js';

export const register = (req, res) => {
  const { name, password } = req.body || {};
  if (!name || typeof password !== 'string' || password.length < 8) {
    return res.status(400).json({ ok: false, message: "Se requiere name y password de al menos 8 caracteres" });
  }
  if (jumpers.some((j) => j.name === name)) {
    return res.status(409).json({ ok: false, message: "El saltador ya existe" });
  }

  const jumper = { id: jumpers.length + 1, name, passwordHash: hashPassword(password) };
  jumpers.push(jumper);

  // Nunca se devuelve el hash
  res.status(201).json({ ok: true, data: { id: jumper.id, name: jumper.name } });
};

export const login = (req, res) => {
  const { name, password } = req.body || {};
  const jumper = jumpers.find((j) => j.name === name);

  if (!jumper || !verifyPassword(String(password), jumper.passwordHash)) {
    return res.status(401).json({ ok: false, message: "Credenciales inválidas" });
  }
  res.status(200).json({ ok: true, message: "Login correcto" });
};
