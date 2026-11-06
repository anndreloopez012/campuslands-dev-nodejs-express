function playRally(playerName, callback) {
  if (!playerName || typeof playerName !== "string" || !playerName.trim()) {
    callback(new Error("El nombre del jugador es obligatorio"));
    return;
  }

  setTimeout(() => {
    const points = Math.floor(Math.random() * 11) + 1;
    callback(null, { player: playerName.trim(), points });
  }, 300);
}

export { playRally };
