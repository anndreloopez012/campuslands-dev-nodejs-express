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
import { REGIONES } from '../constants/moba.js';

const nebula = {
  id: 1,
  nombre: 'Nebula Five',
  tag: 'NBF',
  region: 'eu',
  victorias: 34,
  derrotas: 12,
  creadoEn: '2026-09-01T12:00:00.000Z',
};

const paginacion = { pagina: 1, limite: 10, total: 7, totalPaginas: 1 };

const id = (ejemplo) => parametroRuta('id', 'Id del equipo.', ejemplo);

const idInvalido = respuestaError('El id no es un entero positivo.', 'El id debe ser un entero positivo', 'ID_INVALIDO');
const noEncontrado = respuestaError('No existe el equipo.', 'No existe el equipo 99', 'EQUIPO_NO_ENCONTRADO');
const tipoNoSoportado = respuestaError(
  'El Content-Type no es application/json.',
  'El Content-Type debe ser application/json',
  'TIPO_NO_SOPORTADO',
);

export const rutasEquipos = {
  '/equipos': {
    get: {
      tags: ['Equipos'],
      operationId: 'listarEquipos',
      summary: 'Lista equipos',
      description: 'Devuelve los equipos con filtros, orden y paginacion. El total viene tambien en el header X-Total-Count.',
      parameters: [
        parametroConsulta('region', 'Filtra por region.', { type: 'string', enum: REGIONES }, 'eu'),
        parametroConsulta('buscar', 'Texto contenido en el nombre o en el tag.', { type: 'string', minLength: 1, maxLength: 30 }, 'wolves'),
        parametroConsulta('orden', 'Campo de orden.', { type: 'string', enum: ['id', 'nombre', 'victorias'], default: 'id' }, 'victorias'),
        ...paginacionParametros,
      ],
      responses: {
        200: respuesta('Pagina de equipos.', ref('ListaEquipos'), { ok: true, data: [nebula], paginacion }, cabeceraTotal),
        400: respuestaError(
          'Algun parametro de consulta es invalido.',
          'Parametros de consulta invalidos',
          'CONSULTA_INVALIDA',
          [{ campo: 'region', mensaje: 'debe ser uno de: na, eu, latam, asia' }],
        ),
      },
    },
    post: {
      tags: ['Equipos'],
      operationId: 'crearEquipo',
      summary: 'Crea un equipo',
      description: 'Registra un equipo nuevo con 0 victorias y 0 derrotas.',
      requestBody: cuerpoJson(ref('EquipoNuevo'), { nombre: 'Aurora Nine', tag: 'AUR', region: 'latam' }, 'Datos del equipo.'),
      responses: {
        201: respuesta(
          'Equipo creado.',
          ref('RespuestaEquipo'),
          { ok: true, data: { ...nebula, id: 8, nombre: 'Aurora Nine', tag: 'AUR', region: 'latam', victorias: 0, derrotas: 0 } },
          cabeceraLocation('Url del equipo creado.'),
        ),
        400: respuestaError(
          'El body es invalido.',
          'Datos invalidos',
          'VALIDACION',
          [{ campo: 'tag', mensaje: 'solo admite mayusculas y numeros' }],
        ),
        409: respuestaError('El nombre o el tag ya existen.', 'Ya existe un equipo con el tag NBF', 'TAG_DUPLICADO'),
        415: tipoNoSoportado,
      },
    },
  },
  '/equipos/{id}': {
    get: {
      tags: ['Equipos'],
      operationId: 'obtenerEquipo',
      summary: 'Detalle de un equipo',
      parameters: [id(2)],
      responses: {
        200: respuesta('El equipo.', ref('RespuestaEquipo'), { ok: true, data: nebula }),
        400: idInvalido,
        404: noEncontrado,
      },
    },
    patch: {
      tags: ['Equipos'],
      operationId: 'actualizarEquipo',
      summary: 'Actualiza nombre o region',
      description: 'Solo se pueden cambiar el nombre y la region. El tag es permanente. Debe enviarse al menos un campo.',
      parameters: [id(2)],
      requestBody: cuerpoJson(ref('EquipoCambios'), { nombre: 'Crimson Wolves Prime' }, 'Campos a cambiar.'),
      responses: {
        200: respuesta('Equipo actualizado.', ref('RespuestaEquipo'), { ok: true, data: { ...nebula, nombre: 'Crimson Wolves Prime' } }),
        400: respuestaError(
          'El id o el body son invalidos.',
          'Datos invalidos',
          'VALIDACION',
          [{ campo: 'tag', mensaje: 'campo no permitido' }],
        ),
        404: noEncontrado,
        409: respuestaError('Otro equipo ya usa ese nombre.', 'Ya existe un equipo llamado Nebula Five', 'NOMBRE_DUPLICADO'),
        415: tipoNoSoportado,
      },
    },
    delete: {
      tags: ['Equipos'],
      operationId: 'eliminarEquipo',
      summary: 'Elimina un equipo',
      description: 'No se puede eliminar un equipo que esta inscrito en algun torneo.',
      parameters: [id(7)],
      responses: {
        200: respuesta('Equipo eliminado.', ref('RespuestaEquipo'), { ok: true, data: nebula }),
        400: idInvalido,
        404: noEncontrado,
        409: respuestaError('El equipo esta inscrito en un torneo.', 'El equipo esta inscrito en al menos un torneo', 'EQUIPO_INSCRITO'),
      },
    },
  },
};
