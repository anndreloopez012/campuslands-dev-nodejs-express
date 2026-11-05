import { citasRepository } from '../repositories/citas.repository.js';
import { tatuadoresRepository } from '../repositories/tatuadores.repository.js';
import { ConflictError, NotFoundError, ReferenciaError, ValidationError } from '../utils/errors.js';
import { paginar } from '../utils/paginacion.js';
import { leerListado, filtroEntero, filtroEnum } from '../validators/consulta.js';
import { ESTADOS, TRANSICIONES } from '../constants/citas.js';
import { config, minutosDe } from '../config/index.js';

const ordenes = {
  fecha: (a, b) => a.fecha.localeCompare(b.fecha) || a.hora.localeCompare(b.hora) || a.id - b.id,
  reciente: (a, b) => b.id - a.id,
};

const configListado = {
  filtros: {
    estado: filtroEnum(ESTADOS),
    tatuadorId: filtroEntero(1, 1000000000),
    fecha: (texto, error) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) {
        error('debe tener formato AAAA-MM-DD');
        return undefined;
      }
      return texto;
    },
  },
  ordenes,
  ordenPorDefecto: 'fecha',
};

const MS_POR_DIA = 24 * 60 * 60 * 1000;

const aHora = (minutos) => `${String(Math.floor(minutos / 60)).padStart(2, '0')}:${String(minutos % 60).padStart(2, '0')}`;

const invalido = (campo, mensaje, codigo) => new ValidationError('Datos invalidos', [{ campo, mensaje }], codigo);

function validarFecha(fecha) {
  const hoy = new Date().toISOString().slice(0, 10);
  if (fecha < hoy) throw invalido('fecha', 'no puede estar en el pasado', 'FECHA_PASADA');

  const dias = Math.round((Date.parse(`${fecha}T00:00:00Z`) - Date.parse(`${hoy}T00:00:00Z`)) / MS_POR_DIA);
  if (dias > config.estudio.diasAnticipacionMax) {
    throw invalido('fecha', `solo se agenda con hasta ${config.estudio.diasAnticipacionMax} dias de anticipacion`, 'FECHA_MUY_LEJANA');
  }

  const diaSemana = new Date(`${fecha}T00:00:00Z`).getUTCDay();
  if (config.estudio.diasCerrados.includes(diaSemana)) {
    throw invalido('fecha', 'el estudio esta cerrado ese dia de la semana', 'DIA_CERRADO');
  }
}

function validarHora(hora) {
  const { apertura, cierre, duracionSesionMin } = config.estudio;
  const inicio = minutosDe(hora);
  if (inicio < minutosDe(apertura) || inicio + duracionSesionMin > minutosDe(cierre)) {
    throw invalido('hora', `la sesion de ${duracionSesionMin} min debe empezar y terminar entre ${apertura} y ${cierre}`, 'HORARIO_FUERA_DE_RANGO');
  }
}

export function obtener(id) {
  const cita = citasRepository.buscar(id);
  if (!cita) throw new NotFoundError(`No existe la cita ${id}`, 'CITA_NO_ENCONTRADA');
  return cita;
}

export function listar(query) {
  const consulta = leerListado(query, configListado);
  const { estado, tatuadorId, fecha } = consulta.filtros;
  const filtradas = citasRepository
    .listar((cita) =>
      (estado === undefined || cita.estado === estado)
      && (tatuadorId === undefined || cita.tatuadorId === tatuadorId)
      && (fecha === undefined || cita.fecha === fecha))
    .sort(consulta.comparador);
  return paginar(filtradas, consulta.pagina, consulta.limite);
}

export function crear(datos) {
  const tatuador = tatuadoresRepository.buscar(datos.tatuadorId);
  if (!tatuador) throw new ReferenciaError('tatuadorId', `el tatuador ${datos.tatuadorId} no existe`);
  if (!tatuador.activo) throw new ConflictError(`${tatuador.nombre} no esta atendiendo por ahora`, 'TATUADOR_INACTIVO');

  validarFecha(datos.fecha);
  validarHora(datos.hora);

  const delDia = citasRepository.listar(
    (cita) => cita.tatuadorId === datos.tatuadorId && cita.fecha === datos.fecha && cita.estado !== 'cancelada',
  );
  if (delDia.length >= config.estudio.maxCitasPorDia) {
    throw new ConflictError(`${tatuador.nombre} ya tiene el maximo de ${config.estudio.maxCitasPorDia} citas ese dia`, 'DIA_COMPLETO');
  }

  const inicio = minutosDe(datos.hora);
  const choque = delDia.find((cita) => Math.abs(minutosDe(cita.hora) - inicio) < config.estudio.duracionSesionMin);
  if (choque) {
    throw new ConflictError(`Ese horario choca con otra cita de ${tatuador.nombre} a las ${choque.hora}`, 'HORARIO_OCUPADO');
  }

  return citasRepository.crear({
    ...datos,
    deposito: Math.round((datos.precioEstimado * config.estudio.depositoPorcentaje) / 100),
    estado: 'pendiente',
    creadoEn: new Date().toISOString(),
  });
}

export function cambiarEstado(id, { estado }) {
  const cita = obtener(id);
  if (!TRANSICIONES[cita.estado].includes(estado)) {
    throw new ConflictError(`No se puede pasar de ${cita.estado} a ${estado}`, 'TRANSICION_INVALIDA');
  }
  return citasRepository.actualizar(id, { estado });
}

export const horarios = (fecha, tatuadorId) => {
  validarFecha(fecha);
  const { apertura, cierre, duracionSesionMin } = config.estudio;
  const ocupadas = citasRepository
    .listar((cita) => cita.tatuadorId === tatuadorId && cita.fecha === fecha && cita.estado !== 'cancelada')
    .map((cita) => minutosDe(cita.hora));

  const libres = [];
  for (let inicio = minutosDe(apertura); inicio + duracionSesionMin <= minutosDe(cierre); inicio += duracionSesionMin) {
    if (!ocupadas.some((otra) => Math.abs(otra - inicio) < duracionSesionMin)) libres.push(aHora(inicio));
  }
  return { fecha, tatuadorId, duracionSesionMin, libres: ocupadas.length >= config.estudio.maxCitasPorDia ? [] : libres };
};
