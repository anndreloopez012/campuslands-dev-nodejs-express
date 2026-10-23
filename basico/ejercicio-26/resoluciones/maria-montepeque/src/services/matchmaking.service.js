const RANKS = ["bronce", "plata", "oro", "platino", "diamante"];
const MATCH_DELAY_MS = 3000;

const tickets = new Map();
const tournaments = new Map([
    [1, { id: 1, name: "Copa Invierno", status: "finished", players: [] }],
    [2, { id: 2, name: "Liga Abierta", status: "open", players: [] }],
]);
let nextTicket = 1;

function enqueue(player, { mode }) {
    if (!["solo", "duo", "squad"].includes(mode)) return { errors: ["mode debe ser solo, duo o squad"] };
    if ([...tickets.values()].some((t) => t.player === player && t.status === "searching")) return { conflict: `${player} ya esta en cola` };

    const ticket = { id: nextTicket++, player, mode, status: "searching", createdAt: Date.now() };
    tickets.set(ticket.id, ticket);
    return { ticket };
}

function getTicket(id) {
    const ticket = tickets.get(Number(id));
    if (!ticket) return null;

    if (ticket.status === "searching" && Date.now() - ticket.createdAt >= MATCH_DELAY_MS) {
        ticket.status = "found";
        ticket.server = `sa-east-${ticket.id % 3 + 1}`;
    }

    return ticket;
}

function cancelTicket(id, player) {
    const ticket = tickets.get(Number(id));
    if (!ticket) return { notFound: true };
    if (ticket.player !== player) return { forbidden: true };

    tickets.delete(ticket.id);
    return { removed: true };
}

function getTournament(id) {
    return tournaments.get(Number(id)) ?? null;
}

function register(tournamentId, player, { rank }) {
    const tournament = getTournament(tournamentId);
    if (!tournament) return { notFound: true };
    if (tournament.status === "finished") return { gone: true };
    if (!RANKS.includes(rank)) return { errors: [`rank debe ser uno de: ${RANKS.join(", ")}`] };
    if (tournament.players.some((p) => p.player === player)) return { conflict: `${player} ya esta inscrito` };

    const entry = { player, rank, seed: tournament.players.length + 1 };
    tournament.players.push(entry);
    return { entry };
}

export { enqueue, getTicket, cancelTicket, getTournament, register };
