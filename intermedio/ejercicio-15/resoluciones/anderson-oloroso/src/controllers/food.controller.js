import { signToken, verifyToken } from '../services/jwt.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'JWT basico' });

export const login = (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ ok: false, message: 'username y password son obligatorios.' });
  }

  if (password !== 'comida123') {
    return res.status(401).json({ ok: false, message: 'Credenciales inválidas.' });
  }

  const token = signToken({ username, role: 'comensal_vip', puestoFavorito: 'Tacos & Burguer Express' });
  return res.status(200).json({ ok: true, message: 'Inicio de sesión exitoso', token });
};

export const getProfile = (req, res) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, message: 'Cabecera Authorization: Bearer <token> requerida.' });
  }

  try {
    const token = auth.split(' ')[1];
    const user = verifyToken(token);
    return res.status(200).json({ ok: true, message: 'Perfil verificado con JWT', user });
  } catch (err) {
    return res.status(403).json({ ok: false, message: err.message });
  }
};
