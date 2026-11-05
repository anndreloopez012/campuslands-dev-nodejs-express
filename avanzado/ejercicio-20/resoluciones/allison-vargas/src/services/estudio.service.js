import { crear } from '../errores/index.js';
import { validarComision, validarEstado, validarPago } from '../validators/estudio.js';

const SIGUIENTE = { pagada: 'en_progreso', en_progreso: 'entregada' };

// cola por clave: dos operaciones sobre la misma comision nunca corren a la vez
export function crearCandados() {
  const colas = new Map();
  return async (clave, tarea) => {
    const anterior = colas.get(clave) ?? Promise.resolve();
    const actual = anterior.then(tarea, tarea);
    const cola = actual.catch(() => {});
    colas.set(clave, cola);
    try {
      return await actual;
    } finally {
      if (colas.get(clave) === cola) colas.delete(clave);
    }
  };
}

export function crearServicioEstudio({ artistas, reloj, pasarela }) {
  const comisiones = new Map();
  const pagos = [];
  const candado = crearCandados();
  let siguienteComision = 1;
  let siguientePago = 1;

  function comision(id) {
    const encontrada = comisiones.get(id);
    if (!encontrada) throw crear('COMISION_NO_ENCONTRADA', { comisionId: id });
    return encontrada;
  }

  return {
    artistas: () => artistas,

    crearComision(cliente, cuerpo) {
      const datos = validarComision(cuerpo);
      const artista = artistas.find((a) => a.id === datos.artistaId);
      if (!artista) throw crear('ARTISTA_NO_ENCONTRADO', { artistaId: datos.artistaId });
      let precio = artista.tarifas[datos.tipo];
      if (datos.resolucion === '4k') precio = Math.round(precio * 1.3);
      if (datos.urgente) precio = Math.round(precio * 1.5);
      const nueva = {
        id: siguienteComision, cliente, ...datos, precio, saldo: precio, estado: 'pendiente_pago', creadaEn: reloj().toISOString(),
      };
      siguienteComision += 1;
      comisiones.set(nueva.id, nueva);
      return { ...nueva };
    },

    obtenerComision: (id) => ({ ...comision(id) }),

    listarComisiones: (cliente) => [...comisiones.values()].filter((c) => c.cliente === cliente),

    async pagar(cliente, cuerpo) {
      const { comisionId, monto } = validarPago(cuerpo);
      comision(comisionId);
      return candado(comisionId, async () => {
        const actual = comision(comisionId);
        if (monto > actual.saldo) throw crear('PAGO_EXCEDE_SALDO', { saldo: actual.saldo });
        let transaccion;
        try {
          transaccion = await pasarela.cobrar({ monto, referencia: `comision-${comisionId}` });
        } catch (error) {
          throw crear('PASARELA_NO_DISPONIBLE', {}, { causa: error });
        }
        actual.saldo -= monto;
        if (actual.saldo === 0) actual.estado = 'pagada';
        const pago = {
          id: siguientePago, comisionId, cliente, monto, transaccionId: transaccion.id, creadoEn: reloj().toISOString(),
        };
        siguientePago += 1;
        pagos.push(pago);
        return { pago, comision: { ...actual } };
      });
    },

    listarPagos: (comisionId) => pagos.filter((p) => comisionId === undefined || p.comisionId === comisionId),

    // PUT es idempotente por naturaleza: pedir el mismo estado otra vez no cambia nada
    cambiarEstado(id, cuerpo) {
      const { estado } = validarEstado(cuerpo);
      const actual = comision(id);
      if (actual.estado === estado) return { comision: { ...actual }, cambio: false };
      if (SIGUIENTE[actual.estado] !== estado) throw crear('TRANSICION_INVALIDA', { desde: actual.estado, hacia: estado });
      actual.estado = estado;
      return { comision: { ...actual }, cambio: true };
    },
  };
}
