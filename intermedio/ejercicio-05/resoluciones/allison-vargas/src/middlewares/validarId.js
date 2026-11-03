import { AppError } from '../utils/AppError.js';

export const validarId = (req, res, next, value) => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    return next(new AppError('El id debe ser un entero positivo', 400));
  }
  req.params.id = id;
  next();
};
