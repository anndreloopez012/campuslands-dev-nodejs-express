import { crear } from '../errores/index.js';
import { validarPlano, validarProyecto } from '../validators/webhooks.js';

// cada cambio importante del dominio emite un evento; el despachador decide a quien avisar
export function crearServicioProyectos({ despachador, reloj }) {
  const proyectos = new Map();
  let siguienteId = 1;

  function proyecto(id) {
    const encontrado = proyectos.get(id);
    if (!encontrado) throw crear('PROYECTO_NO_ENCONTRADO', { proyectoId: id });
    return encontrado;
  }

  return {
    listar: () => [...proyectos.values()],
    obtener: (id) => proyecto(id),

    crear(cuerpo) {
      const nuevo = {
        id: siguienteId, ...validarProyecto(cuerpo), estado: 'en_diseno', planos: [], creadoEn: reloj().toISOString(),
      };
      siguienteId += 1;
      proyectos.set(nuevo.id, nuevo);
      const { evento } = despachador.emitir('proyecto.creado', { proyecto: { id: nuevo.id, nombre: nuevo.nombre, tipo: nuevo.tipo } });
      return { proyecto: nuevo, eventoId: evento.id };
    },

    publicarPlano(id, cuerpo) {
      const actual = proyecto(id);
      const plano = { numero: actual.planos.length + 1, ...validarPlano(cuerpo), publicadoEn: reloj().toISOString() };
      actual.planos.push(plano);
      const { evento } = despachador.emitir('plano.publicado', { proyectoId: id, plano });
      return { plano, eventoId: evento.id };
    },

    aprobar(id) {
      const actual = proyecto(id);
      if (actual.estado === 'aprobado') throw crear('PROYECTO_YA_APROBADO', { proyectoId: id });
      actual.estado = 'aprobado';
      const { evento } = despachador.emitir('proyecto.aprobado', { proyectoId: id, planos: actual.planos.length });
      return { proyecto: actual, eventoId: evento.id };
    },
  };
}
