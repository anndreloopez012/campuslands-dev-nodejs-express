const port = Number(process.env.PORT || 3028);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  throw new Error('PORT debe ser un entero entre 1 y 65535');
}

module.exports = {
  port,
  lobbyName: process.env.LOBBY_NAME || 'Battle Royale Lobby',
  region: process.env.GAME_REGION || 'latam'
};