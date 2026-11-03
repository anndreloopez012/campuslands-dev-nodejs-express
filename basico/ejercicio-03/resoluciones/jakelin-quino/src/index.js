const { team, getTeamSummary } = require('./team');

console.log(getTeamSummary());
console.log('Jugadores:', team.players.join(', '));