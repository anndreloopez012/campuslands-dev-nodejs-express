import catchAsync from "../utils/catch-async.js";
import * as authService from "../services/auth.service.js";

const registro = catchAsync(async (req, res) => {
    const data = await authService.registro(req.body);
    res.status(201).json({ ok: true, data });
});

const login = catchAsync(async (req, res) => {
    const data = await authService.login(req.body);
    res.json({ ok: true, message: "Login correcto", data });
});

const cambiarPassword = catchAsync(async (req, res) => {
    await authService.cambiarPassword(req.body);
    res.json({ ok: true, message: "Password actualizada" });
});

function listar(req, res) {
    const data = authService.listar();
    res.json({ ok: true, total: data.length, data });
}

export { registro, login, cambiarPassword, listar };
