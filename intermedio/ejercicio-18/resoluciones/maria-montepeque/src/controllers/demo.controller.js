import catchAsync from "../utils/catch-async.js";
import * as demoService from "../services/demo.service.js";

const hash = catchAsync(async (req, res) => {
    const data = await demoService.compararHashes(req.query.texto);
    res.json({ ok: true, data });
});

function baseDeDatos(req, res) {
    const data = demoService.verBaseDeDatos();
    res.json({ ok: true, message: "Esto es lo unico que se guarda, sin la password", data });
}

export { hash, baseDeDatos };
