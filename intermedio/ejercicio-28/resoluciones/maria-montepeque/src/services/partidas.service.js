import { db } from "../data/db.js";
import AppError from "../utils/app-error.js";
import * as escuadrasService from "./escuadras.service.js";

const MAPAS = ["Isla Calavera", "Desierto Rojo", "Ciudad Neon"];

function findById(id) {
    if (!Number.isInteger(id) || id < 1) {
        throw new AppError(400, "El id debe ser un numero entero positivo");
    }
    const partida = db.partidas.find((p) => p.id === id);
    if (!partida) {
        throw new AppError(404, `No existe la partida con id ${id}`);
    }
    return partida;
}

function exigirEstado(partida, estado) {
    if (partida.estado !== estado) {
        throw new AppError(409, `La partida esta en "${partida.estado}", para esto tiene que estar en "${estado}"`);
    }
}

function crear(body, gamertag) {
    const { mapa } = body || {};

    if (!MAPAS.includes(mapa)) {
        throw new AppError(400, `mapa debe ser uno de: ${MAPAS.join(", ")}`);
    }

    // lobby -> en_curso -> terminada
    const partida = {
        id: db.siguientePartida++,
        mapa,
        creadaPor: gamertag,
        estado: "lobby",
        escuadras: [], // { escuadraId, nombre, vivos: [gamertags] }
        eliminaciones: [],
        ganador: null
    };
    db.partidas.push(partida);
    return partida;
}

function inscribir(id, body, gamertag) {
    const partida = findById(id);
    exigirEstado(partida, "lobby");

    const escuadra = escuadrasService.findById(body?.escuadraId);

    // solo el lider inscribe a su escuadra
    if (escuadra.lider !== gamertag) {
        throw new AppError(403, `Solo ${escuadra.lider} (lider) puede inscribir a ${escuadra.nombre}`);
    }
    if (partida.escuadras.some((e) => e.escuadraId === escuadra.id)) {
        throw new AppError(409, `${escuadra.nombre} ya esta inscrita`);
    }

    partida.escuadras.push({ escuadraId: escuadra.id, nombre: escuadra.nombre, vivos: [...escuadra.miembros] });
    return partida;
}

function iniciar(id, gamertag) {
    const partida = findById(id);
    exigirEstado(partida, "lobby");

    if (partida.creadaPor !== gamertag) {
        throw new AppError(403, `Solo ${partida.creadaPor} puede iniciar la partida`);
    }
    if (partida.escuadras.length < 2) {
        throw new AppError(409, "Hacen falta al menos 2 escuadras para iniciar");
    }

    partida.estado = "en_curso";
    return partida;
}

// el asesino es el jugador del token, la victima viene en el body
function eliminar(id, body, gamertag) {
    const partida = findById(id);
    exigirEstado(partida, "en_curso");

    const { victima } = body || {};
    if (typeof victima !== "string" || victima.trim() === "") {
        throw new AppError(400, "victima es obligatoria");
    }

    const escuadraAsesino = partida.escuadras.find((e) => e.vivos.includes(gamertag));
    const escuadraVictima = partida.escuadras.find((e) => e.vivos.includes(victima));

    if (!escuadraAsesino) {
        throw new AppError(403, `${gamertag} no esta vivo en esta partida`);
    }
    if (!escuadraVictima) {
        throw new AppError(404, `${victima} no esta vivo en esta partida`);
    }
    if (escuadraAsesino === escuadraVictima) {
        throw new AppError(409, "No se puede eliminar a alguien de tu propia escuadra");
    }

    escuadraVictima.vivos = escuadraVictima.vivos.filter((j) => j !== victima);
    partida.eliminaciones.push({ asesino: gamertag, victima, numero: partida.eliminaciones.length + 1 });

    // si solo queda una escuadra con gente viva, gana
    const conVida = partida.escuadras.filter((e) => e.vivos.length > 0);
    if (conVida.length === 1) {
        partida.estado = "terminada";
        partida.ganador = conVida[0].nombre;
    }

    return partida;
}

// tabla de bajas por jugador
function ranking(id) {
    const partida = findById(id);
    const bajas = {};

    for (const e of partida.eliminaciones) {
        bajas[e.asesino] = (bajas[e.asesino] || 0) + 1;
    }

    const jugadores = Object.entries(bajas)
        .map(([gamertag, total]) => ({ gamertag, bajas: total }))
        .sort((a, b) => b.bajas - a.bajas || a.gamertag.localeCompare(b.gamertag));

    return { partidaId: partida.id, estado: partida.estado, ganador: partida.ganador, jugadores };
}

export { findById, crear, inscribir, iniciar, eliminar, ranking, MAPAS };
