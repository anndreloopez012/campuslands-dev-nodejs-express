import { permissionsOf } from "../services/auth.service.js";

const createAuthController = ({ auth }) => ({
  login: (req, res) => res.json({ ok: true, data: auth.login(req.body) }),
  me: (req, res) => res.json({ ok: true, data: { ...req.user, permissions: permissionsOf(req.user.role) } }),
});

export { createAuthController };
