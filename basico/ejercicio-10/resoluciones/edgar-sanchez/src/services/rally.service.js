const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function playRally(player) {
  if (typeof player !== "string" || !player.trim()) {
    throw new Error("El nombre del jugador es obligatorio");
  }

  const durationMs = 25;
  await wait(durationMs);

  return {
    player: player.trim(),
    result: "punto ganado",
    durationMs,
  };
}

export { playRally };
