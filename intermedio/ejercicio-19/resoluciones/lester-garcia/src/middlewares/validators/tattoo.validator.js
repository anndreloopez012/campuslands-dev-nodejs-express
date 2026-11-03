import { config } from "../../config/env.config.js";

export const createTattooValidator = (req) => {
  const errors = [];
  const { clientName, clientAge, tattooStyle, bodyPlacement, artistName, estimatedHours } = req.body || {};

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!clientName || typeof clientName !== "string" || clientName.trim().length < 3) {
    errors.push({ field: "clientName", message: "El nombre del cliente debe tener al menos 3 caracteres." });
  }

  const age = Number(clientAge);
  if (isNaN(age) || age < config.studio.minAgeRequired) {
    errors.push({
      field: "clientAge",
      message: `El cliente debe tener al menos ${config.studio.minAgeRequired} años según la configuración del estudio.`
    });
  }

  if (!tattooStyle || typeof tattooStyle !== "string" || !config.studio.allowedStyles.includes(tattooStyle.trim())) {
    errors.push({
      field: "tattooStyle",
      message: `Estilo no disponible. Válidos: ${config.studio.allowedStyles.join(", ")}.`
    });
  }

  if (!bodyPlacement || typeof bodyPlacement !== "string" || bodyPlacement.trim().length < 3) {
    errors.push({ field: "bodyPlacement", message: "Zona del cuerpo requerida (mínimo 3 caracteres)." });
  }

  if (!artistName || typeof artistName !== "string" || artistName.trim().length < 3) {
    errors.push({ field: "artistName", message: "Nombre del artista tatuador requerido." });
  }

  const hours = Number(estimatedHours);
  if (isNaN(hours) || hours < 1 || hours > config.studio.maxSessionHours) {
    errors.push({
      field: "estimatedHours",
      message: `La duración debe estar entre 1 y ${config.studio.maxSessionHours} horas máximas configuradas por sesión.`
    });
  }

  return errors;
};
