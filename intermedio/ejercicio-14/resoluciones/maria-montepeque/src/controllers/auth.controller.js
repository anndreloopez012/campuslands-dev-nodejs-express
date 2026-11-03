import * as authService from "../services/auth.service.js";

function login(req, res) {
    const data = authService.login(req.body);
    res.json({ ok: true, data });
}

// req.usuario lo pone el middleware requireAuth
function me(req, res) {
    res.json({ ok: true, data: req.usuario });
}

function logout(req, res) {
    authService.logout(req.token);
    res.json({ ok: true, message: "Sesion cerrada" });
}

export { login, me, logout };
