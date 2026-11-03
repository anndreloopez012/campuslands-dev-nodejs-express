const VALID_MAPS = ["Ascent", "Bind", "Haven", "Mirage", "Inferno"];

export const createMatchValidator = (req) => {
  const errors = [];
  const { playerTag, mapName, kills, deaths, headshotPercentage } = req.body || {};

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!playerTag || typeof playerTag !== "string" || !playerTag.includes("#")) {
    errors.push({ field: "playerTag", message: "El playerTag debe incluir el discriminador '#' (ej. TenZ#NA1)." });
  }

  if (!mapName || !VALID_MAPS.includes(mapName.trim())) {
    errors.push({ field: "mapName", message: `Mapa no válido. Permitidos: ${VALID_MAPS.join(", ")}.` });
  }

  if (isNaN(Number(kills)) || Number(kills) < 0) {
    errors.push({ field: "kills", message: "El número de bajas (kills) debe ser 0 o mayor." });
  }

  if (isNaN(Number(deaths)) || Number(deaths) < 0) {
    errors.push({ field: "deaths", message: "El número de muertes (deaths) debe ser 0 o mayor." });
  }

  const hs = Number(headshotPercentage);
  if (isNaN(hs) || hs < 0 || hs > 100) {
    errors.push({ field: "headshotPercentage", message: "El porcentaje de headshot debe estar entre 0 y 100." });
  }

  return errors;
};
