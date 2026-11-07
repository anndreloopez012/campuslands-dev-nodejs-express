const { config } = require('dotenv');
const { AppError } = require('../errors/app.error');

// Solo carga el archivo .env en desarrollo: en produccion las variables
// se inyectan por el sistema (PM2, Docker, Kubernetes, etc.)
const entorno = process.env.NODE_ENV || 'development';
if (entorno !== 'production') {
  config();
}

/**
 * Lee una variable de entorno como string.
 * Lanza AppError si es obligatoria y falta: la configuracion debe fallar al iniciar,
 * no a mitad de una peticion.
 */
function string(nombre, { obligatoria = false, default: valorDefecto } = {}) {
  let valor = process.env[nombre];

  if (typeof valor === 'string' && valor.length === 0) {
    throw new AppError(`La variable de entorno "${nombre}" esta vacia`, 500);
  }
  if (valor === undefined) {
    if (obligatoria) {
      throw new AppError(`La variable de entorno "${nombre}" es obligatoria y no esta definida`, 500);
    }
    if (valorDefecto === undefined) return null;
    valor = String(valorDefecto);
  }

  return valor.replace(/^"(.*)"$/, '$1'); // permite valores entre comillas en el .env
}

/** Lee y convierte a entero, con validacion de rango opcional. */
function entero(nombre, { obligatoria = false, default: valorDefecto, min, max } = {}) {
  const texto = string(nombre, { obligatoria, default: valorDefecto });
  if (texto === null) return null;

  const valor = Number(texto);
  if (!Number.isInteger(valor)) {
    throw new AppError(`La variable de entorno "${nombre}" debe ser un entero (recibido: "${texto}")`, 500);
  }
  if (min !== undefined && valor < min) {
    throw new AppError(`La variable de entorno "${nombre}" debe ser >= ${min} (recibido: ${valor})`, 500);
  }
  if (max !== undefined && valor > max) {
    throw new AppError(`La variable de entorno "${nombre}" debe ser <= ${max} (recibido: ${valor})`, 500);
  }

  return valor;
}

/** Lee y convierte a numero decimal positivo. */
function decimal(nombre, { obligatoria = false, default: valorDefecto, min = 0 } = {}) {
  const texto = string(nombre, { obligatoria, default: valorDefecto });
  if (texto === null) return null;

  const valor = Number(texto);
  if (Number.isNaN(valor) || valor <= min) {
    throw new AppError(`La variable de entorno "${nombre}" debe ser un numero > ${min} (recibido: "${texto}")`, 500);
  }
  return valor;
}

/** Lee listas separadas por comas ("tinta,retouch,boleto"). */
function lista(nombre, { obligatoria = false, default: valorDefecto } = {}) {
  const texto = string(nombre, { obligatoria, default: valorDefecto });
  if (texto === null) return null;
  return texto.split(',').map((item) => item.trim()).filter(Boolean);
}

/** Le da valor de verdad a variables tipo flag. */
function booleano(nombre, { obligatoria = false, default: valorDefecto } = {}) {
  const texto = string(nombre, { obligatoria, default: valorDefecto === undefined ? undefined : String(valorDefecto) });
  if (texto === null) return null;

  const normalizado = texto.toLowerCase();
  if (['true', '1', 'yes', 'si'].includes(normalizado)) return true;
  if (['false', '0', 'no'].includes(normalizado)) return false;

  throw new AppError(`La variable de entorno "${nombre}" debe ser booleana (true/false)`, 500);
}

module.exports = { string, entero, decimal, lista, booleano };
