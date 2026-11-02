const VALID_CATEGORIES = ["Supercar", "Hypercar", "Gran Turismo", "Luxury SUV"];

export const createCarValidator = (req) => {
  const errors = [];
  const { vin, brand, model, horsePower, category, priceUSD, topSpeedKmh } = req.body;

  if (!req.body || Object.keys(req.body).length === 0) {
    return [{ field: "body", message: "El cuerpo de la petición no puede estar vacío." }];
  }

  if (!vin || typeof vin !== "string" || vin.trim().length !== 17) {
    errors.push({ field: "vin", message: "El VIN debe tener exactamente 17 caracteres alfanuméricos." });
  }

  if (!brand || typeof brand !== "string" || brand.trim().length < 2) {
    errors.push({ field: "brand", message: "La marca debe tener al menos 2 caracteres." });
  }

  if (!model || typeof model !== "string" || model.trim().length < 2) {
    errors.push({ field: "model", message: "El modelo debe tener al menos 2 caracteres." });
  }

  const hp = Number(horsePower);
  if (horsePower === undefined || isNaN(hp) || hp < 300 || hp > 2500) {
    errors.push({ field: "horsePower", message: "La potencia debe estar entre 300 HP y 2500 HP." });
  }

  if (!category || !VALID_CATEGORIES.includes(category.trim())) {
    errors.push({ field: "category", message: `Categoría inválida. Permitidas: ${VALID_CATEGORIES.join(", ")}.` });
  }

  const price = Number(priceUSD);
  if (priceUSD === undefined || isNaN(price) || price < 50000) {
    errors.push({ field: "priceUSD", message: "El precio base debe ser mayor o igual a $50,000 USD." });
  }

  const speed = Number(topSpeedKmh);
  if (topSpeedKmh === undefined || isNaN(speed) || speed < 250 || speed > 550) {
    errors.push({ field: "topSpeedKmh", message: "La velocidad máxima debe estar entre 250 y 550 km/h." });
  }

  return errors;
};