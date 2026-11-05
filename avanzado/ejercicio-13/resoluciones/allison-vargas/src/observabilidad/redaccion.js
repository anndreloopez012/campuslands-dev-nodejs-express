export const CLAVES_SENSIBLES = Object.freeze([
  'password', 'contrasena', 'token', 'accesstoken', 'refreshtoken', 'authorization',
  'cookie', 'setcookie', 'secreto', 'apikey', 'xapikey', 'tarjeta',
]);

export const REDACTADO = '[REDACTADO]';
const MAX_TEXTO = 2000;
const MAX_PROFUNDIDAD = 6;

const normalizar = (clave) => String(clave).toLowerCase().replace(/[-_\s]/g, '');

export function crearRedactor(claves = CLAVES_SENSIBLES) {
  const sensibles = new Set(claves.map(normalizar));
  const esSensible = (clave) => sensibles.has(normalizar(clave));

  function redactarUrl(url) {
    const pregunta = url.indexOf('?');
    if (pregunta === -1) return url;
    const parametros = url.slice(pregunta + 1).split('&').map((par) => {
      const [clave] = par.split('=');
      let nombre = clave;
      try {
        nombre = decodeURIComponent(clave);
      } catch {
        // si la clave viene mal codificada se compara tal cual
      }
      return esSensible(nombre) ? `${clave}=${REDACTADO}` : par;
    });
    return `${url.slice(0, pregunta)}?${parametros.join('&')}`;
  }

  function redactar(valor, profundidad, vistos) {
    if (typeof valor === 'string') {
      return valor.length > MAX_TEXTO ? `${valor.slice(0, MAX_TEXTO)}...[${valor.length - MAX_TEXTO} mas]` : valor;
    }
    if (typeof valor === 'bigint') return valor.toString();
    if (valor === null || typeof valor !== 'object') return valor;
    if (valor instanceof Date) return valor.toISOString();
    if (vistos.has(valor)) return '[Circular]';
    if (profundidad >= MAX_PROFUNDIDAD) return '[Profundo]';
    vistos.add(valor);
    let salida;
    if (Array.isArray(valor)) {
      salida = valor.map((item) => redactar(item, profundidad + 1, vistos));
    } else {
      salida = {};
      for (const [clave, interno] of Object.entries(valor)) {
        salida[clave] = esSensible(clave) ? REDACTADO : redactar(interno, profundidad + 1, vistos);
      }
    }
    vistos.delete(valor);
    return salida;
  }

  return { redactar: (valor) => redactar(valor, 0, new WeakSet()), redactarUrl, esSensible };
}
