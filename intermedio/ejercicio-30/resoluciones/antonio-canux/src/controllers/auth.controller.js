import { users } from '../data/users.data.js';
import { signToken } from '../utils/jwt.js';

export const login = (req, res) => {
  const { email, password } = req.body || {};
  const user = users.find((u) => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ ok: false, message: "Credenciales inválidas" });

  const token = signToken({ sub: user.id, email: user.email, role: user.role });
  res.status(200).json({ ok: true, token });
};
