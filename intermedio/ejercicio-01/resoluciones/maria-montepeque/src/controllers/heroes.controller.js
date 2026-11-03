import * as heroesService from "../services/heroes.service.js";

// el controlador solo lee la peticion y arma la respuesta
function listHeroes(req, res) {
    const data = heroesService.findAll();
    res.json({ ok: true, total: data.length, data });
}

function getHero(req, res) {
    const id = Number(req.params.id);
    const hero = heroesService.findById(id);

    if (!hero) {
        return res.status(404).json({ ok: false, message: `No existe el heroe con id ${req.params.id}` });
    }

    res.json({ ok: true, data: hero });
}

function createHero(req, res) {
    const errors = heroesService.validate(req.body);

    if (errors.length > 0) {
        return res.status(400).json({ ok: false, message: "Datos invalidos", errors });
    }

    const hero = heroesService.create(req.body);
    res.status(201).json({ ok: true, data: hero });
}

export { listHeroes, getHero, createHero };
