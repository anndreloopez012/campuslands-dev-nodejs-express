import * as authService from "../services/auth.service.js";
import { permisosDe } from "../config/permisos.js";

function login(req, res) {
    const data = authService.login(req.body);
    res.json({ ok: true, data });
}

// sirve para ver que puedo hacer con mi usuario
function misPermisos(req, res) {
    const { sub, nombre, rol } = req.usuario;
    res.json({ ok: true, data: { id: sub, nombre, rol, permisos: permisosDe(rol) } });
}

export { login, misPermisos };
