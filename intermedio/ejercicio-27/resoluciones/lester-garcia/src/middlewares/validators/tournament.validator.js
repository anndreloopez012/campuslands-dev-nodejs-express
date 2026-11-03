const VALID_GAMES = ["League of Legends", "Dota 2", "Honor of Kings"];
const VALID_REGIONS = ["LCK", "LPL", "LEC", "LLA", "Global"];

export const createTournamentValidator = (req) => {
  const errors = [];
  const { name, gameTitle, region, prizePoolUsd } = req.body || {};

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!name || typeof name !== "string" || name.trim().length < 4) {
    errors.push({ field: "name", message: "El nombre del torneo debe tener al menos 4 caracteres." });
  }

  if (!gameTitle || !VALID_GAMES.includes(gameTitle.trim())) {
    errors.push({ field: "gameTitle", message: `Juego MOBA no válido. Permitidos: ${VALID_GAMES.join(", ")}.` });
  }

  if (!region || !VALID_REGIONS.includes(region.trim())) {
    errors.push({ field: "region", message: `Región competitiva inválida. Permitidas: ${VALID_REGIONS.join(", ")}.` });
  }

  const prize = Number(prizePoolUsd);
  if (isNaN(prize) || prize < 1000) {
    errors.push({ field: "prizePoolUsd", message: "La bolsa de premios (prizePoolUsd) debe ser de al menos $1,000 USD." });
  }

  return errors;
};
