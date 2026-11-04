import {
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../utils/errors.js';
import { catchAsync } from '../utils/catchAsync.js';

const casos = {
  validacion: () => {
    throw new ValidationError('Datos invalidos', [{ campo: 'precio', mensaje: 'precio es obligatorio' }]);
  },
  'no-autenticado': () => {
    throw new UnauthorizedError();
  },
  'sin-permiso': () => {
    throw new ForbiddenError();
  },
  'no-encontrado': () => {
    throw new NotFoundError();
  },
  conflicto: () => {
    throw new ConflictError();
  },
  inesperado: () => {
    const auto = null;
    return auto.marca;
  },
  asincrono: async () => {
    await Promise.resolve();
    throw new Error('Fallo inesperado en una operacion asincrona');
  },
};

export const disparar = catchAsync(async (req, res) => {
  const caso = casos[req.params.tipo];
  if (!caso) throw new NotFoundError(`Tipo de error desconocido. Disponibles: ${Object.keys(casos).join(', ')}`, 'TIPO_DESCONOCIDO');
  await caso();
});
