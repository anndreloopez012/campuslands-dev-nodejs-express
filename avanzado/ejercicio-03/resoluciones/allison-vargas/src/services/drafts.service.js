import { NotFoundError, UnprocessableError } from '../utils/errors.js';
import { formatearRuta } from '../schemas/index.js';
import { LADOS } from '../constants/moba.js';

const porId = (a, b) => a.id - b.id;

const referencia = (segmentos, mensaje) => ({
  en: 'cuerpo',
  ruta: formatearRuta(segmentos),
  codigo: 'referencia_invalida',
  mensaje,
});

function resumir(acciones) {
  const resumen = { baneos: { azul: [], rojo: [] }, picks: { azul: [], rojo: [] } };
  for (const accion of acciones) {
    if (accion.tipo === 'ban') resumen.baneos[accion.equipo].push(accion.heroe);
    else resumen.picks[accion.equipo].push({ heroe: accion.heroe, jugador: accion.jugador });
  }
  return resumen;
}

export function crearDraftsService({ repositorio, heroes, equipos, reloj }) {
  function obtener(id) {
    const draft = repositorio.buscar(id);
    if (!draft) throw new NotFoundError(`No existe el draft ${id}`, 'DRAFT_NO_ENCONTRADO');
    return draft;
  }

  function listar({ equipoId } = {}, comparador = porId) {
    return repositorio
      .listar((d) => equipoId === undefined || d.azul === equipoId || d.rojo === equipoId)
      .sort(comparador);
  }

  function crear(datos) {
    const errores = [];
    const plantillas = {};

    for (const lado of LADOS) {
      const equipo = equipos.buscar(datos[lado]);
      if (equipo) plantillas[lado] = equipo;
      else errores.push(referencia([lado], `No existe el equipo ${datos[lado]}`));
    }

    datos.acciones.forEach((accion, indice) => {
      if (!heroes.buscar(accion.heroe)) {
        errores.push(referencia(['acciones', indice, 'heroe'], `No existe el heroe ${accion.heroe}`));
      }
      if (accion.tipo === 'pick' && plantillas[accion.equipo]) {
        const pertenece = plantillas[accion.equipo].jugadores
          .some((jugador) => jugador.nick.toLowerCase() === accion.jugador.toLowerCase());
        if (!pertenece) {
          errores.push(referencia(
            ['acciones', indice, 'jugador'],
            `${accion.jugador} no pertenece al equipo ${accion.equipo}`,
          ));
        }
      }
    });

    if (errores.length) {
      throw new UnprocessableError('Hay referencias que no existen', 'REFERENCIA_INVALIDA', errores);
    }

    return repositorio.crear({
      ...datos,
      estado: 'borrador',
      resumen: resumir(datos.acciones),
      creadoEn: reloj().toISOString(),
    });
  }

  return { obtener, listar, crear, contar: () => repositorio.listar().length };
}
