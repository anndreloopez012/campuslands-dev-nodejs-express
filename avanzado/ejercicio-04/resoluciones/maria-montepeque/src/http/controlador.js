import * as partidas from "../servicios/partidas.servicio.js";
import { error } from "../dominio/errores.js";
import { catalogoPublico, codeDeSlug } from "./problemas.js";

// validacion de entrada sencilla: si algo falla es DATOS_INVALIDOS con la lista
function entero(valor, nombre, errores) {
    const numero = typeof valor === "string" && /^\d+$/.test(valor) ? Number(valor) : valor;
    if (!Number.isInteger(numero) || numero < 1) errores.push(`${nombre} debe ser un entero positivo`);
    return numero;
}

function exigirSinErrores(errores) {
    if (errores.length > 0) {
        throw error("DATOS_INVALIDOS", "Revisa los datos enviados", { errores });
    }
}

function idPartida(req) {
    const errores = [];
    const id = entero(req.params.id, "id", errores);
    exigirSinErrores(errores);
    return id;
}

export function ver(req, res) {
    res.json({ ok: true, data: partidas.ver(idPartida(req)) });
}

export function recoger(req, res) {
    const errores = [];
    const id = entero(req.params.id, "id", errores);
    const itemId = entero(req.body?.itemId, "itemId", errores);
    exigirSinErrores(errores);

    res.json({ ok: true, data: partidas.recoger(id, req.params.gamertag, itemId) });
}

export function usar(req, res) {
    const errores = [];
    const id = entero(req.params.id, "id", errores);
    const itemId = entero(req.body?.itemId, "itemId", errores);
    exigirSinErrores(errores);

    res.json({ ok: true, data: partidas.usar(id, req.params.gamertag, itemId) });
}

export function disparar(req, res) {
    const errores = [];
    const id = entero(req.params.id, "id", errores);
    const armaId = entero(req.body?.armaId, "armaId", errores);
    const objetivo = req.body?.objetivo;
    if (typeof objetivo !== "string" || objetivo.trim() === "") errores.push("objetivo es obligatorio");
    exigirSinErrores(errores);

    res.json({ ok: true, data: partidas.disparar(id, req.params.gamertag, { objetivo, armaId }) });
}

export function listarErrores(req, res) {
    res.json({ ok: true, data: catalogoPublico() });
}

// el "type" de cada problema apunta aqui, asi se puede leer que significa
export function verError(req, res) {
    const entrada = catalogoPublico().find((e) => e.code === codeDeSlug(req.params.slug));
    if (!entrada) {
        return res.status(404).json({ ok: false, message: `No hay un error ${req.params.slug} en el catalogo` });
    }
    res.json({ ok: true, data: entrada });
}
