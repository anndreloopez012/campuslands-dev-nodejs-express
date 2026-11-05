export const validateServiceRecord = (req, res, next) => {
  const { placa, cliente, marca, cilindrada, tipoMantenimiento, costoUSD } = req.body;
  const errors = [];

  if (!placa || typeof placa !== 'string' || placa.trim().length < 3) {
    errors.push('La placa de la motocicleta es obligatoria y válida.');
  }

  if (!cliente || typeof cliente !== 'string' || cliente.trim().length < 3) {
    errors.push('El nombre del cliente debe tener al menos 3 caracteres.');
  }

  if (!marca || typeof marca !== 'string') {
    errors.push('La marca de la moto es obligatoria.');
  }

  if (cilindrada === undefined || typeof cilindrada !== 'number' || cilindrada < 50) {
    errors.push('La cilindrada debe ser un número mayor o igual a 50 cc.');
  }

  const tiposPermitidos = ['preventivo', 'correctivo', 'afinacion', 'frenos', 'motor'];
  if (!tipoMantenimiento || !tiposPermitidos.includes(tipoMantenimiento.toLowerCase())) {
    errors.push(`El tipo de mantenimiento debe ser uno de: ${tiposPermitidos.join(', ')}`);
  }

  if (errors.length > 0) {
    return res.status(400).json({
      ok: false,
      requestId: req.id,
      message: 'Fallo de validación de entrada',
      errors
    });
  }

  next();
};
