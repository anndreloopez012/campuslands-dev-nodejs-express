const VALID_MODALITIES = ["Futbol_Sala_FIFA", "Futbol_11", "Futbol_7"];

export const createClubValidator = (req) => {
  const errors = [];
  const { clubName, modality, wins, draws, losses, goalsFor, goalsAgainst } = req.body || {};

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!clubName || typeof clubName !== "string" || clubName.trim().length < 3) {
    errors.push({ field: "clubName", message: "El nombre del club debe tener al menos 3 caracteres." });
  }

  if (!modality || !VALID_MODALITIES.includes(modality.trim())) {
    errors.push({ field: "modality", message: `Modalidad inválida. Válidas: ${VALID_MODALITIES.join(", ")}.` });
  }

  for (const [key, val] of Object.entries({ wins, draws, losses, goalsFor, goalsAgainst })) {
    if (val === undefined || isNaN(Number(val)) || Number(val) < 0) {
      errors.push({ field: key, message: `El campo '${key}' debe ser un número entero mayor o igual a 0.` });
    }
  }

  return errors;
};
