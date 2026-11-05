import { procedimientosRepository } from '../repositories/procedimientos.repository.js';
import { ConflictError, NotFoundError, UnprocessableError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEnum } from '../validators/consulta.js';
import { ESTADOS, NOMBRES_MATERIALES, NOMBRES_PROCESOS } from '../constants/soldadura.js';
import { evaluar } from './calculos.service.js';

const configListado = {
  filtros: {
    proceso: filtroEnum(NOMBRES_PROCESOS),
    material: filtroEnum(NOMBRES_MATERIALES),
    estado: filtroEnum(ESTADOS),
  },
  ordenes: {
    id: (a, b) => a.id - b.id,
    calor: (a, b) => b.calorKjMm - a.calorKjMm,
    reciente: (a, b) => b.creadoEn.localeCompare(a.creadoEn) || b.id - a.id,
  },
  ordenPorDefecto: 'id',
};

export function obtener(id) {
  const procedimiento = procedimientosRepository.buscar(id);
  if (!procedimiento) throw new NotFoundError(`No existe el procedimiento ${id}`, 'PROCEDIMIENTO_NO_ENCONTRADO');
  return procedimiento;
}

export function listar(query) {
  const consulta = leerListado(query, configListado);
  const { proceso, material, estado } = consulta.filtros;
  const filtrados = procedimientosRepository
    .listar((item) =>
      (proceso === undefined || item.proceso === proceso)
      && (material === undefined || item.material === material)
      && (estado === undefined || item.estado === estado))
    .sort(consulta.comparador);
  return paginar(filtrados, consulta.pagina, consulta.limite);
}

export function crear(datos) {
  const { soldador, espesorMm, ...parametros } = datos;
  const resultado = evaluar(parametros);

  if (resultado.rangosFuera.length) {
    throw new UnprocessableError('Los parametros no corresponden al proceso elegido', 'RANGO_DE_PROCESO', resultado.rangosFuera);
  }
  if (!resultado.dentroDeLimite) {
    throw new UnprocessableError('El aporte de calor supera el limite del material', 'CALOR_EXCEDIDO', [{
      campo: 'amperaje',
      mensaje: `${resultado.calorKjMm} kJ/mm supera el limite de ${resultado.limiteKjMm} kJ/mm`,
    }]);
  }

  return procedimientosRepository.crear({
    ...parametros,
    espesorMm,
    calorKjMm: resultado.calorKjMm,
    clasificacion: resultado.clasificacion,
    soldador,
    estado: 'borrador',
    creadoEn: new Date().toISOString(),
  });
}

export function aprobar(id) {
  const procedimiento = obtener(id);
  if (procedimiento.estado === 'aprobado') {
    throw new ConflictError('El procedimiento ya esta aprobado', 'PROCEDIMIENTO_YA_APROBADO');
  }
  return procedimientosRepository.actualizar(id, { estado: 'aprobado' });
}
