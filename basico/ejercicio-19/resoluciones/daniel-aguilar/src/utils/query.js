// Los valores de req.query SIEMPRE llegan como texto (o arreglo si se repite el parametro).

/** Entero positivo dentro de [min, max]; devuelve fallback si falta y null si es invalido. */
function parseInteger(raw, { min = 1, max = Number.MAX_SAFE_INTEGER, fallback } = {}) {
  if (raw === undefined) return fallback;
  const value = Number(raw);
  return Number.isInteger(value) && value >= min && value <= max ? value : null;
}

function parsePositiveNumber(raw) {
  if (raw === undefined) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
}

/** ?style=a&style=b llega como ['a','b']; ?style=a llega como 'a'. Se normaliza siempre a arreglo. */
function parseList(raw) {
  if (raw === undefined) return [];
  return [].concat(raw).map((item) => String(item).trim().toLowerCase()).filter(Boolean);
}

module.exports = { parseInteger, parsePositiveNumber, parseList };
