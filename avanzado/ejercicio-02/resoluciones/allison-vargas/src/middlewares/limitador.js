import { AppError } from '../utils/errors.js';

const MAX_CLAVES = 10000;

export function almacenEnMemoria({ reloj, maxClaves = MAX_CLAVES }) {
  const ventanas = new Map();

  function purgar(ahora) {
    for (const [clave, ventana] of ventanas) {
      if (ventana.reinicia <= ahora) ventanas.delete(clave);
    }
  }

  return {
    golpear(clave, ventanaMs) {
      const ahora = reloj().getTime();
      let ventana = ventanas.get(clave);
      if (!ventana || ventana.reinicia <= ahora) {
        if (ventanas.size >= maxClaves) purgar(ahora);
        ventana = { conteo: 0, reinicia: ahora + ventanaMs };
        ventanas.set(clave, ventana);
      }
      ventana.conteo += 1;
      return { conteo: ventana.conteo, reinicia: ventana.reinicia };
    },
    tamano: () => ventanas.size,
  };
}

export const limitador = ({ almacen, maximo, ventanaMs, reloj, clave = (req) => req.ip }) => (req, res, next) => {
  const { conteo, reinicia } = almacen.golpear(clave(req), ventanaMs);
  const segundos = Math.max(1, Math.ceil((reinicia - reloj().getTime()) / 1000));
  res.set({
    'RateLimit-Limit': String(maximo),
    'RateLimit-Remaining': String(Math.max(0, maximo - conteo)),
    'RateLimit-Reset': String(segundos),
  });
  if (conteo > maximo) {
    res.set('Retry-After', String(segundos));
    return next(new AppError('Demasiadas peticiones, intenta de nuevo mas tarde', 429, 'LIMITE_EXCEDIDO'));
  }
  return next();
};
