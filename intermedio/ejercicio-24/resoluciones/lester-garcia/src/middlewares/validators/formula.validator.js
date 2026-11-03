export const createFormulaValidator = (req) => {
  const errors = [];
  const { commonName, molecularFormula, molarMassGmol, phLevel, soluteGrams, solutionVolumeLiters } = req.body || {};

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!commonName || typeof commonName !== "string" || commonName.trim().length < 3) {
    errors.push({ field: "commonName", message: "El nombre común del compuesto debe tener al menos 3 caracteres." });
  }

  if (!molecularFormula || typeof molecularFormula !== "string" || molecularFormula.trim().length < 2) {
    errors.push({ field: "molecularFormula", message: "La fórmula molecular (ej. H2SO4, NaCl) es obligatoria." });
  }

  if (isNaN(Number(molarMassGmol)) || Number(molarMassGmol) <= 0) {
    errors.push({ field: "molarMassGmol", message: "La masa molar (g/mol) debe ser mayor a 0." });
  }

  const ph = Number(phLevel);
  if (isNaN(ph) || ph < 0 || ph > 14) {
    errors.push({ field: "phLevel", message: "El nivel de pH debe encontrarse en la escala de 0 a 14." });
  }

  if (isNaN(Number(soluteGrams)) || Number(soluteGrams) <= 0) {
    errors.push({ field: "soluteGrams", message: "Los gramos de soluto deben ser mayores a 0." });
  }

  if (isNaN(Number(solutionVolumeLiters)) || Number(solutionVolumeLiters) <= 0) {
    errors.push({ field: "solutionVolumeLiters", message: "El volumen de la disolución en litros debe ser mayor a 0." });
  }

  return errors;
};
