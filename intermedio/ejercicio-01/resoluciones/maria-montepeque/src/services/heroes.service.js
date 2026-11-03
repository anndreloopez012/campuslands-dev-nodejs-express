import { heroes } from "../data/heroes.js";

const CLASSES = ["guerrero", "mago", "arquero", "clerigo"];
const BASE_POWER = { guerrero: 12, mago: 15, arquero: 11, clerigo: 9 };

function calculatePower(heroClass, level) {
    return BASE_POWER[heroClass] * level;
}

function findAll() {
    return heroes;
}

function findById(id) {
    return heroes.find((hero) => hero.id === id);
}

function validate(body = {}) {
    const errors = [];

    if (typeof body.name !== "string" || body.name.trim() === "") {
        errors.push("name es obligatorio");
    }

    if (!CLASSES.includes(body.class)) {
        errors.push(`class debe ser una de: ${CLASSES.join(", ")}`);
    }

    if (!Number.isInteger(body.level) || body.level < 1 || body.level > 99) {
        errors.push("level debe ser un entero entre 1 y 99");
    }

    return errors;
}

function create(body) {
    // busco el id mas alto para no repetir ninguno
    const lastId = heroes.reduce((max, hero) => Math.max(max, hero.id), 0);

    const hero = {
        id: lastId + 1,
        name: body.name.trim(),
        class: body.class,
        level: body.level,
        power: calculatePower(body.class, body.level)
    };

    heroes.push(hero);
    return hero;
}

export { findAll, findById, validate, create };
