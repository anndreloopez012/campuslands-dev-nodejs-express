const VALID_SERVICES = ["Ajuste_Valvulas", "Sincronizacion_Inyeccion", "Cambio_Kit_Arrastre", "Suspension_Ohlins", "Mantenimiento_General"];

export const createWorkOrderValidator = (req) => {
  const errors = [];
  const { plateNumber, bikeModel, engineCc, serviceType, laborHours, partsCostUsd } = req.body || {};

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!plateNumber || typeof plateNumber !== "string" || plateNumber.trim().length < 5) {
    errors.push({ field: "plateNumber", message: "La placa de la motocicleta debe tener al menos 5 caracteres." });
  }

  if (!bikeModel || typeof bikeModel !== "string" || bikeModel.trim().length < 3) {
    errors.push({ field: "bikeModel", message: "El modelo de la motocicleta es obligatorio (ej. Yamaha MT-09)." });
  }

  const cc = Number(engineCc);
  if (isNaN(cc) || cc < 100 || cc > 2500) {
    errors.push({ field: "engineCc", message: "El cilindraje (engineCc) debe estar entre 100 cc y 2,500 cc." });
  }

  if (!serviceType || !VALID_SERVICES.includes(serviceType.trim())) {
    errors.push({ field: "serviceType", message: `Servicio mecánico inválido. Válidos: ${VALID_SERVICES.join(", ")}.` });
  }

  const hours = Number(laborHours);
  if (isNaN(hours) || hours < 0.5 || hours > 40) {
    errors.push({ field: "laborHours", message: "Las horas de mano de obra deben estar entre 0.5 y 40." });
  }

  const parts = Number(partsCostUsd);
  if (isNaN(parts) || parts < 0) {
    errors.push({ field: "partsCostUsd", message: "El costo de repuestos debe ser 0 o mayor." });
  }

  return errors;
};
