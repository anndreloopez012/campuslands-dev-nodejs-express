import {
  cabeceraLocation,
  cabeceraTotal,
  cuerpoJson,
  paginacionParametros,
  parametroConsulta,
  parametroRuta,
  ref,
  respuesta,
  respuestaError,
} from './ayudas.js';
import { ESTADOS_TORNEO, FORMATOS } from '../constants/moba.js';

const copa = {
  id: 1,
  nombre: 'Copa Apertura',
  formato: 'liga',
  estado: 'inscripcion',
  cupos: 4,
  inscritos: 2,
  premio: 5000,
  inicio: '2026-12-01',
};

const inscripcion = {
  id: 11,
  torneoId: 1,
  equipo: { id: 3, nombre: 'Jade Dragons', tag: 'JDR' },
  inscritoEn: '2026-11-04T16:00:00.000Z',
};

const id = (ejemplo) => parametroRuta('id', 'Id del torneo.', ejemplo);

const idInvalido = respuestaError('Algun id no es un entero positivo.', 'El id debe ser un entero positivo', 'ID_INVALIDO');
const torneoNoEncontrado = respuestaError('No existe el torneo.', 'No existe el torneo 99', 'TORNEO_NO_ENCONTRADO');
const cerrada = respuestaError(
  'El torneo ya no admite cambios en las inscripciones.',
  'El torneo ya no admite cambios en las inscripciones',
  'INSCRIPCION_CERRADA',
);

export const rutasTorneos = {
  '/torneos': {
    get: {
      tags: ['Torneos'],
      operationId: 'listarTorneos',
      summary: 'Lista torneos',
      description: 'Devuelve los torneos con la cantidad de equipos inscritos.',
      parameters: [
        parametroConsulta('estado', 'Filtra por etapa.', { type: 'string', enum: ESTADOS_TORNEO }, 'inscripcion'),
        parametroConsulta('formato', 'Filtra por formato.', { type: 'string', enum: FORMATOS }, 'liga'),
        parametroConsulta('orden', 'Campo de orden.', { type: 'string', enum: ['id', 'inicio', 'premio'], default: 'id' }, 'premio'),
        ...paginacionParametros,
      ],
      responses: {
        200: respuesta(
          'Pagina de torneos.',
          ref('ListaTorneos'),
          { ok: true, data: [copa], paginacion: { pagina: 1, limite: 10, total: 4, totalPaginas: 1 } },
          cabeceraTotal,
        ),
        400: respuestaError(
          'Algun parametro de consulta es invalido.',
          'Parametros de consulta invalidos',
          'CONSULTA_INVALIDA',
          [{ campo: 'estado', mensaje: 'debe ser uno de: inscripcion, en_curso, finalizado' }],
        ),
      },
    },
  },
  '/torneos/{id}': {
    get: {
      tags: ['Torneos'],
      operationId: 'obtenerTorneo',
      summary: 'Detalle de un torneo',
      parameters: [id(1)],
      responses: {
        200: respuesta('El torneo.', ref('RespuestaTorneo'), { ok: true, data: copa }),
        400: idInvalido,
        404: torneoNoEncontrado,
      },
    },
  },
  '/torneos/{id}/inscripciones': {
    get: {
      tags: ['Inscripciones'],
      operationId: 'listarInscripciones',
      summary: 'Equipos inscritos en un torneo',
      parameters: [id(1)],
      responses: {
        200: respuesta('Inscripciones del torneo.', ref('ListaInscripciones'), { ok: true, data: [inscripcion] }),
        400: idInvalido,
        404: torneoNoEncontrado,
      },
    },
    post: {
      tags: ['Inscripciones'],
      operationId: 'inscribirEquipo',
      summary: 'Inscribe un equipo',
      description: 'Solo funciona mientras el torneo esta en etapa de inscripcion, hay cupos y el equipo no esta inscrito.',
      parameters: [id(1)],
      requestBody: cuerpoJson(ref('InscripcionNueva'), { equipoId: 3 }, 'Equipo que se inscribe.'),
      responses: {
        201: respuesta(
          'Inscripcion creada.',
          ref('RespuestaInscripcion'),
          { ok: true, data: inscripcion },
          cabeceraLocation('Url de las inscripciones del torneo.'),
        ),
        400: respuestaError(
          'El id o el body son invalidos.',
          'Datos invalidos',
          'VALIDACION',
          [{ campo: 'equipoId', mensaje: 'es obligatorio' }],
        ),
        404: torneoNoEncontrado,
        409: respuestaError('Inscripcion cerrada, torneo lleno o equipo repetido.', 'El torneo no tiene cupos disponibles', 'TORNEO_LLENO'),
        415: respuestaError(
          'El Content-Type no es application/json.',
          'El Content-Type debe ser application/json',
          'TIPO_NO_SOPORTADO',
        ),
        422: respuestaError(
          'El equipo no existe.',
          'La referencia indicada no existe',
          'REFERENCIA_INVALIDA',
          [{ campo: 'equipoId', mensaje: 'No existe el equipo 99' }],
        ),
      },
    },
  },
  '/torneos/{id}/inscripciones/{equipoId}': {
    delete: {
      tags: ['Inscripciones'],
      operationId: 'retirarEquipo',
      summary: 'Retira un equipo del torneo',
      description: 'Solo se puede retirar mientras el torneo esta en etapa de inscripcion.',
      parameters: [id(1), parametroRuta('equipoId', 'Id del equipo inscrito.', 2)],
      responses: {
        200: respuesta('Inscripcion retirada.', ref('RespuestaInscripcion'), { ok: true, data: inscripcion }),
        400: idInvalido,
        404: respuestaError(
          'El torneo no existe o el equipo no esta inscrito.',
          'El equipo 7 no esta inscrito en el torneo 1',
          'INSCRIPCION_NO_ENCONTRADA',
        ),
        409: cerrada,
      },
    },
  },
};
