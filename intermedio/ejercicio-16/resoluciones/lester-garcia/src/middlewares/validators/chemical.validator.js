const VALID_HAZARD_LEVELS = ["Bajo", "Moderado", "Alto", "Extremo (Biohazard)"];

export const createChemicalValidator = (req) => {
  const errors = [];
  const { formulaCode, compoundName, molecularFormula, hazardLevel, purityPercentage, storageTempCelsius } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!formulaCode || typeof formulaCode !== "string" || formulaCode.trim().length < 3) {
    errors.push({ field: "formulaCode", message: "El código de fórmula es obligatorio (mínimo 3 caracteres)." });
  }

  if (!compoundName || typeof compoundName !== "string" || compoundName.trim().length < 2) {
    errors.push({ field: "compoundName", message: "El nombre del compuesto es obligatorio." });
  }

  if (!molecularFormula || typeof molecularFormula !== "string" || molecularFormula.trim().length < 1) {
    errors.push({ field: "molecularFormula", message: "La fórmula molecular (ej. H2SO4) es obligatoria." });
  }

  if (!hazardLevel || !VALID_HAZARD_LEVELS.includes(hazardLevel.trim())) {
    errors.push({
      field: "hazardLevel",
      message: `Nivel de peligrosidad no reconocido. Válidos: ${VALID_HAZARD_LEVELS.join(", ")}.`
    });
  }

  const purity = Number(purityPercentage);
  if (purityPercentage === undefined || isNaN(purity) || purity <= 0 || purity > 100) {
    errors.push({ field: "purityPercentage", message: "El porcentaje de pureza debe ser un número entre 0.1 y 100." });
  }

  const temp = Number(storageTempCelsius);
  if (storageTempCelsius === undefined || isNaN(temp) || temp < -273 || temp > 150) {
    errors.push({ field: "storageTempCelsius", message: "Temperatura de almacenamiento fuera del rango físico viable." });
  }

  return errors;
};