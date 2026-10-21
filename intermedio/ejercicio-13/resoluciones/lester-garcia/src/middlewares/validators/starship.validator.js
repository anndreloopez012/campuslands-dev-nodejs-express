const VALID_CLASSES = ["Crucero de Batalla", "Explorador Científico", "Carguero Pesado", "Fragata Ligera"];

export const createStarshipValidator = (req) => {
  const errors = [];
  const { registryCode, name, shipClass, warpSpeed, homePlanetId } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!registryCode || typeof registryCode !== "string" || registryCode.trim().length < 4) {
    errors.push({ field: "registryCode", message: "El código de registro de la nave debe tener al menos 4 caracteres." });
  }

  if (!name || typeof name !== "string" || name.trim().length < 2) {
    errors.push({ field: "name", message: "El nombre de la nave debe tener al menos 2 caracteres." });
  }

  if (!shipClass || !VALID_CLASSES.includes(shipClass.trim())) {
    errors.push({ field: "shipClass", message: `Clase de nave inválida. Válidas: ${VALID_CLASSES.join(", ")}.` });
  }

  const warp = Number(warpSpeed);
  if (warpSpeed === undefined || isNaN(warp) || warp < 1 || warp > 9.99) {
    errors.push({ field: "warpSpeed", message: "La velocidad de curvatura (warp) debe ser un número entre 1.0 y 9.99." });
  }

  if (!homePlanetId || typeof homePlanetId !== "string" || homePlanetId.trim() === "") {
    errors.push({ field: "homePlanetId", message: "El campo 'homePlanetId' (clave foránea) es obligatorio." });
  }

  return errors;
};