import { randomUUID } from 'node:crypto';
import { subidasRepository } from '../repositories/subidas.repository.js';
import { ConflictError, GoneError, NotFoundError, PayloadTooLargeError, UnprocessableError, UnsupportedMediaError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { analizarNombre, normalizarChecksum } from '../validators/archivo.validator.js';
import { CATEGORIAS, EXTENSIONES, LIMITES_POR_CATEGORIA } from '../constants/archivos.js';
import { ttlSubidaSeg } from '../config/subidas.js';
import * as proyectos from './proyectos.service.js';

const configListado = {
  filtros: { categoria: filtroEnum(CATEGORIAS) },
  ordenes: {
    reciente: (a, b) => b.confirmadoEn.localeCompare(a.confirmadoEn) || b.id - a.id,
    nombre: (a, b) => a.nombreOriginal.localeCompare(b.nombreOriginal),
    tamano: (a, b) => b.tamanoBytes - a.tamanoBytes,
  },
  ordenPorDefecto: 'reciente',
};

const expirada = (subida) => subida.estado === 'pendiente' && Date.parse(subida.expiraEn) <= Date.now();

const presentar = (subida) => (expirada(subida) ? { ...subida, estado: 'expirada' } : subida);

export function obtener(id) {
  const subida = subidasRepository.buscar(id);
  if (!subida) throw new NotFoundError(`No existe la subida ${id}`, 'SUBIDA_NO_ENCONTRADA');
  return presentar(subida);
}

export function listarArchivos(proyectoId, query) {
  proyectos.obtener(proyectoId);
  const consulta = leerListado(query, configListado);
  const { categoria } = consulta.filtros;
  const filtrados = subidasRepository
    .listar((subida) =>
      subida.proyectoId === proyectoId
      && subida.estado === 'completada'
      && (categoria === undefined || subida.categoria === categoria))
    .sort(consulta.comparador);
  return paginar(filtrados, consulta.pagina, consulta.limite);
}

export function solicitar(proyectoId, datos) {
  const proyecto = proyectos.obtenerConUso(proyectoId);
  if (proyecto.estado === 'archivado') {
    throw new ConflictError(`El proyecto ${proyecto.nombre} esta archivado y no admite archivos`, 'PROYECTO_ARCHIVADO');
  }

  const { nombreOriginal, extension } = analizarNombre(datos.nombre);
  const checksum = normalizarChecksum(datos.checksum);
  const tipoMime = datos.tipoMime.toLowerCase();

  const regla = EXTENSIONES[extension];
  if (!regla) {
    throw new UnsupportedMediaError(`La extension ${extension} no esta soportada`, 'TIPO_NO_SOPORTADO', [{ campo: 'nombre', mensaje: `extensiones permitidas: ${Object.keys(EXTENSIONES).join(', ')}` }]);
  }
  if (!regla.mimes.includes(tipoMime)) {
    throw new UnsupportedMediaError(`El tipo ${tipoMime} no corresponde a un archivo ${extension}`, 'MIME_NO_COINCIDE', [{ campo: 'tipoMime', mensaje: `tipos permitidos: ${regla.mimes.join(', ')}` }]);
  }

  const limite = LIMITES_POR_CATEGORIA[regla.categoria];
  if (datos.tamanoBytes > limite) {
    throw new PayloadTooLargeError(`Un archivo de categoria ${regla.categoria} no puede pasar de ${limite} bytes`, 'ARCHIVO_MUY_GRANDE', [{ campo: 'tamanoBytes', mensaje: `maximo ${limite} bytes` }]);
  }

  const repetido = subidasRepository.listar((subida) =>
    subida.proyectoId === proyectoId && subida.checksum === checksum && proyectos.vigente(subida));
  if (repetido.length) {
    throw new ConflictError(`Ese archivo ya existe en el proyecto como "${repetido[0].nombreOriginal}"`, 'ARCHIVO_DUPLICADO');
  }

  if (datos.tamanoBytes > proyecto.disponibleBytes) {
    throw new PayloadTooLargeError('El proyecto no tiene espacio suficiente para este archivo', 'CUOTA_EXCEDIDA', [{
      campo: 'tamanoBytes',
      mensaje: `disponible ${proyecto.disponibleBytes} bytes de ${proyecto.cuotaBytes}`,
    }]);
  }

  const nombreAlmacenado = `${randomUUID()}${extension}`;
  const ahora = Date.now();
  return subidasRepository.crear({
    proyectoId,
    nombreOriginal,
    nombreAlmacenado,
    categoria: regla.categoria,
    extension,
    tipoMime,
    tamanoBytes: datos.tamanoBytes,
    checksum,
    estado: 'pendiente',
    creadoEn: new Date(ahora).toISOString(),
    expiraEn: new Date(ahora + ttlSubidaSeg * 1000).toISOString(),
    confirmadoEn: null,
  });
}

export function confirmar(id, datos) {
  const subida = obtener(id);
  if (subida.estado === 'expirada') throw new GoneError('La subida expiro; solicita una nueva', 'SUBIDA_EXPIRADA');
  if (subida.estado === 'completada') throw new ConflictError('La subida ya fue confirmada', 'SUBIDA_YA_CONFIRMADA');

  if (datos.bytesRecibidos !== subida.tamanoBytes) {
    throw new UnprocessableError('La cantidad de bytes recibidos no coincide con lo declarado', 'SUBIDA_INCOMPLETA', [{
      campo: 'bytesRecibidos',
      mensaje: `se esperaban ${subida.tamanoBytes} y llegaron ${datos.bytesRecibidos}`,
    }]);
  }
  if (normalizarChecksum(datos.checksum) !== subida.checksum) {
    throw new UnprocessableError('El checksum recibido no coincide con el declarado', 'CHECKSUM_INVALIDO', [{ campo: 'checksum', mensaje: 'el archivo llego alterado' }]);
  }

  return subidasRepository.actualizar(id, { estado: 'completada', expiraEn: null, confirmadoEn: new Date().toISOString() });
}

export function eliminar(id) {
  const subida = obtener(id);
  subidasRepository.eliminar(id);
  return subida;
}
