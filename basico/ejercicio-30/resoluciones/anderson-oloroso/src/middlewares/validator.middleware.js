export const validateBike = (req, res, next) => {
  const { placa, marca, modelo, cilindrada, cliente } = req.body;
  if (!placa || !marca || !modelo || !cliente) {
    return res.status(400).json({ ok: false, error: 'ValidationError', message: 'placa, marca, modelo y cliente son requeridos.' });
  }
  if (cilindrada !== undefined && (isNaN(Number(cilindrada)) || Number(cilindrada) <= 0)) {
    return res.status(400).json({ ok: false, error: 'ValidationError', message: 'La cilindrada debe ser un número positivo.' });
  }
  next();
};
