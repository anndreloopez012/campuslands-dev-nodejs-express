const VALID_DROPZONES = ["Dropzone Valle Bravo", "Dropzone Tequesquitengo", "Dropzone Ocotlán"];

export const createJumpValidator = (req) => {
  const errors = [];
  const { dropzone, exitAltitudeFeet, freefallSeconds, parachuteModel } = req.body;

  if (!dropzone || !VALID_DROPZONES.includes(dropzone.trim())) {
    errors.push({ field: "dropzone", message: `Dropzone no autorizada. Válidas: ${VALID_DROPZONES.join(", ")}.` });
  }

  const alt = Number(exitAltitudeFeet);
  if (isNaN(alt) || alt < 8000 || alt > 18000) {
    errors.push({ field: "exitAltitudeFeet", message: "La altitud de salto debe estar entre 8,000 y 18,000 pies." });
  }

  const seconds = Number(freefallSeconds);
  if (isNaN(seconds) || seconds < 20 || seconds > 90) {
    errors.push({ field: "freefallSeconds", message: "El tiempo de caída libre debe ser entre 20 y 90 segundos." });
  }

  if (!parachuteModel || typeof parachuteModel !== "string" || parachuteModel.trim().length < 3) {
    errors.push({ field: "parachuteModel", message: "Modelo de paracaídas principal requerido." });
  }

  return errors;
};