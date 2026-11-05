import dotenv from 'dotenv';

const entornoDelSistema = { ...process.env };
const desdeArchivo = dotenv.config({ quiet: true }).parsed ?? {};

const CLAVE_DE_DESARROLLO = 'clave-solo-para-desarrollo';
const ENTORNOS = ['development', 'test', 'production'];
const NIVELES = ['silent', 'info', 'debug'];

const errores = [];

function origenDe(nombre) {
  if (Object.hasOwn(entornoDelSistema, nombre)) return 'sistema';
  if (Object.hasOwn(desdeArchivo, nombre)) return '.env';
  return 'defecto';
}

function leer(nombre, defecto, convertir) {
  const bruto = process.env[nombre];
  if (bruto === undefined || bruto.trim() === '') return { valor: defecto, origen: 'defecto' };
  try {
    return { valor: convertir(bruto.trim()), origen: origenDe(nombre) };
  } catch (error) {
    errores.push(`${nombre}: ${error.message}`);
    return { valor: defecto, origen: 'defecto' };
  }
}

const entero = (minimo, maximo) => (texto) => {
  if (!/^\d+$/.test(texto) || Number(texto) < minimo || Number(texto) > maximo) {
    throw new Error(`debe ser un entero entre ${minimo} y ${maximo} (recibido "${texto}")`);
  }
  return Number(texto);
};

const opcion = (valores) => (texto) => {
  if (!valores.includes(texto)) throw new Error(`debe ser uno de: ${valores.join(', ')} (recibido "${texto}")`);
  return texto;
};

const texto = (minimo, maximo) => (valor) => {
  if (valor.length < minimo || valor.length > maximo) throw new Error(`debe tener entre ${minimo} y ${maximo} caracteres`);
  return valor;
};

const hora = (valor) => {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(valor)) throw new Error(`debe tener formato HH:MM (recibido "${valor}")`);
  return valor;
};

const listaDeDias = (valor) => {
  const dias = valor.split(',').map((parte) => parte.trim());
  if (!dias.every((dia) => /^[0-6]$/.test(dia))) throw new Error('debe ser una lista de numeros del 0 (domingo) al 6 (sabado), separados por coma');
  return [...new Set(dias.map(Number))].sort();
};

const minutos = (valor) => Number(valor.slice(0, 2)) * 60 + Number(valor.slice(3));

const variables = {
  PORT: leer('PORT', 3000, entero(1, 65535)),
  NODE_ENV: leer('NODE_ENV', 'development', opcion(ENTORNOS)),
  APP_NAME: leer('APP_NAME', 'Tinta Viva Studio', texto(2, 60)),
  LOG_LEVEL: leer('LOG_LEVEL', 'info', opcion(NIVELES)),
  API_KEY: leer('API_KEY', undefined, texto(16, 64)),
  HORA_APERTURA: leer('HORA_APERTURA', '10:00', hora),
  HORA_CIERRE: leer('HORA_CIERRE', '19:00', hora),
  DURACION_SESION_MIN: leer('DURACION_SESION_MIN', 60, entero(15, 480)),
  MAX_CITAS_POR_DIA: leer('MAX_CITAS_POR_DIA', 4, entero(1, 20)),
  DIAS_CERRADOS: leer('DIAS_CERRADOS', [0], listaDeDias),
  DIAS_ANTICIPACION_MAX: leer('DIAS_ANTICIPACION_MAX', 90, entero(1, 365)),
  DEPOSITO_PORCENTAJE: leer('DEPOSITO_PORCENTAJE', 20, entero(0, 100)),
};

const entorno = variables.NODE_ENV.valor;

if (variables.API_KEY.valor === undefined) {
  if (entorno === 'production') errores.push('API_KEY: es obligatoria en production');
  else variables.API_KEY = { valor: CLAVE_DE_DESARROLLO, origen: 'defecto' };
} else if (entorno === 'production' && variables.API_KEY.valor === CLAVE_DE_DESARROLLO) {
  errores.push('API_KEY: no puede usar la clave de desarrollo en production');
}

if (minutos(variables.HORA_CIERRE.valor) - minutos(variables.HORA_APERTURA.valor) < variables.DURACION_SESION_MIN.valor) {
  errores.push('HORA_APERTURA y HORA_CIERRE: el horario debe alcanzar para al menos una sesion de DURACION_SESION_MIN');
}

if (errores.length) {
  console.error('Configuracion invalida:');
  errores.forEach((mensaje) => console.error(` - ${mensaje}`));
  console.error('Revisa el archivo .env (puedes copiar .env.example) o las variables del sistema.');
  process.exit(1);
}

const valor = (nombre) => variables[nombre].valor;

export const config = Object.freeze({
  puerto: valor('PORT'),
  entorno,
  esProduccion: entorno === 'production',
  nombreApp: valor('APP_NAME'),
  nivelLog: valor('LOG_LEVEL'),
  apiKey: valor('API_KEY'),
  estudio: Object.freeze({
    apertura: valor('HORA_APERTURA'),
    cierre: valor('HORA_CIERRE'),
    duracionSesionMin: valor('DURACION_SESION_MIN'),
    maxCitasPorDia: valor('MAX_CITAS_POR_DIA'),
    diasCerrados: Object.freeze(valor('DIAS_CERRADOS')),
    diasAnticipacionMax: valor('DIAS_ANTICIPACION_MAX'),
    depositoPorcentaje: valor('DEPOSITO_PORCENTAJE'),
  }),
  origenes: Object.freeze(Object.fromEntries(Object.entries(variables).map(([nombre, dato]) => [nombre, dato.origen]))),
  hayArchivoEnv: Object.keys(desdeArchivo).length > 0,
});

export const minutosDe = minutos;
