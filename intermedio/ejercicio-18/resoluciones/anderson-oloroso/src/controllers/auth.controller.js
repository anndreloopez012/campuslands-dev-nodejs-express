import * as authService from '../services/auth.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'hash de passwords conceptual' });

export const register = (req, res) => {
  try {
    const { nombre, email, password, saltosRealizados } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ ok: false, message: 'nombre, email y password son obligatorios.' });
    }
    const user = authService.registerInstructor({ nombre, email, password, saltosRealizados });
    return res.status(201).json({ ok: true, message: 'Instructor de paracaidismo registrado (contraseña protegida con Salt y Hash)', data: user });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};

export const login = (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'email y password son obligatorios.' });
    }
    const user = authService.loginInstructor({ email, password });
    return res.status(200).json({ ok: true, message: 'Autenticación exitosa mediante verificación criptográfica', data: user });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};
