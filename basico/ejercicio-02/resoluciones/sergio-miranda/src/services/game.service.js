export function getGameStatus() {
  return {
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'npm scripts y package.json',
    game: 'shooter competitivo'
  };
}

export function validatePlayer(player) {
  if (!player || typeof player !== 'string' || player.trim() === '') {
    return false;
  }

  return true;
}