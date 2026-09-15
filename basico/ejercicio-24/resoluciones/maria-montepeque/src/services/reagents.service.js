import { parseFormula } from "./formula.service.js";

const HAZARDS = ["ninguno", "inflamable", "corrosivo", "toxico", "oxidante"];

const reagents = new Map();
let nextId = 1;

function seed(name, formula, hazard) {
    const parsed = parseFormula(formula);
    reagents.set(nextId, { id: nextId++, name, ...parsed, hazard });
}

seed("Agua destilada", "H2O", "ninguno");
seed("Hidroxido de calcio", "Ca(OH)2", "corrosivo");
seed("Sulfato de cobre", "CuSO4", "toxico");

function validate(payload, { partial = false } = {}) {
    const errors = [];
    const has = (field) => field in payload;

    if (!partial || has("name")) {
        if (typeof payload.name !== "string" || payload.name.trim().length < 3) errors.push("name debe tener al menos 3 caracteres");
    }

    if (!partial || has("hazard")) {
        if (!HAZARDS.includes(payload.hazard)) errors.push(`hazard debe ser uno de: ${HAZARDS.join(", ")}`);
    }

    let parsed = null;
    if (!partial || has("formula")) {
        try {
            parsed = parseFormula(payload.formula);
        } catch (error) {
            errors.push(error.message);
        }
    }

    return { errors, parsed };
}

function isDuplicate(formula, ignoreId) {
    return [...reagents.values()].some((item) => item.formula === formula && item.id !== ignoreId);
}

function list({ search, hazard } = {}) {
    const term = search?.toLowerCase();
    return [...reagents.values()].filter(
        (item) => (!term || item.name.toLowerCase().includes(term) || item.formula.toLowerCase().includes(term)) && (!hazard || item.hazard === hazard)
    );
}

function get(id) {
    return reagents.get(Number(id)) ?? null;
}

function create(payload) {
    const { errors, parsed } = validate(payload);
    if (errors.length > 0) return { errors };
    if (isDuplicate(parsed.formula)) return { conflict: true };

    const reagent = { id: nextId++, name: payload.name.trim(), ...parsed, hazard: payload.hazard };
    reagents.set(reagent.id, reagent);
    return { reagent };
}

function replace(id, payload) {
    const current = get(id);
    if (!current) return { notFound: true };

    const { errors, parsed } = validate(payload);
    if (errors.length > 0) return { errors };
    if (isDuplicate(parsed.formula, current.id)) return { conflict: true };

    const reagent = { id: current.id, name: payload.name.trim(), ...parsed, hazard: payload.hazard };
    reagents.set(reagent.id, reagent);
    return { reagent };
}

function patch(id, payload) {
    const current = get(id);
    if (!current) return { notFound: true };
    if (Object.keys(payload).length === 0) return { errors: ["el body no puede estar vacio"] };

    const { errors, parsed } = validate(payload, { partial: true });
    if (errors.length > 0) return { errors };
    if (parsed && isDuplicate(parsed.formula, current.id)) return { conflict: true };

    const reagent = { ...current, ...(payload.name && { name: payload.name.trim() }), ...(payload.hazard && { hazard: payload.hazard }), ...parsed };
    reagents.set(reagent.id, reagent);
    return { reagent };
}

function remove(id) {
    return reagents.delete(Number(id));
}

export { list, get, create, replace, patch, remove };
