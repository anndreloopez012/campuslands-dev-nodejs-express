const ROLES = ["Tanque", "Soporte", "Carry", "Mid"];

function pickHero(teamName) {
  if (!teamName || typeof teamName !== "string" || !teamName.trim()) {
    throw new Error("El nombre del equipo es obligatorio");
  }

  const role = ROLES[Math.floor(Math.random() * ROLES.length)];

  return {
    team: teamName.trim(),
    role,
    gold: Math.floor(Math.random() * 5000) + 500,
    kda: `${Math.floor(Math.random() * 10)}/${Math.floor(Math.random() * 5)}/${Math.floor(Math.random() * 10)}`,
  };
}

module.exports = { pickHero };
