import { AppError } from '../utils/errors.js';

const segundos = (ms) => Math.max(Math.ceil(ms / 1000), 0);

const politica = (limitador) =>
  limitador.tipo === 'ventana fija'
    ? `${limitador.limite};w=${segundos(limitador.ventanaMs)}`
    : `${limitador.limite};w=${segundos(limitador.limite * limitador.recargaMs)}`;

export const limitar = (nombre, limitador) => (req, res, next) => {
  const resultado = limitador.consumir(req.cliente.id);

  const cabeceras = {
    'RateLimit-Limit': String(resultado.limite),
    'RateLimit-Remaining': String(resultado.restantes),
    'RateLimit-Reset': String(segundos(resultado.reinicioMs)),
    'RateLimit-Policy': politica(limitador),
  };

  if (resultado.permitido) {
    res.set(cabeceras);
    return next();
  }

  const espera = Math.max(segundos(resultado.reintentarMs), 1);
  cabeceras['Retry-After'] = String(espera);
  return next(new AppError(
    `Superaste el limite de ${nombre}. Intenta de nuevo en ${espera} s`,
    429,
    'LIMITE_EXCEDIDO',
    [{ politica: nombre, algoritmo: limitador.tipo, reintentarEnSeg: espera }],
    cabeceras,
  ));
};
