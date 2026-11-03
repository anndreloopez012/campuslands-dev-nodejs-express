import * as authService from "../services/auth.service.js";

function login(req, res) {
    const data = authService.login(req.body);
    res.json({ ok: true, data });
}

// muestra lo que trae el token ya verificado
function perfil(req, res) {
    res.json({ ok: true, data: req.usuario });
}

export { login, perfil };
