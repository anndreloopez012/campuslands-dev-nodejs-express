const ALLOWED_GENRES = ["Rock", "Synthwave", "Jazz", "Electrónica", "Indie", "Clásica"];

export const trackSearchValidator = (req) => {
  const errors = [];
  const { q, genre, minBpm, maxBpm, page, limit } = req.query;

  if (q !== undefined) {
    if (typeof q !== "string" || q.trim().length < 2) {
      errors.push({
        field: "q",
        message: "El parámetro de búsqueda 'q' debe contener al menos 2 caracteres útiles."
      });
    }
  }

  if (genre && !ALLOWED_GENRES.map((g) => g.toLowerCase()).includes(genre.trim().toLowerCase())) {
    errors.push({
      field: "genre",
      message: `Género musical inválido. Permitidos: ${ALLOWED_GENRES.join(", ")}.`
    });
  }

  if (minBpm !== undefined && (isNaN(Number(minBpm)) || Number(minBpm) <= 0)) {
    errors.push({ field: "minBpm", message: "El parámetro 'minBpm' debe ser un número positivo." });
  }

  if (maxBpm !== undefined && (isNaN(Number(maxBpm)) || Number(maxBpm) <= 0)) {
    errors.push({ field: "maxBpm", message: "El parámetro 'maxBpm' debe ser un número positivo." });
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