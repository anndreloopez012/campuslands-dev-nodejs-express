import { BASE_RUTAS } from '../constants/rutas.js';
import { CATALOGO, CODIGOS, esErrorDeDominio } from '../domain/errores/index.js';
import { CATALOGO_HTTP, ErrorHttp, crearHttp } from './errores-http.js';

export const ESTADO_POR_CATEGORIA = Object.freeze({
  no_encontrado: 404,
  conflicto: 409,
  estado_invalido: 409,
  regla_de_negocio: 422,
  permiso: 403,
});

export const urlDelTipo = (codigo) => `${BASE_RUTAS}/errores/${codigo}`;

export function normalizar(err) {
  if (esErrorDeDominio(err) || err instanceof ErrorHttp) return err;
  if (err?.type === 'entity.parse.failed') {
    return crearHttp('JSON_INVALIDO', 'El body no es un JSON valido', { causa: err });
  }
  if (err?.type === 'entity.too.large') {
    return crearHttp('PAYLOAD_GRANDE', 'El body supera el tamano permitido', { causa: err });
  }
  return null;
}

export function aProblema(err, { instance, idPeticion }) {
  const error = normalizar(err);

  if (error && esErrorDeDominio(error)) {
    const definicion = CATALOGO[error.codigo];
    const status = ESTADO_POR_CATEGORIA[error.categoria];
    return {
      status,
      cabeceras: {},
      inesperado: false,
      cuerpo: {
        type: urlDelTipo(error.codigo),
        title: definicion.titulo,
        status,
        detail: error.message,
        instance,
        codigo: error.codigo,
        categoria: error.categoria,
        reintentable: definicion.reintentable,
        sugerencia: definicion.sugerencia,
        contexto: { ...error.contexto },
        idPeticion,
      },
    };
  }

  if (error) {
    const definicion = CATALOGO_HTTP[error.codigo];
    const cuerpo = {
      type: urlDelTipo(error.codigo),
      title: definicion.titulo,
      status: definicion.status,
      detail: error.message,
      instance,
      codigo: error.codigo,
      categoria: 'http',
      reintentable: false,
      sugerencia: definicion.sugerencia,
      idPeticion,
    };
    if (error.detalles) cuerpo.errores = error.detalles;
    return { status: definicion.status, cabeceras: error.cabeceras ?? {}, inesperado: false, cuerpo };
  }

  const definicion = CATALOGO_HTTP.ERROR_INTERNO;
  return {
    status: definicion.status,
    cabeceras: {},
    inesperado: true,
    cuerpo: {
      type: urlDelTipo('ERROR_INTERNO'),
      title: definicion.titulo,
      status: definicion.status,
      detail: 'Ocurrio un error inesperado; no se pudo completar la solicitud',
      instance,
      codigo: 'ERROR_INTERNO',
      categoria: 'http',
      reintentable: true,
      sugerencia: definicion.sugerencia,
      idPeticion,
    },
  };
}

export function listarCatalogo() {
  const dominio = CODIGOS.map((codigo) => {
    const definicion = CATALOGO[codigo];
    const categoria = definicion.clase.categoria;
    return {
      codigo,
      origen: 'dominio',
      categoria,
      status: ESTADO_POR_CATEGORIA[categoria],
      titulo: definicion.titulo,
      sugerencia: definicion.sugerencia,
      reintentable: definicion.reintentable,
      type: urlDelTipo(codigo),
    };
  });
  const http = Object.entries(CATALOGO_HTTP).map(([codigo, definicion]) => ({
    codigo,
    origen: 'http',
    categoria: 'http',
    status: definicion.status,
    titulo: definicion.titulo,
    sugerencia: definicion.sugerencia,
    reintentable: codigo === 'ERROR_INTERNO',
    type: urlDelTipo(codigo),
  }));
  return [...dominio, ...http];
}
