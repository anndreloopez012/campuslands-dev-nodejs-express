// Middleware de validación centralizada
export const validateOrderPayload = (req, res, next) => {
  const { cliente, placa, marca, modelo, cilindrada, kilometraje, tipoServicio } = req.body;
  const errors = [];

  if (!cliente || typeof cliente !== 'string' || cliente.trim().length < 3) {
    errors.push({ field: 'cliente', message: 'El nombre del cliente es obligatorio y debe tener al menos 3 caracteres.' });
  }

  const regexPlaca = /^[A-Z0-9]{3,7}$/i;
  if (!placa || !regexPlaca.test(placa.trim())) {
    errors.push({ field: 'placa', message: 'La placa es obligatoria y debe ser alfanumérica de 3 a 7 caracteres.' });
  }

  if (!marca || typeof marca !== 'string' || marca.trim() === '') {
    errors.push({ field: 'marca', message: 'La marca de la moto es obligatoria (ej: Yamaha, Honda, Kawasaki).' });
  }

  if (!modelo || typeof modelo !== 'string' || modelo.trim() === '') {
    errors.push({ field: 'modelo', message: 'El modelo de la motocicleta es obligatorio.' });
  }

  if (cilindrada === undefined || typeof cilindrada !== 'number' || cilindrada < 50 || cilindrada > 2500) {
    errors.push({ field: 'cilindrada', message: 'La cilindrada (cc) debe ser un número entre 50 y 2500.' });
  }

  if (kilometraje === undefined || typeof kilometraje !== 'number' || kilometraje < 0) {
    errors.push({ field: 'kilometraje', message: 'El kilometraje debe ser un valor numérico mayor o igual a 0.' });
  }

  const tiposPermitidos = ['preventivo', 'correctivo', 'afinacion', 'frenos', 'suspension'];
  if (!tipoServicio || !tiposPermitidos.includes(tipoServicio.toLowerCase())) {
    errors.push({
      field: 'tipoServicio',
      message: `Tipo de servicio inválido. Tipos aceptados: ${tiposPermitidos.join(', ')}`
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      ok: false,
      message: 'Fallo de validación en la orden de servicio mecánico',
      errorsCount: errors.length,
      errors
    });
  }

  // Normalización de datos validados
  req.body.placa = placa.trim().toUpperCase();
  req.body.tipoServicio = tipoServicio.toLowerCase();
  next();
};
