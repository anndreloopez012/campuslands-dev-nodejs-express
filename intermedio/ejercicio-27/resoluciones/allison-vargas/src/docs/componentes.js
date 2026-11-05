import { aEsquemaJson } from './esquemaJson.js';
import { ref } from './ayudas.js';
import { esquemaEquipo, esquemaEquipoCambios, esquemaInscripcion } from '../validators/schemas.js';
import { ESTADOS_TORNEO, FORMATOS, REGIONES } from '../constants/moba.js';

const entero = (description) => ({ type: 'integer', description });
const texto = (description) => ({ type: 'string', description });

const envolver = (data) => ({
  type: 'object',
  additionalProperties: false,
  required: ['ok', 'data'],
  properties: { ok: { type: 'boolean', example: true }, data },
});

const listado = (item) => ({
  type: 'object',
  additionalProperties: false,
  required: ['ok', 'data', 'paginacion'],
  properties: {
    ok: { type: 'boolean', example: true },
    data: { type: 'array', items: item },
    paginacion: ref('Paginacion'),
  },
});

export const componentes = {
  schemas: {
    Equipo: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'nombre', 'tag', 'region', 'victorias', 'derrotas', 'creadoEn'],
      properties: {
        id: entero('Identificador del equipo.'),
        nombre: texto('Nombre del equipo.'),
        tag: texto('Sigla del equipo.'),
        region: { type: 'string', enum: REGIONES, description: 'Region donde compite.' },
        victorias: entero('Partidas ganadas.'),
        derrotas: entero('Partidas perdidas.'),
        creadoEn: { type: 'string', format: 'date-time', description: 'Fecha de registro.' },
      },
    },
    EquipoNuevo: aEsquemaJson(esquemaEquipo),
    EquipoCambios: aEsquemaJson(esquemaEquipoCambios, { parcial: true }),
    EquipoResumen: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'nombre', 'tag'],
      properties: { id: entero('Identificador del equipo.'), nombre: texto('Nombre.'), tag: texto('Sigla.') },
    },
    Torneo: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'nombre', 'formato', 'estado', 'cupos', 'inscritos', 'premio', 'inicio'],
      properties: {
        id: entero('Identificador del torneo.'),
        nombre: texto('Nombre del torneo.'),
        formato: { type: 'string', enum: FORMATOS, description: 'Sistema de competencia.' },
        estado: { type: 'string', enum: ESTADOS_TORNEO, description: 'Etapa en la que esta el torneo.' },
        cupos: entero('Cantidad maxima de equipos.'),
        inscritos: entero('Equipos inscritos actualmente.'),
        premio: entero('Premio total en dolares.'),
        inicio: { type: 'string', format: 'date', description: 'Fecha de inicio.' },
      },
    },
    InscripcionNueva: aEsquemaJson(esquemaInscripcion),
    Inscripcion: {
      type: 'object',
      additionalProperties: false,
      required: ['id', 'torneoId', 'equipo', 'inscritoEn'],
      properties: {
        id: entero('Identificador de la inscripcion.'),
        torneoId: entero('Torneo al que pertenece.'),
        equipo: ref('EquipoResumen'),
        inscritoEn: { type: 'string', format: 'date-time', description: 'Fecha de inscripcion.' },
      },
    },
    Paginacion: {
      type: 'object',
      additionalProperties: false,
      required: ['pagina', 'limite', 'total', 'totalPaginas'],
      properties: {
        pagina: entero('Pagina actual.'),
        limite: entero('Resultados por pagina.'),
        total: entero('Total de resultados.'),
        totalPaginas: entero('Total de paginas.'),
      },
    },
    Error: {
      type: 'object',
      additionalProperties: false,
      required: ['ok', 'message', 'codigo'],
      properties: {
        ok: { type: 'boolean', example: false },
        message: texto('Explicacion legible del error.'),
        codigo: texto('Codigo estable para que el cliente tome decisiones.'),
        errores: {
          type: 'array',
          description: 'Detalle por campo cuando el error es de validacion.',
          items: {
            type: 'object',
            additionalProperties: false,
            required: ['campo', 'mensaje'],
            properties: { campo: texto('Campo con problema.'), mensaje: texto('Que esta mal.') },
          },
        },
      },
    },
    RespuestaEquipo: envolver(ref('Equipo')),
    ListaEquipos: listado(ref('Equipo')),
    RespuestaTorneo: envolver(ref('Torneo')),
    ListaTorneos: listado(ref('Torneo')),
    RespuestaInscripcion: envolver(ref('Inscripcion')),
    ListaInscripciones: envolver({ type: 'array', items: ref('Inscripcion') }),
  },
  parameters: {
    Pagina: {
      name: 'pagina',
      in: 'query',
      required: false,
      description: 'Numero de pagina, desde 1.',
      schema: { type: 'integer', minimum: 1, default: 1 },
    },
    Limite: {
      name: 'limite',
      in: 'query',
      required: false,
      description: 'Resultados por pagina.',
      schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
    },
  },
};
