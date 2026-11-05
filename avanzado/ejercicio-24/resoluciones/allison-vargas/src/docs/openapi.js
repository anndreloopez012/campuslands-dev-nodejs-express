import { BASE_RUTAS } from '../constants/rutas.js';
import { CATEGORIAS } from '../services/quimica.service.js';

const ref = (nombre) => ({ $ref: `#/components/schemas/${nombre}` });
const respuesta = (nombre) => ({ $ref: `#/components/responses/${nombre}` });

// toda respuesta correcta tiene la forma { ok: true, data: ... }
const exito = (descripcion, data, extra = {}) => ({
  description: descripcion,
  ...extra,
  content: {
    'application/json': {
      schema: {
        type: 'object', required: ['ok', 'data'], additionalProperties: false, properties: { ok: { const: true }, data },
      },
    },
  },
});

const cuerpo = (nombre, ejemplo) => ({
  required: true,
  content: { 'application/json': { schema: ref(nombre), examples: { basico: { value: ejemplo } } } },
});

const errorRespuesta = (descripcion, ejemplo) => ({
  description: descripcion,
  content: { 'application/json': { schema: ref('Error'), example: ejemplo } },
});

export const especificacion = {
  openapi: '3.1.0',
  info: {
    title: 'API de formulas quimicas',
    version: '1.0.0',
    description: [
      'Analiza formulas quimicas (masa molar, composicion porcentual, conversion gramos-moles) y mantiene un catalogo de compuestos.',
      'Todas las respuestas correctas son `{ ok: true, data }` y los errores `{ ok: false, message, codigo, errores? }`.',
      'Cualquier ruta responde `405` con cabecera `Allow` ante un metodo no admitido y `404 RUTA_NO_ENCONTRADA` si no existe.',
    ].join('\n\n'),
    license: { name: 'MIT', identifier: 'MIT' },
  },
  servers: [{ url: BASE_RUTAS, description: 'Ruta base del ejercicio' }],
  tags: [
    { name: 'documentacion', description: 'Informacion de la API' },
    { name: 'elementos', description: 'Tabla periodica (subconjunto)' },
    { name: 'formulas', description: 'Calculos sobre una formula' },
    { name: 'compuestos', description: 'Catalogo de compuestos guardados' },
  ],
  paths: {
    '/': {
      get: {
        tags: ['documentacion'],
        operationId: 'informacion',
        summary: 'Informacion del ejercicio',
        responses: {
          200: {
            description: 'Informacion basica',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['ok', 'message', 'topic'],
                  properties: { ok: { const: true }, message: { type: 'string' }, topic: { type: 'string' } },
                },
              },
            },
          },
        },
      },
    },
    '/openapi.json': {
      get: {
        tags: ['documentacion'],
        operationId: 'obtenerEspecificacion',
        summary: 'Esta especificacion en JSON',
        description: 'Responde con `ETag`; con `If-None-Match` devuelve `304` si no cambio.',
        responses: {
          200: { description: 'Documento OpenAPI 3.1', content: { 'application/json': { schema: { type: 'object', required: ['openapi', 'paths'] } } } },
          304: { description: 'La especificacion no cambio' },
        },
      },
    },
    '/docs': {
      get: {
        tags: ['documentacion'],
        operationId: 'verDocumentacion',
        summary: 'Documentacion en HTML generada desde la especificacion',
        responses: { 200: { description: 'Pagina HTML', content: { 'text/html': { schema: { type: 'string' } } } } },
      },
    },
    '/elementos': {
      get: {
        tags: ['elementos'],
        operationId: 'listarElementos',
        summary: 'Lista los elementos disponibles',
        responses: { 200: exito('Elementos', { type: 'array', items: ref('Elemento') }) },
      },
    },
    '/elementos/{simbolo}': {
      get: {
        tags: ['elementos'],
        operationId: 'obtenerElemento',
        summary: 'Un elemento por su simbolo',
        parameters: [{
          name: 'simbolo', in: 'path', required: true, description: 'Simbolo quimico, respetando mayusculas', schema: { type: 'string', pattern: '^[A-Z][a-z]?$' }, example: 'Fe',
        }],
        responses: {
          200: exito('El elemento', ref('Elemento')),
          400: respuesta('ErrorValidacion'),
          404: errorRespuesta('No existe', { ok: false, message: 'No existe el elemento Xx', codigo: 'ELEMENTO_NO_ENCONTRADO', contexto: { simbolo: 'Xx' } }),
        },
      },
    },
    '/formulas/analisis': {
      post: {
        tags: ['formulas'],
        operationId: 'analizarFormula',
        summary: 'Masa molar y composicion porcentual',
        description: 'Acepta parentesis o corchetes anidados (`Ca(OH)2`, `K4[Fe(CN)6]`) e hidratos con `\u00B7`, `.` o `*` (`CuSO4\u00B75H2O`).',
        requestBody: cuerpo('AnalisisEntrada', { formula: 'Ca(OH)2' }),
        responses: {
          200: exito('Analisis de la formula', ref('Analisis')),
          400: errorRespuesta('Formula invalida o datos incorrectos', {
            ok: false, message: 'La formula "H2Xy" no es valida en la posicion 2: elemento desconocido "Xy"', codigo: 'FORMULA_INVALIDA', contexto: { formula: 'H2Xy', posicion: 2, motivo: 'elemento desconocido "Xy"' },
          }),
          415: respuesta('FormatoNoSoportado'),
        },
      },
    },
    '/formulas/conversion': {
      post: {
        tags: ['formulas'],
        operationId: 'convertirGramos',
        summary: 'Convierte gramos a moles y moleculas',
        requestBody: cuerpo('ConversionEntrada', { formula: 'H2O', gramos: 36 }),
        responses: {
          200: exito('Conversion', ref('Conversion')),
          400: respuesta('ErrorValidacion'),
          415: respuesta('FormatoNoSoportado'),
        },
      },
    },
    '/compuestos': {
      get: {
        tags: ['compuestos'],
        operationId: 'listarCompuestos',
        summary: 'Lista y filtra compuestos',
        parameters: [
          {
            name: 'categoria', in: 'query', required: false, schema: { type: 'string', enum: CATEGORIAS },
          },
          {
            name: 'q', in: 'query', required: false, description: 'Busca en nombre o formula', schema: { type: 'string', minLength: 1, maxLength: 40 },
          },
        ],
        responses: { 200: exito('Compuestos', { type: 'array', items: ref('Compuesto') }), 400: respuesta('ErrorValidacion') },
      },
      post: {
        tags: ['compuestos'],
        operationId: 'crearCompuesto',
        summary: 'Guarda un compuesto (calcula su masa molar)',
        requestBody: cuerpo('CompuestoNuevo', { nombre: 'Cloruro de sodio', formula: 'NaCl', categoria: 'sal' }),
        responses: {
          201: exito('Creado', ref('Compuesto'), {
            headers: { Location: { description: 'Ruta del compuesto creado', schema: { type: 'string' } } },
          }),
          400: respuesta('ErrorValidacion'),
          409: errorRespuesta('La formula ya esta en el catalogo', {
            ok: false, message: 'Ya existe un compuesto con la formula H2O', codigo: 'COMPUESTO_DUPLICADO', contexto: { formula: 'H2O' },
          }),
          415: respuesta('FormatoNoSoportado'),
        },
      },
    },
    '/compuestos/{id}': {
      parameters: [{
        name: 'id', in: 'path', required: true, schema: { type: 'integer', minimum: 1 },
      }],
      get: {
        tags: ['compuestos'],
        operationId: 'obtenerCompuesto',
        summary: 'Detalle de un compuesto con su analisis',
        responses: { 200: exito('Compuesto', ref('CompuestoDetalle')), 400: respuesta('ErrorValidacion'), 404: respuesta('NoEncontrado') },
      },
      delete: {
        tags: ['compuestos'],
        operationId: 'eliminarCompuesto',
        summary: 'Elimina un compuesto',
        responses: { 204: { description: 'Eliminado' }, 400: respuesta('ErrorValidacion'), 404: respuesta('NoEncontrado') },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        required: ['ok', 'message', 'codigo'],
        additionalProperties: false,
        properties: {
          ok: { const: false },
          message: { type: 'string' },
          codigo: { type: 'string', pattern: '^[A-Z_]+$' },
          contexto: { type: 'object' },
          errores: {
            type: 'array',
            items: {
              type: 'object', required: ['campo', 'mensaje'], additionalProperties: false, properties: { campo: { type: 'string' }, mensaje: { type: 'string' } },
            },
          },
        },
      },
      Elemento: {
        type: 'object',
        required: ['simbolo', 'nombre', 'numero', 'masa'],
        additionalProperties: false,
        properties: {
          simbolo: { type: 'string', pattern: '^[A-Z][a-z]?$', example: 'Fe' },
          nombre: { type: 'string', example: 'hierro' },
          numero: { type: 'integer', minimum: 1, maximum: 118, example: 26 },
          masa: { type: 'number', exclusiveMinimum: 0, description: 'Masa atomica en g/mol', example: 55.845 },
        },
      },
      AnalisisEntrada: {
        type: 'object', required: ['formula'], additionalProperties: false, properties: { formula: { type: 'string', minLength: 1, maxLength: 100 } },
      },
      ConversionEntrada: {
        type: 'object',
        required: ['formula', 'gramos'],
        additionalProperties: false,
        properties: { formula: { type: 'string', minLength: 1, maxLength: 100 }, gramos: { type: 'number', exclusiveMinimum: 0, maximum: 1000000 } },
      },
      Analisis: {
        type: 'object',
        required: ['formula', 'masaMolar', 'atomosTotales', 'composicion'],
        additionalProperties: false,
        properties: {
          formula: { type: 'string' },
          masaMolar: { type: 'number', description: 'g/mol, 3 decimales' },
          atomosTotales: { type: 'integer', minimum: 1 },
          composicion: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              required: ['simbolo', 'nombre', 'atomos', 'masa', 'porcentaje'],
              additionalProperties: false,
              properties: {
                simbolo: { type: 'string' },
                nombre: { type: 'string' },
                atomos: { type: 'integer', minimum: 1 },
                masa: { type: 'number' },
                porcentaje: { type: 'number', minimum: 0, maximum: 100 },
              },
            },
          },
        },
      },
      Conversion: {
        type: 'object',
        required: ['formula', 'gramos', 'masaMolar', 'moles', 'moleculas'],
        additionalProperties: false,
        properties: {
          formula: { type: 'string' }, gramos: { type: 'number' }, masaMolar: { type: 'number' }, moles: { type: 'number' }, moleculas: { type: 'number' },
        },
      },
      CompuestoNuevo: {
        type: 'object',
        required: ['nombre', 'formula', 'categoria'],
        additionalProperties: false,
        properties: {
          nombre: { type: 'string', minLength: 2, maxLength: 80 },
          formula: { type: 'string', minLength: 1, maxLength: 100 },
          categoria: { type: 'string', enum: CATEGORIAS },
        },
      },
      Compuesto: {
        type: 'object',
        required: ['id', 'nombre', 'formula', 'categoria', 'masaMolar'],
        additionalProperties: false,
        properties: {
          id: { type: 'integer', minimum: 1 },
          nombre: { type: 'string' },
          formula: { type: 'string' },
          categoria: { type: 'string', enum: CATEGORIAS },
          masaMolar: { type: 'number' },
        },
      },
      CompuestoDetalle: {
        type: 'object',
        required: ['id', 'nombre', 'formula', 'categoria', 'masaMolar', 'analisis'],
        additionalProperties: false,
        properties: {
          id: { type: 'integer', minimum: 1 },
          nombre: { type: 'string' },
          formula: { type: 'string' },
          categoria: { type: 'string', enum: CATEGORIAS },
          masaMolar: { type: 'number' },
          analisis: ref('Analisis'),
        },
      },
    },
    responses: {
      ErrorValidacion: errorRespuesta('Datos o parametros invalidos', {
        ok: false, message: 'Los datos enviados no son validos', codigo: 'VALIDACION', errores: [{ campo: 'gramos', mensaje: 'debe ser un numero mayor a 0 y hasta 1000000' }],
      }),
      NoEncontrado: errorRespuesta('El recurso no existe', {
        ok: false, message: 'No existe el compuesto 99', codigo: 'COMPUESTO_NO_ENCONTRADO', contexto: { compuestoId: 99 },
      }),
      FormatoNoSoportado: errorRespuesta('Falta Content-Type: application/json', {
        ok: false, message: 'El Content-Type debe ser application/json', codigo: 'FORMATO_NO_SOPORTADO', contexto: { esperado: 'application/json' },
      }),
    },
  },
};
