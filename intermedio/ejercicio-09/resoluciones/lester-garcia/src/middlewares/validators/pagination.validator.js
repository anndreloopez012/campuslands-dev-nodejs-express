const VALID_WEIGHT_CLASSES = ["Peso Pluma", "Peso Ligero", "Peso Wélter", "Peso Mediano", "Peso Pesado"];
const VALID_STANCES = ["Ortodoxo", "Zurdo", "Cambio de Guardia"];

export const paginationAndFilterValidator = (req) => {
  const errors = [];
  const { page, limit, minKnockouts, weightClass, stance } = req.query;

  if (page !== undefined) {
    const parsedPage = Number(page);
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      errors.push({ field: "page", message: "El parámetro 'page' debe ser un número entero mayor o igual a 1." });
    }
  }

  if (limit !== undefined) {
    const parsedLimit = Number(limit);
    if (!Number.isInteger(parsedLimit) || parsedLimit < 1 || parsedLimit > 50) {
      errors.push({ field: "limit", message: "El parámetro 'limit' debe ser un entero entre 1 y 50." });
    }
  }

  if (minKnockouts !== undefined) {
    const kos = Number(minKnockouts);
    if (isNaN(kos) || kos < 0) {
      errors.push({ field: "minKnockouts", message: "El parámetro 'minKnockouts' debe ser un número positivo." });
    }
  }

  if (weightClass && !VALID_WEIGHT_CLASSES.includes(weightClass.trim())) {
    errors.push({
      field: "weightClass",
      message: `Categoría de peso no reconocida. Permitidas: ${VALID_WEIGHT_CLASSES.join(", ")}.`
    });
  }

  if (stance && !VALID_STANCES.includes(stance.trim())) {
    errors.push({
      field: "stance",
      message: `Guardia inválida. Permitidas: ${VALID_STANCES.join(", ")}.`
    });
  }

  return errors;
};