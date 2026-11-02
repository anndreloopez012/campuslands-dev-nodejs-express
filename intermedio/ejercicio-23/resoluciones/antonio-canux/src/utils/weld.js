// Regla práctica: ~1 A por cada 0.001 pulgadas de espesor
export const recommendedAmperage = (thicknessMm) => {
  if (!Number.isFinite(thicknessMm) || thicknessMm <= 0) {
    throw new Error('El espesor debe ser un número positivo');
  }
  return Math.round(thicknessMm * 40);
};
