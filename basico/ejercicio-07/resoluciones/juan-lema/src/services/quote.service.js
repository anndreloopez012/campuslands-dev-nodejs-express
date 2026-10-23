const LUXURY_TAX_RATE = 0.08;

function parseArgs(argv) {
  const flags = {};
  for (const arg of argv) {
    const match = arg.match(/^--([\w-]+)=(.*)$/);
    if (match) {
      flags[match[1]] = match[2];
    }
  }
  return flags;
}

function quoteCar({ brand, price }) {
  if (!brand || typeof brand !== "string" || !brand.trim()) {
    throw new Error("--brand es obligatorio");
  }

  const numericPrice = Number(price);
  if (!price || Number.isNaN(numericPrice) || numericPrice <= 0) {
    throw new Error("--price debe ser un numero mayor a 0");
  }

  const tax = Math.round(numericPrice * LUXURY_TAX_RATE);

  return {
    brand: brand.trim(),
    price: numericPrice,
    tax,
    total: numericPrice + tax,
  };
}

export { parseArgs, quoteCar };
