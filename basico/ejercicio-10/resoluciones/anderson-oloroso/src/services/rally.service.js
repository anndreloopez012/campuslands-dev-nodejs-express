/**
 * Simula un rally de ping pong de forma asíncrona con callback.
 * @param {string} playerName - Nombre del jugador
 * @param {Function} callback - callback(error, result)
 */
export function playRally(playerName, callback) {
  if (!playerName || typeof playerName !== "string" || playerName.trim() === "") {
    callback(new Error("El nombre del jugador es obligatorio."));
    return;
  }

  const delay = Math.floor(Math.random() * 1000) + 1000; // 1-2 segundos
  const hits = Math.floor(Math.random() * 20) + 3;
  const opponents = ["Bot Zhang", "Bot Müller", "Bot Tanaka", "Bot López"];
  const opponent = opponents[Math.floor(Math.random() * opponents.length)];
  const playerWins = Math.random() > 0.4;

  setTimeout(() => {
    const result = {
      player: playerName.trim(),
      opponent,
      hits,
      winner: playerWins ? playerName.trim() : opponent,
      duration: `${(delay / 1000).toFixed(1)}s`,
    };
    callback(null, result);
  }, delay);
}
