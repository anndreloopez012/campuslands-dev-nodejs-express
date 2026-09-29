const WEAPONS = ["Rifle de asalto", "Escopeta tactica", "Francotirador", "Subfusil"];
const MAPS = ["Terminal", "Nave industrial", "Laboratorio", "Torre orbital"];

function createLoadout(playerName) {
  if (typeof playerName !== "string" || !playerName.trim()) {
    throw new Error("El nombre del jugador es obligatorio");
  }

  return {
    jugador: playerName.trim(),
    arma: WEAPONS[Math.floor(Math.random() * WEAPONS.length)],
    mapa: MAPS[Math.floor(Math.random() * MAPS.length)],
    municion: Math.floor(Math.random() * 90) + 30,
    armadura: Math.floor(Math.random() * 100) + 1,
  };
}

export { createLoadout };