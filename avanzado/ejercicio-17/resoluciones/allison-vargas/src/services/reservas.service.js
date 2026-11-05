import { crear } from '../errores/index.js';
import { validarReserva } from '../validators/auth.js';

export function crearServicioReservas({ destinos: base, reloj }) {
  const destinos = structuredClone(base);
  const reservas = new Map();
  let siguienteId = 1;

  function destino(id) {
    const encontrado = destinos.find((d) => d.id === id);
    if (!encontrado) throw crear('DESTINO_NO_ENCONTRADO', { destinoId: id });
    return encontrado;
  }

  const ocupados = (destinoId) => [...reservas.values()]
    .filter((r) => r.destinoId === destinoId && r.estado === 'confirmada')
    .reduce((t, r) => t + r.personas, 0);

  return {
    destinos: () => destinos.map((d) => ({ ...d, disponibles: d.cupos - ocupados(d.id) })),

    listar: (usuario) => [...reservas.values()].filter((r) => usuario.rol === 'admin' || r.usuarioId === usuario.id),

    crear(usuario, cuerpo) {
      const datos = validarReserva(cuerpo, reloj().toISOString().slice(0, 10));
      const elegido = destino(datos.destinoId);
      const disponibles = elegido.cupos - ocupados(elegido.id);
      if (datos.personas > disponibles) throw crear('CUPOS_INSUFICIENTES', { disponibles, destino: elegido.nombre });
      const reserva = {
        id: siguienteId,
        usuarioId: usuario.id,
        ...datos,
        total: elegido.precio * datos.personas,
        estado: 'confirmada',
        creadaEn: reloj().toISOString(),
      };
      siguienteId += 1;
      reservas.set(reserva.id, reserva);
      return reserva;
    },

    cancelar(usuario, id) {
      const reserva = reservas.get(id);
      if (!reserva) throw crear('RESERVA_NO_ENCONTRADA', { reservaId: id });
      if (reserva.usuarioId !== usuario.id && usuario.rol !== 'admin') throw crear('PROHIBIDO');
      reserva.estado = 'cancelada';
      return reserva;
    },
  };
}
