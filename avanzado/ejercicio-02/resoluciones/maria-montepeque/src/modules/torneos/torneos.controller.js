import { asyncHandler, parsearId } from "../../shared/http.js";

export function crearTorneosController(service) {
    return {
        listar: asyncHandler(async (req, res) => {
            const data = await service.listar();
            res.json({ ok: true, total: data.length, data });
        }),
        ver: asyncHandler(async (req, res) => {
            res.json({ ok: true, data: await service.buscar(parsearId(req.params.id)) });
        }),
        crear: asyncHandler(async (req, res) => {
            const data = await service.crear(req.body);
            res.status(201).location(`/api/torneos/${data.id}`).json({ ok: true, data });
        }),
        inscribir: asyncHandler(async (req, res) => {
            const data = await service.inscribir(parsearId(req.params.id), req.body);
            res.status(201).json({ ok: true, data });
        })
    };
}
