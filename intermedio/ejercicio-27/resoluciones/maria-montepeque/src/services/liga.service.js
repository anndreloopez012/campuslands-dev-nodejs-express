import { equipos, partidas } from "../data/db.js";
import AppError from "../utils/app-error.js";

const REGIONES = ["LATAM", "NA", "EU", "KR"];

function findEquipos({ region } = {}) {
    if (region === undefined) return equipos;

    if (!REGIONES.includes(region)) {
        throw new AppError(400, `region debe ser una de: ${REGIONES.join(", ")}`);
    }
    return equipos.filter((e) => e.region === region);
}

function findEquipo(id) {
    if (!Number.isInteger(id) || id < 1) {
        throw new AppError(400, "El id debe ser un numero entero positivo");
    }

    const equipo = equipos.find((e) => e.id === id);
    if (!equipo) {
        throw new AppError(404, `No existe el equipo con id ${id}`);
    }
    return equipo;
}

function crearEquipo(body) {
    const { nombre, region, jugadores } = body || {};
    const errors = [];

    if (typeof nombre !== "string" || nombre.trim().length < 3) errors.push("nombre debe tener al menos 3 letras");
    if (!REGIONES.includes(region)) errors.push(`region debe ser una de: ${REGIONES.join(", ")}`);
    if (!Array.isArray(jugadores) || jugadores.length !== 5 || jugadores.some((j) => typeof j !== "string" || !j.trim())) {
        errors.push("jugadores debe ser una lista de 5 nombres");
    }

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }

    if (equipos.some((e) => e.nombre.toLowerCase() === nombre.trim().toLowerCase())) {
        throw new AppError(409, `Ya existe un equipo llamado ${nombre.trim()}`);
    }

    const nuevo = {
        id: Math.max(0, ...equipos.map((e) => e.id)) + 1,
        nombre: nombre.trim(),
        region,
        jugadores: jugadores.map((j) => j.trim())
    };
    equipos.push(nuevo);
    return nuevo;
}

function registrarPartida(body) {
    const { equipoAzulId, equipoRojoId, ganador, duracionMin } = body || {};
    const errors = [];

    if (!Number.isInteger(equipoAzulId)) errors.push("equipoAzulId debe ser un numero entero");
    if (!Number.isInteger(equipoRojoId)) errors.push("equipoRojoId debe ser un numero entero");
    if (ganador !== "azul" && ganador !== "rojo") errors.push('ganador debe ser "azul" o "rojo"');
    if (!Number.isInteger(duracionMin) || duracionMin < 10 || duracionMin > 90) {
        errors.push("duracionMin debe ser un entero entre 10 y 90");
    }

    if (errors.length > 0) {
        throw new AppError(400, "Datos invalidos", errors);
    }
    if (equipoAzulId === equipoRojoId) {
        throw new AppError(400, "Un equipo no puede jugar contra si mismo");
    }

    // si alguno no existe tira 404
    findEquipo(equipoAzulId);
    findEquipo(equipoRojoId);

    const nueva = { id: partidas.length + 1, equipoAzulId, equipoRojoId, ganador, duracionMin };
    partidas.push(nueva);
    return nueva;
}

// tabla de posiciones: 3 puntos por victoria
function clasificacion() {
    const tabla = equipos.map((e) => ({ equipoId: e.id, nombre: e.nombre, jugadas: 0, ganadas: 0, perdidas: 0, puntos: 0 }));
    const porId = new Map(tabla.map((fila) => [fila.equipoId, fila]));

    for (const p of partidas) {
        const azul = porId.get(p.equipoAzulId);
        const rojo = porId.get(p.equipoRojoId);
        if (!azul || !rojo) continue;

        const [ganadorFila, perdedorFila] = p.ganador === "azul" ? [azul, rojo] : [rojo, azul];
        ganadorFila.ganadas++;
        perdedorFila.perdidas++;
        azul.jugadas++;
        rojo.jugadas++;
    }

    tabla.forEach((fila) => (fila.puntos = fila.ganadas * 3));

    // mas puntos primero, si empatan el que perdio menos
    return tabla.sort((a, b) => b.puntos - a.puntos || a.perdidas - b.perdidas || a.nombre.localeCompare(b.nombre));
}

export { findEquipos, findEquipo, crearEquipo, registrarPartida, clasificacion, REGIONES };
