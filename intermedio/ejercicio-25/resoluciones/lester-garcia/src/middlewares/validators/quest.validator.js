const VALID_RANKS = ["Bronce", "Plata", "Oro", "Mitril", "Legendario"];

export const createQuestValidator = (req) => {
  const errors = [];
  const { title, region, difficultyRank, recommendedLevel, goldReward } = req.body || {};

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!title || typeof title !== "string" || title.trim().length < 4) {
    errors.push({ field: "title", message: "El título de la misión debe tener al menos 4 caracteres." });
  }

  if (!region || typeof region !== "string" || region.trim().length < 3) {
    errors.push({ field: "region", message: "La región del reino RPG es obligatoria." });
  }

  if (!difficultyRank || !VALID_RANKS.includes(difficultyRank.trim())) {
    errors.push({ field: "difficultyRank", message: `Rango inválido. Válidos: ${VALID_RANKS.join(", ")}.` });
  }

  const level = Number(recommendedLevel);
  if (isNaN(level) || level < 1 || level > 100) {
    errors.push({ field: "recommendedLevel", message: "El nivel recomendado debe estar entre 1 y 100." });
  }

  const gold = Number(goldReward);
  if (isNaN(gold) || gold < 10) {
    errors.push({ field: "goldReward", message: "La recompensa mínima es de 10 monedas de oro." });
  }

  return errors;
};
