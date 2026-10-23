import { readFileSync } from "node:fs";

const DATA_PATH = new URL("../data/teams.json", import.meta.url);

function getTeamStats(teamName) {
    if (!teamName || typeof teamName !== "string" || !teamName.trim()) {
        throw new Error("El nombre del equipo es obligatorio");
    }

    const raw = readFileSync(DATA_PATH, "utf-8");
    const teams = JSON.parse(raw);

    const team = teams.find(
        (t) => t.name.toLowerCase() === teamName.trim().toLowerCase()
    );
    if (!team) {
        throw new Error(`Equipo "${teamName}" no encontrado`);
    }

    const totalMatches = team.wins + team.losses + team.draws;
    const winRate =
        totalMatches === 0 ? 0 : Number(((team.wins / totalMatches) * 100).toFixed(1));

    return { ...team, totalMatches, winRate };
}

export { getTeamStats };