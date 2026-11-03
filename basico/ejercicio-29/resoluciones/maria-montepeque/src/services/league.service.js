import { HttpError } from "../core/http.js";

const MODALITIES = { futbol: { players: 11, halfMinutes: 45 }, futsal: { players: 5, halfMinutes: 20 } };

const teams = [
    { id: 1, name: "Halcones del Sur", modality: "futbol" },
    { id: 2, name: "Atletico Barrio", modality: "futbol" },
    { id: 3, name: "Rayo Sala", modality: "futsal" },
    { id: 4, name: "Pivots Unidos", modality: "futsal" },
];
const matches = [];
let nextMatchId = 1;

function listTeams(modality) {
    if (modality && !MODALITIES[modality]) throw new HttpError(400, `modality debe ser futbol o futsal`);
    return teams.filter((team) => !modality || team.modality === modality);
}

function findTeam(id) {
    const team = teams.find((item) => item.id === Number(id));
    if (!team) throw new HttpError(404, `No existe el equipo ${id}`);
    return team;
}

function recordMatch({ homeId, awayId, homeGoals, awayGoals }) {
    const errors = [];
    const isScore = (value) => Number.isInteger(value) && value >= 0 && value <= 50;

    if (!isScore(homeGoals)) errors.push({ field: "homeGoals", message: "entero entre 0 y 50" });
    if (!isScore(awayGoals)) errors.push({ field: "awayGoals", message: "entero entre 0 y 50" });
    if (homeId === awayId) errors.push({ field: "awayId", message: "no puede ser el mismo equipo que homeId" });
    if (errors.length > 0) throw new HttpError(422, "Resultado invalido", errors);

    const home = findTeam(homeId);
    const away = findTeam(awayId);
    if (home.modality !== away.modality) throw new HttpError(409, `Los equipos son de modalidades distintas (${home.modality} vs ${away.modality})`);

    const match = { id: nextMatchId++, modality: home.modality, home: home.name, away: away.name, homeGoals, awayGoals, playedAt: new Date().toISOString() };
    matches.push(match);
    return match;
}

function listMatches() {
    return matches;
}

function standings(modality) {
    if (!MODALITIES[modality]) throw new HttpError(400, "modality debe ser futbol o futsal");

    const table = new Map(listTeams(modality).map((team) => [team.name, { team: team.name, played: 0, won: 0, drawn: 0, lost: 0, goalsFor: 0, goalsAgainst: 0, points: 0 }]));

    for (const match of matches.filter((item) => item.modality === modality)) {
        const home = table.get(match.home);
        const away = table.get(match.away);
        home.played++; away.played++;
        home.goalsFor += match.homeGoals; home.goalsAgainst += match.awayGoals;
        away.goalsFor += match.awayGoals; away.goalsAgainst += match.homeGoals;

        if (match.homeGoals > match.awayGoals) { home.won++; away.lost++; home.points += 3; }
        else if (match.homeGoals < match.awayGoals) { away.won++; home.lost++; away.points += 3; }
        else { home.drawn++; away.drawn++; home.points++; away.points++; }
    }

    return [...table.values()]
        .map((row) => ({ ...row, goalDiff: row.goalsFor - row.goalsAgainst }))
        .sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor || a.team.localeCompare(b.team))
        .map((row, i) => ({ position: i + 1, ...row }));
}

export { MODALITIES, listTeams, findTeam, recordMatch, listMatches, standings };
