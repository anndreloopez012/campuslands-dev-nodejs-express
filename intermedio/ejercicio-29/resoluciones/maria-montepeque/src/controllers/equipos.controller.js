import { parsearId } from "../utils/validar.js";

// los controladores solo leen la peticion, llaman al service y responden
export function crearEquiposController(equiposService) {
    return {
        listar(req, res) {
            const data = equiposService.listar(req.query.modalidad);
            res.json({ ok: true, total: data.length, data });
        },
        ver(req, res) {
            res.json({ ok: true, data: equiposService.buscar(parsearId(req.params.id)) });
        },
        crear(req, res) {
            const data = equiposService.crear(req.body);
            res.status(201).location(`/api/equipos/${data.id}`).json({ ok: true, data });
        },
        editar(req, res) {
            res.json({ ok: true, data: equiposService.editar(parsearId(req.params.id), req.body) });
        },
        borrar(req, res) {
            equiposService.borrar(parsearId(req.params.id));
            res.status(204).send();
        }
    };
}
