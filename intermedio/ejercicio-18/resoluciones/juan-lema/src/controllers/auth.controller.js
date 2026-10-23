import { registerUser, authenticateUser } from "../services/users.service.js";
import { hashPassword, verifyPassword } from "../services/password.service.js";

const MAX_DEMO_LENGTH = 128;

const sendError = (res, error) => (error.status ? res.status(error.status).json({ ok: false, message: error.message }) : res.status(500).json({ ok: false, message: "Error interno" }));

async function postRegister(req, res) {
  try {
    res.status(201).json({ ok: true, data: await registerUser(req.body || {}) });
  } catch (error) {
    sendError(res, error);
  }
}

async function postLogin(req, res) {
  const { username, password } = req.body || {};
  if (typeof username !== "string" || typeof password !== "string" || !username || !password) return res.status(400).json({ ok: false, message: "username y password son obligatorios" });

  try {
    const user = await authenticateUser({ username, password });
    if (!user) return res.status(401).json({ ok: false, message: "Credenciales invalidas" });

    res.json({ ok: true, data: user });
  } catch (error) {
    sendError(res, error);
  }
}

async function postHashDemo(req, res) {
  const { password } = req.body || {};
  if (typeof password !== "string" || !password || password.length > MAX_DEMO_LENGTH) return res.status(400).json({ ok: false, message: `password es obligatorio y admite hasta ${MAX_DEMO_LENGTH} caracteres` });

  try {
    const [hashA, hashB] = await Promise.all([hashPassword(password), hashPassword(password)]);
    res.json({
      ok: true,
      data: {
        hashA,
        hashB,
        sameHash: hashA === hashB,
        verifyA: await verifyPassword(password, hashA),
        verifyB: await verifyPassword(password, hashB),
        verifyWrongPassword: await verifyPassword(`${password}x`, hashA),
      },
    });
  } catch (error) {
    sendError(res, error);
  }
}

export { postRegister, postLogin, postHashDemo };
