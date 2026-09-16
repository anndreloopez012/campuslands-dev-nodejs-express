import { logger } from "../core/logger.js";

const log = logger.child({ module: "matches" });

const teams = ["Nexus Titans", "Void Walkers", "Crimson Lane", "Jungle Kings"];
const matches = [];
let nextId = 1;

function listTeams() {
    return teams;
}

function listMatches() {
    return matches;
}

function recordMatch({ blue, red, winner, durationMin }) {
    const errors = [];

    if (!teams.includes(blue)) errors.push("blue debe ser un equipo registrado");
    if (!teams.includes(red)) errors.push("red debe ser un equipo registrado");
    if (blue === red) errors.push("blue y red no pueden ser el mismo equipo");
    if (![blue, red].includes(winner)) errors.push("winner debe ser blue o red");
    if (!Number.isInteger(durationMin) || durationMin < 15 || durationMin > 90) errors.push("durationMin debe ser un entero entre 15 y 90");

    if (errors.length > 0) {
        log.warn("partida rechazada", { errors });
        return { errors };
    }

    const match = { id: nextId++, blue, red, winner, durationMin, playedAt: new Date().toISOString() };
    matches.push(match);

    if (durationMin < 20) log.warn("partida sospechosamente corta", { matchId: match.id, durationMin });
    log.info("partida registrada", { matchId: match.id, winner });

    return { match };
}

export { listTeams, listMatches, recordMatch };
