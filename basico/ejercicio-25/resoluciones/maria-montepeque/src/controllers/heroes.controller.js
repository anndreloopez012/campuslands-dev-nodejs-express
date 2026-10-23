import { ok, created, noContent, cached, problem } from "../core/reply.js";
import { readJson } from "../core/body.js";
import * as service from "../services/heroes.service.js";

function parseId(req, res) {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
        problem(req, res, 400, "El id debe ser un entero positivo");
        return null;
    }
    return id;
}

function getHeroes(req, res) {
    cached(req, res, { data: service.listHeroes() });
}

function getHero(req, res) {
    const id = parseId(req, res);
    if (id === null) return;

    const hero = service.findHero(id);
    if (!hero) return problem(req, res, 404, `No existe el heroe ${id}`);

    cached(req, res, { data: hero });
}

async function postHero(req, res) {
    const body = await readJson(req);
    const { errors, conflict, hero } = service.createHero(body);

    if (errors) return problem(req, res, 422, "El heroe no cumple las reglas del juego", { errors });
    if (conflict) return problem(req, res, 409, conflict);

    created(req, res, { data: hero }, `/heroes/${hero.id}`);
}

function postLevelUp(req, res) {
    const id = parseId(req, res);
    if (id === null) return;

    const { notFound, conflict, hero } = service.levelUp(id);
    if (notFound) return problem(req, res, 404, `No existe el heroe ${id}`);
    if (conflict) return problem(req, res, 409, conflict);

    ok(req, res, 200, { data: hero });
}

function deleteHero(req, res) {
    const id = parseId(req, res);
    if (id === null) return;

    if (!service.deleteHero(id)) return problem(req, res, 404, `No existe el heroe ${id}`);
    noContent(req, res);
}

export { getHeroes, getHero, postHero, postLevelUp, deleteHero };
