export const calcularCalorAportado = ({ voltaje, amperaje, velocidadAvanceMmS, eficiencia = 0.8 }) => {
  if (voltaje <= 0 || amperaje <= 0 || velocidadAvanceMmS <= 0) {
    throw new Error('Todos los parámetros deben ser valores positivos mayores a cero.');
  }

  // Fórmula Heat Input (kJ/mm) = (Voltaje * Amperaje * Eficiencia * 60) / (Velocidad * 1000)
  const calorKJPorMm = (voltaje * amperaje * eficiencia) / (velocidadAvanceMmS * 1000);
  return {
    voltaje,
    amperaje,
    velocidadAvanceMmS,
    eficiencia,
    heatInputKJPorMm: Number(calorKJPorMm.toFixed(3))
  };
};
