const ROLES = ["Mid Laner", "Jungla", "Carry", "Soporte", "Offlaner"];
const HEROES = ["Orianna", "Lee Sin", "Jinx", "Thresh", "Aatrox"];

function pickHero(teamName) {
  if (!teamName || typeof teamName !== "string" || !teamName.trim()) {
    throw new Error("El nombre del equipo es obligatorio");
  }

  const index = Math.floor(Math.random() * ROLES.length);

  return {
    team: teamName.trim(),
    hero: HEROES[index],
    role: ROLES[index],
    gold: Math.floor(Math.random() * 4500) + 1000,
    kda: `${Math.floor(Math.random() * 12)}/${Math.floor(Math.random() * 4)}/${Math.floor(Math.random() * 15)}`,
  };
}

module.exports = { pickHero };
