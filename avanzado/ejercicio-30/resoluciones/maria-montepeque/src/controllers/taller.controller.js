import { idValido, paginacion } from "../utils/errores.js";

// auth, motos y repuestos (son cortos, van juntos)
export function crearTallerController({ auth, motos, repuestos }) {
    return {
        login: (req, res) => res.json({ ok: true, data: auth.login(req.body) }),
        yo: (req, res) => res.json({ ok: true, data: req.usuario }),

        listarMotos: (req, res) => {
            const clienteId = req.query.clienteId !== undefined ? idValido(req.query.clienteId, "clienteId") : undefined;
            res.json({ ok: true, ...motos.listar({ marca: req.query.marca, clienteId }, paginacion(req.query)) });
        },
        crearMoto: (req, res) => res.status(201).json({ ok: true, data: motos.crear(req.body) }),

        listarRepuestos: (req, res) => res.json({ ok: true, data: repuestos.listar({ bajoStock: req.query.bajoStock === "true" }) }),
        ajustarStock: (req, res) => res.json({ ok: true, data: repuestos.ajustarStock(idValido(req.params.id), req.body) })
    };
}
