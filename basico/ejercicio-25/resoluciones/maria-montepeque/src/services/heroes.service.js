const CLASSES = ["guerrero", "mago", "picaro", "clerigo"];
const MAX_LEVEL = 20;

const heroes = new Map([
    [1, { id: 1, name: "Kaelis", class: "mago", level: 5, hp: 42 }],
    [2, { id: 2, name: "Brom", class: "guerrero", level: 20, hp: 180 }],
]);
let nextId = 3;

function validateHero({ name, class: heroClass, level }) {
    const errors = [];

    if (typeof name !== "string" || name.trim().length < 2) errors.push({ field: "name", message: "debe tener al menos 2 caracteres" });
    if (!CLASSES.includes(heroClass)) errors.push({ field: "class", message: `debe ser una de: ${CLASSES.join(", ")}` });
    if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) errors.push({ field: "level", message: `debe ser un entero entre 1 y ${MAX_LEVEL}` });

    return errors;
}

const hpFor = (heroClass, level) => ({ guerrero: 9, clerigo: 8, picaro: 7, mago: 6 })[heroClass] * level + 12;

function listHeroes() {
    return [...heroes.values()];
}

function findHero(id) {
    return heroes.get(Number(id)) ?? null;
}

function createHero(payload) {
    const errors = validateHero(payload);
    if (errors.length > 0) return { errors };

    const name = payload.name.trim();
    if (listHeroes().some((hero) => hero.name.toLowerCase() === name.toLowerCase())) return { conflict: `Ya existe un heroe llamado ${name}` };

    const hero = { id: nextId++, name, class: payload.class, level: payload.level, hp: hpFor(payload.class, payload.level) };
    heroes.set(hero.id, hero);
    return { hero };
}

function levelUp(id) {
    const hero = findHero(id);
    if (!hero) return { notFound: true };
    if (hero.level >= MAX_LEVEL) return { conflict: `${hero.name} ya alcanzo el nivel maximo (${MAX_LEVEL})` };

    hero.level += 1;
    hero.hp = hpFor(hero.class, hero.level);
    return { hero };
}

function deleteHero(id) {
    return heroes.delete(Number(id));
}

export { listHeroes, findHero, createHero, levelUp, deleteHero };
