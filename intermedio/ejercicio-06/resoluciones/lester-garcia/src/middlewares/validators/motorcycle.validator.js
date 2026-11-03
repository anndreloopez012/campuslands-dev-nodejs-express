const VALID_ENGINE_TYPES = ["Monocilíndrico", "Bicilíndrico en Línea", "V-Twin", "Cuatro en Línea", "Bóxer"];
const VALID_STATUSES = ["Diagnóstico", "Esperando Repuestos", "En Reparación", "Listo para Entrega"];

export const createMotorcycleValidator = (req) => {
  const errors = [];
  const { vin, brand, model, cylinderCapacityCc, engineType, ownerName, currentStatus, repairCostUSD } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  // Validación de VIN / Número de Chasis (exactamente 17 caracteres alfanuméricos)
  if (!vin || typeof vin !== "string" || vin.trim().length !== 17) {
    errors.push({ field: "vin", message: "El VIN es obligatorio y debe tener exactamente 17 caracteres." });
  }

  // Validación de Marca y Modelo
  if (!brand || typeof brand !== "string" || brand.trim().length < 2) {
    errors.push({ field: "brand", message: "La marca debe contener al menos 2 caracteres." });
  }

  if (!model || typeof model !== "string" || model.trim().length < 2) {
    errors.push({ field: "model", message: "El modelo debe contener al menos 2 caracteres." });
  }

  // Validación de Cilindrada (cc)
  const cc = Number(cylinderCapacityCc);
  if (cylinderCapacityCc === undefined || isNaN(cc) || cc < 49 || cc > 2500) {
    errors.push({ field: "cylinderCapacityCc", message: "La cilindrada debe ser un valor numérico entre 50cc y 2500cc." });
  }

  // Validación de Tipo de Motor
  if (!engineType || !VALID_ENGINE_TYPES.includes(engineType.trim())) {
    errors.push({ field: "engineType", message: `El tipo de motor debe ser uno de: ${VALID_ENGINE_TYPES.join(", ")}.` });
  }

  // Validación de Propietario
  if (!ownerName || typeof ownerName !== "string" || ownerName.trim().length < 3) {
    errors.push({ field: "ownerName", message: "El nombre del propietario debe tener al menos 3 caracteres." });
  }

  // Validación de Costo de Reparación
  const cost = Number(repairCostUSD);
  if (repairCostUSD === undefined || isNaN(cost) || cost <= 0) {
    errors.push({ field: "repairCostUSD", message: "El costo de reparación debe ser un número positivo mayor a 0." });
  }

  if (currentStatus && !VALID_STATUSES.includes(currentStatus.trim())) {
    errors.push({ field: "currentStatus", message: `El estado debe ser uno de: ${VALID_STATUSES.join(", ")}.` });
  }

  return errors;
};

export const updateMotorcycleStatusValidator = (req) => {
  const errors = [];
  const { currentStatus } = req.body;

  if (!currentStatus || !VALID_STATUSES.includes(currentStatus.trim())) {
    errors.push({
      field: "currentStatus",
      message: `El estado es obligatorio y debe ser uno de: ${VALID_STATUSES.join(", ")}.`
    });
  }

  return errors;
};