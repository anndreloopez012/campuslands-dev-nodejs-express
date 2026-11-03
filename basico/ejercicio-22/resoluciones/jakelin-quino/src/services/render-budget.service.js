const qualityRates = { draft: 0.000002, standard: 0.000006, high: 0.000015 };

function createBudget({ width, height, quality }) {
  if (!Number.isInteger(width) || width < 1 || !Number.isInteger(height) || height < 1) {
    return { ok: false, error: 'El ancho y el alto deben ser enteros positivos' };
  }
  if (!Object.hasOwn(qualityRates, quality)) {
    return { ok: false, error: 'La calidad debe ser draft, standard o high' };
  }

  const pixels = width * height;
  const estimatedCost = Number((pixels * qualityRates[quality]).toFixed(2));
  return {
    ok: true,
    budget: { width, height, pixels, quality, estimatedCost }
  };
}

module.exports = { createBudget };