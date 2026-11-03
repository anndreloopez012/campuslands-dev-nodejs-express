import { compuestosService, TABLA_PERIODICA } from "../container.js";

// para no repetir try/catch en las funciones async
const catchAsync = (handler) => (req, res, next) => Promise.resolve(handler(req, res, next)).catch(next);

function listElementos(req, res) {
    res.json({ ok: true, data: TABLA_PERIODICA });
}

function calcularMasa(req, res) {
    const data = compuestosService.masaMolar(req.query.formula);
    res.json({ ok: true, data });
}

const listCompuestos = catchAsync(async (req, res) => {
    const data = await compuestosService.listar();
    res.json({ ok: true, total: data.length, data });
});

const registrarCompuesto = catchAsync(async (req, res) => {
    const data = await compuestosService.registrar(req.body);
    res.status(201).json({ ok: true, data });
});

export { listElementos, calcularMasa, listCompuestos, registrarCompuesto };
