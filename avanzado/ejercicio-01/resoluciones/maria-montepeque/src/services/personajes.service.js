import { db } from "../data/db.js";
import AppError from "../utils/app-error.js";

// la logica del juego es UNA sola, no se copia por version
// las versiones solo cambian como entra y sale la informacion

export const CLASES = ["guerrero", "maga", "arquero", "clerigo"];

// valores con los que empieza cada clase en nivel 1
const BASE_POR_CLASE = {
    guerrero: { vida: 140, mana: 20, fuerza: 14 },
    maga: { vida: 90, mana: 140, fuerza: 6 },
    arquero: { vida: 110, mana: 50, fuerza: 11 },
    clerigo: { vida: 120, mana: 110, fuerza: 8 }
};

// cuanto sube cada stat por nivel
const SUBIDA_POR_CLASE = {
    guerrero: { vida: 18, mana: 2, fuerza: 1 },
    maga: { vida: 6, mana: 14, fuerza: 0 },
    arquero: { vida: 12, mana: 4, fuerza: 1 },
    clerigo: { vida: 10, mana: 10, fuerza: 0 }
};

export const NIVEL_MAXIMO = 60;

export function listar({ clase } = {}) {
    if (clase === undefined) return db.personajes;
    if (!CLASES.includes(clase)) {
        throw new AppError(400, `clase debe ser una de: ${CLASES.join(", ")}`);
    }
    return db.personajes.filter((p) => p.clase === clase);
}

export function buscar(id) {
    const personaje = db.personajes.find((p) => p.id === id);
    if (!personaje) {
        throw new AppError(404, `No existe el personaje con id ${id}`);
    }
    return personaje;
}

// recibe datos ya validados por la version que llamo
export function crear({ nombre, clase, fuerzaExtra = 0 }) {
    if (db.personajes.some((p) => p.nombre.toLowerCase() === nombre.toLowerCase())) {
        throw new AppError(409, `Ya existe un personaje llamado ${nombre}`);
    }

    const base = BASE_POR_CLASE[clase];
    const nuevo = {
        id: Math.max(0, ...db.personajes.map((p) => p.id)) + 1,
        nombre,
        clase,
        nivel: 1,
        vida: base.vida,
        mana: base.mana,
        fuerza: base.fuerza + fuerzaExtra,
        inventario: []
    };

    db.personajes.push(nuevo);
    return nuevo;
}

export function subirNivel(id) {
    const personaje = buscar(id);

    if (personaje.nivel >= NIVEL_MAXIMO) {
        throw new AppError(409, `${personaje.nombre} ya esta en el nivel maximo (${NIVEL_MAXIMO})`);
    }

    const subida = SUBIDA_POR_CLASE[personaje.clase];
    personaje.nivel += 1;
    personaje.vida += subida.vida;
    personaje.mana += subida.mana;
    personaje.fuerza += subida.fuerza;
    return personaje;
}
