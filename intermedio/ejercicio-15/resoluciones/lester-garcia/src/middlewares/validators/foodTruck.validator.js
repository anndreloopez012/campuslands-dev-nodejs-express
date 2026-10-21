const VALID_SPECIALTIES = ["Tacos & Birria", "Hamburguesas Smash", "Hot Dogs & Choripán", "Comida Callejera Asiática", "Arepas & Empanadas"];

export const createFoodTruckValidator = (req) => {
  const errors = [];
  const { name, specialty, locationZone, averagePriceUSD } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!name || typeof name !== "string" || name.trim().length < 3) {
    errors.push({ field: "name", message: "El nombre del puesto debe tener al menos 3 caracteres." });
  }

  if (!specialty || !VALID_SPECIALTIES.includes(specialty.trim())) {
    errors.push({ field: "specialty", message: `Especialidad inválida. Válidas: ${VALID_SPECIALTIES.join(", ")}.` });
  }

  if (!locationZone || typeof locationZone !== "string" || locationZone.trim().length < 3) {
    errors.push({ field: "locationZone", message: "La zona o punto de ubicación es obligatoria." });
  }

  const price = Number(averagePriceUSD);
  if (averagePriceUSD === undefined || isNaN(price) || price <= 0 || price > 50) {
    errors.push({ field: "averagePriceUSD", message: "El precio promedio debe estar entre $1 y $50 USD." });
  }

  return errors;
};