import * as authService from "../services/auth.service.js";

function login(req, res) {
    const data = authService.login(req.body);
    res.json({ ok: true, data });
}

export { login };
