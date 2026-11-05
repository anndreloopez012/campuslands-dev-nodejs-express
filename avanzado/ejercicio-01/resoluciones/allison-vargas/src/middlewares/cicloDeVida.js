import { AppError } from '../utils/errors.js';
import { estadoDeVersion } from '../domain/ciclo.js';

export const cicloDeVida = (definicion, { reloj, base }) => (req, res, next) => {
  res.set('API-Version', String(definicion.numero));
  const estado = estadoDeVersion(definicion, reloj());
  const sucesora = definicion.sucesora ? `${base}/${definicion.sucesora}` : null;

  if (estado === 'retirada') {
    const cabeceras = sucesora ? { Link: `<${sucesora}>; rel="successor-version"` } : undefined;
    return next(new AppError(
      `La version ${definicion.version} fue retirada${sucesora ? `, usa ${definicion.sucesora}` : ''}`,
      410,
      'VERSION_RETIRADA',
      undefined,
      cabeceras,
    ));
  }

  if (estado === 'deprecada') {
    res.set('Deprecation', `@${Math.floor(Date.parse(definicion.deprecadaDesde) / 1000)}`);
    if (definicion.retiroPrevisto) res.set('Sunset', new Date(definicion.retiroPrevisto).toUTCString());
    if (sucesora) res.set('Link', `<${sucesora}>; rel="successor-version"`);
  }
  return next();
};
