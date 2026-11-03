import * as personajes from "../../services/personajes.service.js";
import { aV2 } from "./mapper.js";
import { validarCrearV2, leerPaginacion, leerId } from "./validator.js";

// arma el link a otra pagina manteniendo los demas filtros
function linkPagina(req, page) {
    const params = new URLSearchParams({ ...req.query, page: String(page) });
    return `/api/v2/personajes?${params}`;
}

export function listar(req, res) {
    const { page, limit } = leerPaginacion(req.query);
    const todos = personajes.listar({ clase: req.query.clase });

    const total = todos.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const data = todos.slice((page - 1) * limit, page * limit).map(aV2);

    res.json({
        ok: true,
        data,
        meta: { page, limit, total, totalPages },
        links: {
            self: linkPagina(req, page),
            next: page < totalPages ? linkPagina(req, page + 1) : null,
            prev: page > 1 ? linkPagina(req, page - 1) : null
        }
    });
}

export function ver(req, res) {
    res.json({ ok: true, data: aV2(personajes.buscar(leerId(req.params.id))) });
}

export function crear(req, res) {
    const nuevo = aV2(personajes.crear(validarCrearV2(req.body)));
    res.status(201).location(nuevo.links.self).json({ ok: true, data: nuevo });
}

// ruta nueva que la v1 no tiene
export function subirNivel(req, res) {
    res.json({ ok: true, data: aV2(personajes.subirNivel(leerId(req.params.id))) });
}
