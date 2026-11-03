import AppError from "../utils/app-error.js";

const CLASES = ["guerrero", "mago", "arquero", "clerigo"];
const NIVEL_MAXIMO = 50;
const MAX_ITEMS = 5;

// vida que gana cada clase al subir de nivel
const VIDA_POR_NIVEL = { guerrero: 20, mago: 8, arquero: 12, clerigo: 14 };

// cada app tiene su propia lista, asi los tests no se pisan entre ellos
function crearPersonajesService(iniciales) {
    const personajes = iniciales.map((p) => ({ ...p, inventario: [...p.inventario] }));
    let nextId = personajes.reduce((max, p) => Math.max(max, p.id), 0) + 1;

    function findAll({ clase } = {}) {
        if (clase === undefined) return personajes;

        if (!CLASES.includes(clase)) {
            throw new AppError(400, `clase debe ser una de: ${CLASES.join(", ")}`);
        }
        return personajes.filter((p) => p.clase === clase);
    }

    function findById(id) {
        if (!Number.isInteger(id) || id < 1) {
            throw new AppError(400, "El id debe ser un numero entero positivo");
        }

        const personaje = personajes.find((p) => p.id === id);
        if (!personaje) {
            throw new AppError(404, `No existe el personaje con id ${id}`);
        }
        return personaje;
    }

    function create(body) {
        const { nombre, clase } = body || {};
        const errors = [];

        if (typeof nombre !== "string" || nombre.trim().length < 3 || nombre.trim().length > 20) {
            errors.push("nombre debe tener entre 3 y 20 letras");
        }
        if (!CLASES.includes(clase)) {
            errors.push(`clase debe ser una de: ${CLASES.join(", ")}`);
        }
        if (errors.length > 0) {
            throw new AppError(400, "Datos invalidos", errors);
        }

        // el nombre no se puede repetir, sin importar mayusculas
        const limpio = nombre.trim();
        if (personajes.some((p) => p.nombre.toLowerCase() === limpio.toLowerCase())) {
            throw new AppError(409, `Ya existe un personaje llamado ${limpio}`);
        }

        // todos empiezan en nivel 1 con vida base de 100
        const nuevo = { id: nextId++, nombre: limpio, clase, nivel: 1, vida: 100, inventario: [] };
        personajes.push(nuevo);
        return nuevo;
    }

    function subirNivel(id) {
        const personaje = findById(id);

        if (personaje.nivel >= NIVEL_MAXIMO) {
            throw new AppError(409, `${personaje.nombre} ya esta en el nivel maximo (${NIVEL_MAXIMO})`);
        }

        personaje.nivel += 1;
        personaje.vida += VIDA_POR_NIVEL[personaje.clase];
        return personaje;
    }

    function agregarItem(id, body) {
        const personaje = findById(id);
        const { item } = body || {};

        if (typeof item !== "string" || item.trim() === "") {
            throw new AppError(400, "item es obligatorio");
        }
        if (personaje.inventario.length >= MAX_ITEMS) {
            throw new AppError(409, `El inventario de ${personaje.nombre} esta lleno (${MAX_ITEMS} items)`);
        }

        personaje.inventario.push(item.trim());
        return personaje;
    }

    function remove(id) {
        const personaje = findById(id);
        personajes.splice(personajes.indexOf(personaje), 1);
    }

    return { findAll, findById, create, subirNivel, agregarItem, remove };
}

export { crearPersonajesService, CLASES, NIVEL_MAXIMO, MAX_ITEMS };
