const MAX_RADIUS = 1000;

function shrinkZone(currentRadius) {
  if (typeof currentRadius !== "number" || Number.isNaN(currentRadius)) {
    throw new Error("El radio actual debe ser un numero");
  }
  if (currentRadius <= 0) {
    throw new Error("El radio actual debe ser mayor a 0");
  }

  const nextRadius = Math.max(Math.floor(currentRadius * 0.6), 0);

  return {
    previousRadius: currentRadius,
    nextRadius,
    playersExpected: Math.floor(nextRadius / 10),
  };
}

export { MAX_RADIUS, shrinkZone };
export default shrinkZone;
