const ALLOWED_SORT_FIELDS = ["rankingPoints", "matchesWon", "winRatio", "name", "age"];
const ALLOWED_ORDERS = ["asc", "desc"];
const VALID_GRIPS = ["Shakehand", "Penhold", "Seemiller"];

export const playerQueryValidator = (req) => {
  const errors = [];
  const { sortBy, order, gripStyle, page, limit } = req.query;

  if (sortBy && !ALLOWED_SORT_FIELDS.includes(sortBy.trim())) {
    errors.push({
      field: "sortBy",
      message: `Campo de ordenamiento no permitido. Campos válidos: ${ALLOWED_SORT_FIELDS.join(", ")}.`
    });
  }

  if (order && !ALLOWED_ORDERS.includes(order.trim().toLowerCase())) {
    errors.push({
      field: "order",
      message: `Dirección de ordenamiento inválida. Direcciones permitidas: ${ALLOWED_ORDERS.join(", ")}.`
    });
  }

  if (gripStyle && !VALID_GRIPS.includes(gripStyle.trim())) {
    errors.push({
      field: "gripStyle",
      message: `Estilo de agarre inválido. Válidos: ${VALID_GRIPS.join(", ")}.`
    });
  }

  if (page !== undefined) {
    const p = Number(page);
    if (!Number.isInteger(p) || p < 1) {
      errors.push({ field: "page", message: "El parámetro 'page' debe ser un entero mayor o igual a 1." });
    }
  }

  if (limit !== undefined) {
    const l = Number(limit);
    if (!Number.isInteger(l) || l < 1 || l > 50) {
      errors.push({ field: "limit", message: "El parámetro 'limit' debe ser un entero entre 1 y 50." });
    }
  }

  return errors;
};