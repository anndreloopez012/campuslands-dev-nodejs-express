const MAX_RADIUS = 1000;

function shrinkZone(radius) {
  const value = Number(radius);

  if (!Number.isFinite(value) || value <= 0 || value > MAX_RADIUS) {
    throw new Error(`El radio debe ser un numero entre 1 y ${MAX_RADIUS}`);
  }

  return {
    previousRadius: value,
    nextRadius: Math.floor(value * 0.6),
  };
}

export { MAX_RADIUS, shrinkZone };