import { listPlayers } from "../services/players.service.js";

function getSquads(req, res) {
  const squads = {};

  for (const player of listPlayers()) {
    squads[player.squad] ??= { squad: player.squad, players: 0, kills: 0, alive: 0 };
    squads[player.squad].players += 1;
    squads[player.squad].kills += player.kills;
    if (player.alive) squads[player.squad].alive += 1;
  }

  res.json({ ok: true, data: Object.values(squads) });
}

export { getSquads };
