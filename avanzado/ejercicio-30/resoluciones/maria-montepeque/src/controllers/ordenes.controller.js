import { idValido, paginacion } from "../utils/errores.js";

// los controladores solo traducen HTTP <-> servicio (nada de reglas de negocio aqui)
export function crearOrdenesController(ordenes) {
    return {
        crear: (req, res) => res.status(201).json({ ok: true, data: ordenes.crear(req.usuario, req.body) }),
        listar: (req, res) => res.json({ ok: true, ...ordenes.listar({ estado: req.query.estado, placa: req.query.placa }, paginacion(req.query)) }),
        ver: (req, res) => res.json({ ok: true, data: ordenes.ver(idValido(req.params.id)) }),
        cambiarEstado: (req, res) => res.json({ ok: true, data: ordenes.cambiarEstado(req.usuario, idValido(req.params.id), req.body) }),
        agregarRepuesto: (req, res) => res.json({ ok: true, data: ordenes.agregarRepuesto(req.usuario, idValido(req.params.id), req.body) }),
        agregarManoDeObra: (req, res) => res.json({ ok: true, data: ordenes.agregarManoDeObra(req.usuario, idValido(req.params.id), req.body) }),
        pagar: (req, res) => {
            const { repetido, ...data } = ordenes.pagar(req.usuario, idValido(req.params.id), req.get("Idempotency-Key"), req.body);
            res.status(repetido ? 200 : 201).set("Idempotency-Replayed", String(repetido)).json({ ok: true, data });
        },
        historial: (req, res) => res.json({ ok: true, data: ordenes.historial(idValido(req.params.id)) })
    };
}
