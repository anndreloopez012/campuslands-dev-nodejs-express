import catchAsync from "../utils/catch-async.js";
import * as authService from "../services/auth.service.js";

export const login = catchAsync(async (req, res) => {
    const data = await authService.login(req.body);
    res.json({ ok: true, data });
});

export function yo(req, res) {
    res.json({ ok: true, data: req.usuario });
}
