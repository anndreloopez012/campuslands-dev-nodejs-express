export function calculateWeldEstimate(length, thickness) {
  if (!Number.isFinite(length) || length <= 0 || !Number.isFinite(thickness) || thickness <= 0) {
    throw new Error('Las medidas deben ser números positivos.');
  }
  return Number((length * thickness * 0.8).toFixed(2));
}
