import { calcularTabla } from "../services/tabla.service.js";

export function crearPartidosController({ partidosService, equiposService }) {
    return {
        listar(req, res) {
            const data = partidosService.listar(req.query.equipoId);
            res.json({ ok: true, total: data.length, data });
        },
        registrar(req, res) {
            res.status(201).json({ ok: true, data: partidosService.registrar(req.body) });
        },
        tabla(req, res) {
            const { modalidad } = req.query;
            equiposService.exigirModalidad(modalidad);

            const equipos = equiposService.listar(modalidad);
            const data = calcularTabla(equipos, partidosService.listar());
            res.json({ ok: true, modalidad, data });
        }
    };
}
