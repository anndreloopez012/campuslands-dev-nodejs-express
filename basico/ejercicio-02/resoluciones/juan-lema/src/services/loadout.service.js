const WEAPONS = ["Rifle de asalto", "Escopeta", "Francotirador", "Subfusil"];

function createLoadout(playerName) {
  if (!playerName || typeof playerName !== "string" || !playerName.trim()) {
    throw new Error("El nombre del jugador es obligatorio");
  }

  const weapon = WEAPONS[Math.floor(Math.random() * WEAPONS.length)];
  const ammo = Math.floor(Math.random() * 90) + 30;

  return {
    player: playerName.trim(),
    weapon,
    ammo,
    armor: Math.floor(Math.random() * 100) + 1,
  };
}

export { createLoadout };
