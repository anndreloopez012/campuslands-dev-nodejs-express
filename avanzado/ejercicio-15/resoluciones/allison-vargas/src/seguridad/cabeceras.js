import {
  CSP_POR_DEFECTO, construirCsp, generarNonce, validarDirectivas,
} from './csp.js';

export const POLITICAS_REFERRER = Object.freeze([
  'no-referrer', 'no-referrer-when-downgrade', 'origin', 'origin-when-cross-origin',
  'same-origin', 'strict-origin', 'strict-origin-when-cross-origin', 'unsafe-url',
]);

const UN_ANIO = 31536000;

export function validarHsts({ maxAge = UN_ANIO, incluirSubdominios = true, precarga = false } = {}) {
  if (!Number.isInteger(maxAge) || maxAge < 0) throw new TypeError('maxAge de HSTS debe ser un entero positivo');
  if (precarga && (maxAge < UN_ANIO || !incluirSubdominios)) {
    throw new TypeError('La precarga de HSTS exige maxAge de al menos un anio e includeSubDomains');
  }
  let valor = `max-age=${maxAge}`;
  if (incluirSubdominios) valor += '; includeSubDomains';
  if (precarga) valor += '; preload';
  return valor;
}

export function cabecerasSeguras({
  csp = CSP_POR_DEFECTO,
  reporteCsp,
  soloReportar = false,
  referrer = 'strict-origin-when-cross-origin',
  hsts = {},
  permisos = { camera: '()', microphone: '()', geolocation: '(self)', payment: '()' },
  nonce = generarNonce,
} = {}) {
  validarDirectivas(csp);
  if (!POLITICAS_REFERRER.includes(referrer)) throw new TypeError(`Referrer-Policy invalida: ${referrer}`);
  const valorHsts = hsts === false ? null : validarHsts(hsts);
  const permissionsPolicy = Object.entries(permisos).map(([k, v]) => `${k}=${v}`).join(', ');
  const nombreCsp = soloReportar ? 'Content-Security-Policy-Report-Only' : 'Content-Security-Policy';

  return (req, res, next) => {
    const valorNonce = nonce();
    res.locals.nonce = valorNonce;
    res.removeHeader('X-Powered-By');
    res.set({
      [nombreCsp]: construirCsp(csp, { nonce: valorNonce, reporte: reporteCsp }),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': referrer,
      'Permissions-Policy': permissionsPolicy,
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin',
      'Origin-Agent-Cluster': '?1',
      'X-DNS-Prefetch-Control': 'off',
      'X-Permitted-Cross-Domain-Policies': 'none',
      // el filtro XSS antiguo de los navegadores causaba mas problemas de los que resolvia
      'X-XSS-Protection': '0',
    });
    // HSTS solo tiene sentido sobre https; por http el navegador lo ignora y puede confundir
    if (valorHsts && req.secure) res.set('Strict-Transport-Security', valorHsts);
    next();
  };
}

export const sinCache = (req, res, next) => {
  res.set({ 'Cache-Control': 'no-store', Pragma: 'no-cache', Expires: '0' });
  next();
};
