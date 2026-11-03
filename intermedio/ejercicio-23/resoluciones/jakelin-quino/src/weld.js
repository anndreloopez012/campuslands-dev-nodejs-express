exports.weldArea = (width, length) => {
  if (![width, length].every((value) => Number.isFinite(value) && value > 0)) {
    throw new Error('Las medidas deben ser positivas');
  }
  return width * length;
};
