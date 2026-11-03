import AppError from "../utils/app-error.js";
import { obtenerStats } from "./stats.service.js";
import { notificarPartida } from "../clients/notificador.client.js";

const MAPAS = ["Dust Valley", "Puerto Niebla", "Estacion Orbital", "Ruinas de Kael"];

const partidas = [];
let nextId = 1;

// reparto "serpiente": 1ro al A, 2do y 3ro al B, 4to y 5to al A...
// asi los dos equipos quedan con kd parecido
function balancear(jugadores) {
    const ordenados = [...jugadores].sort((a, b) => b.kd - a.kd);
    const equipoA = [];
    const equipoB = [];

    ordenados.forEach((jugador, i) => {
        const vuelta = Math.floor(i / 2);
        const primeroDeLaVuelta = i % 2 === 0;
        const vaAlA = vuelta % 2 === 0 ? primeroDeLaVuelta : !primeroDeLaVuelta;
        (vaAlA ? equipoA : equipoB).push(jugador);
    });

    return { equipoA, equipoB };
}

function kdPromedio(equipo) {
    const suma = equipo.reduce((total, j) => total + j.kd, 0);
    return Math.round((suma / equipo.length) * 100) / 100;
}

function validar(body) {
    const { jugadores } = body || {};

    if (!Array.isArray(jugadores) || jugadores.some((j) => typeof j !== "string" || j.trim() === "")) {
        throw new AppError(400, "jugadores debe ser una lista de gamertags");
    }
    if (jugadores.length < 2 || jugadores.length > 10 || jugadores.length % 2 !== 0) {
        throw new AppError(400, "Tiene que haber una cantidad par de jugadores, de 2 a 10");
    }

    const limpios = jugadores.map((j) => j.trim());
    const unicos = new Set(limpios.map((j) => j.toLowerCase()));
    if (unicos.size !== limpios.length) {
        throw new AppError(400, "Hay gamertags repetidos");
    }

    return limpios;
}

async function crearPartida(body) {
    const gamertags = validar(body);

    // pido las stats de todos a la vez
    const stats = await Promise.all(gamertags.map((tag) => obtenerStats(tag)));

    const { equipoA, equipoB } = balancear(stats);
    // el mapa es al azar, en los tests se controla Math.random
    const mapa = MAPAS[Math.floor(Math.random() * MAPAS.length)];

    const resumen = (j) => ({ gamertag: j.gamertag, kd: j.kd, rango: j.rango });
    const partida = {
        id: nextId++,
        mapa,
        equipoA: { jugadores: equipoA.map(resumen), kdPromedio: kdPromedio(equipoA) },
        equipoB: { jugadores: equipoB.map(resumen), kdPromedio: kdPromedio(equipoB) },
        creada: new Date().toISOString()
    };

    partidas.push(partida);

    // no espero la notificacion, si tarda o falla la respuesta no se atrasa
    notificarPartida(partida);

    return partida;
}

function listarPartidas() {
    return partidas;
}

function limpiarPartidas() {
    partidas.length = 0;
    nextId = 1;
}

export { crearPartida, listarPartidas, balancear, limpiarPartidas, MAPAS };
