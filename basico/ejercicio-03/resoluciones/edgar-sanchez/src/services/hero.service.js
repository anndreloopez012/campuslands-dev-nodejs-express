const ROLES = ["Tanque", "Soporte", "Carry", "Mid"];
const HEROES = ["Ares", "Luna", "Invoker", "Pudge"];

function pickHero(teamName) {
  if (typeof teamName !== "string" || !teamName.trim()) {
    throw new Error("El nombre del equipo es obligatorio");
  }

  return {
    equipo: teamName.trim(),
    heroe: HEROES[Math.floor(Math.random() * HEROES.length)],
    rol: ROLES[Math.floor(Math.random() * ROLES.length)],
    oro: Math.floor(Math.random() * 5000) + 500,
    kda: `${Math.floor(Math.random() * 10)}/${Math.floor(Math.random() * 5)}/${Math.floor(Math.random() * 10)}`,
  };
}

module.exports = { pickHero };