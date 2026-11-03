const VALID_POWERTRAINS = ["Combustión Quad-Turbo", "Híbrido V8 Twin-Turbo", "100% Eléctrico (Quad-Motor)"];

export const createHypercarValidator = (req) => {
  const errors = [];
  const { chassisNumber, modelName, manufacturer, horsePower, powertrain, topSpeedKmh, limitedUnits } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!chassisNumber || typeof chassisNumber !== "string" || chassisNumber.trim().length < 8) {
    errors.push({ field: "chassisNumber", message: "El número de chasis debe tener al menos 8 caracteres." });
  }

  if (!modelName || typeof modelName !== "string" || modelName.trim().length < 2) {
    errors.push({ field: "modelName", message: "El nombre del modelo es obligatorio." });
  }

  if (!manufacturer || typeof manufacturer !== "string" || manufacturer.trim().length < 2) {
    errors.push({ field: "manufacturer", message: "El fabricante (ej. Koenigsegg, Rimac, Bugatti) es obligatorio." });
  }

  const hp = Number(horsePower);
  if (horsePower === undefined || isNaN(hp) || hp < 1000 || hp > 3000) {
    errors.push({ field: "horsePower", message: "Un hiperdeportivo debe tener entre 1,000 HP y 3,000 HP." });
  }

  if (!powertrain || !VALID_POWERTRAINS.includes(powertrain.trim())) {
    errors.push({ field: "powertrain", message: `Tren motriz inválido. Permitidos: ${VALID_POWERTRAINS.join(", ")}.` });
  }

  const speed = Number(topSpeedKmh);
  if (topSpeedKmh === undefined || isNaN(speed) || speed < 400 || speed > 550) {
    errors.push({ field: "topSpeedKmh", message: "La velocidad máxima certificada debe estar entre 400 km/h y 550 km/h." });
  }

  const units = Number(limitedUnits);
  if (limitedUnits === undefined || isNaN(units) || units < 1 || units > 250) {
    errors.push({ field: "limitedUnits", message: "La serie limitada debe ser entre 1 y 250 unidades." });
  }

  return errors;
};