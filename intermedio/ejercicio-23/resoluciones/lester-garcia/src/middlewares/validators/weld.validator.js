const VALID_PROCESSES = ["TIG", "MIG", "SMAW", "SAW"];

export const createWeldValidator = (req) => {
  const errors = [];
  const { welderName, baseMetal, weldingProcess, voltage, amperage, travelSpeedMmMin } = req.body || {};

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!welderName || typeof welderName !== "string" || welderName.trim().length < 3) {
    errors.push({ field: "welderName", message: "Nombre del soldador certificado requerido." });
  }

  if (!baseMetal || typeof baseMetal !== "string" || baseMetal.trim().length < 3) {
    errors.push({ field: "baseMetal", message: "Metal base requerido (ej. Acero Carbono A36, Inox 304)." });
  }

  if (!weldingProcess || !VALID_PROCESSES.includes(weldingProcess.trim())) {
    errors.push({ field: "weldingProcess", message: `Proceso inválido. Permitidos: ${VALID_PROCESSES.join(", ")}.` });
  }

  if (isNaN(Number(voltage)) || Number(voltage) <= 0) {
    errors.push({ field: "voltage", message: "El voltaje de arco debe ser mayor a 0 V." });
  }

  if (isNaN(Number(amperage)) || Number(amperage) <= 0) {
    errors.push({ field: "amperage", message: "El amperaje debe ser mayor a 0 A." });
  }

  if (isNaN(Number(travelSpeedMmMin)) || Number(travelSpeedMmMin) <= 0) {
    errors.push({ field: "travelSpeedMmMin", message: "La velocidad de avance (mm/min) debe ser mayor a 0." });
  }

  return errors;
};
