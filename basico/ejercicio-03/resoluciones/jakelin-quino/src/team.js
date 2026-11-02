const team = {
  name: 'Guardianes del Nexus',
  game: 'MOBA Legends',
  players: ['Luna', 'Rex', 'Mina', 'Kai', 'Orion']
};

function getTeamSummary() {
  return `${team.name} juega ${team.game} con ${team.players.length} integrantes.`;
}

module.exports = { team, getTeamSummary };