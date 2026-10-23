const BASE_COST_PER_PIXEL = 0.00002;
const COMPLEXITY_MULTIPLIER = { baja: 1, media: 1.5, alta: 2.2 };

/**
 * Servicio simple: funcion pura, sin req/res ni logica HTTP.
 * Se puede reutilizar tanto desde un controlador Express como desde un script.
 */
function calculateRenderBudget({ width, height, complexity }) {
  const numericWidth = Number(width);
  const numericHeight = Number(height);

  if (!width || !height || Number.isNaN(numericWidth) || Number.isNaN(numericHeight) || numericWidth <= 0 || numericHeight <= 0) {
    throw new Error("width y height deben ser numeros mayores a 0");
  }

  const multiplier = COMPLEXITY_MULTIPLIER[complexity];
  if (!multiplier) {
    throw new Error("complexity debe ser 'baja', 'media' o 'alta'");
  }

  const pixels = numericWidth * numericHeight;
  const baseCost = Number((pixels * BASE_COST_PER_PIXEL).toFixed(2));
  const total = Number((baseCost * multiplier).toFixed(2));

  return { pixels, baseCost, complexity, total };
}

export { calculateRenderBudget };
