const VALID_RARITIES = ["Comun", "Raro", "Epico", "Legendario", "Mitico"];

export const createLoadoutValidator = (req) => {
  const errors = [];
  const { squadName, dropZone, primaryWeapon, rarityTier, shieldCapacity } = req.body || {};

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!squadName || typeof squadName !== "string" || squadName.trim().length < 3) {
    errors.push({ field: "squadName", message: "El nombre del escuadrón debe tener mínimo 3 caracteres." });
  }

  if (!dropZone || typeof dropZone !== "string" || dropZone.trim().length < 3) {
    errors.push({ field: "dropZone", message: "La zona de aterrizaje (dropZone) es obligatoria." });
  }

  if (!primaryWeapon || typeof primaryWeapon !== "string" || primaryWeapon.trim().length < 3) {
    errors.push({ field: "primaryWeapon", message: "El arma principal es obligatoria." });
  }

  if (!rarityTier || !VALID_RARITIES.includes(rarityTier.trim())) {
    errors.push({ field: "rarityTier", message: `Rareza inválida. Válidas: ${VALID_RARITIES.join(", ")}.` });
  }

  const shield = Number(shieldCapacity);
  if (isNaN(shield) || shield < 0 || shield > 250) {
    errors.push({ field: "shieldCapacity", message: "La capacidad de escudo debe estar entre 0 y 250." });
  }

  return errors;
};
