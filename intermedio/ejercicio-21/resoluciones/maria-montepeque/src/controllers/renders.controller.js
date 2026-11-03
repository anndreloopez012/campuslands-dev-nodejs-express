import * as rendersService from "../services/renders.service.js";
import { estadoDelCliente } from "../middlewares/rate-limit.middleware.js";

function listModelos(req, res) {
    const data = rendersService.findModelos();
    res.json({ ok: true, total: data.length, data });
}

function listRenders(req, res) {
    const data = rendersService.findRenders();
    res.json({ ok: true, total: data.length, data });
}

function crearRender(req, res) {
    const render = rendersService.crearRender(req.body);
    // 202 porque el render queda en cola, no esta listo todavia
    res.status(202).json({ ok: true, data: render });
}

function verLimites(req, res) {
    res.json({ ok: true, data: estadoDelCliente(req) });
}

export { listModelos, listRenders, crearRender, verLimites };
