import { crear } from '../errores/index.js';
import { terminar } from '../validators/comunes.js';
import { normalizarReporteCsp, validarPedido, validarResena } from '../validators/entradas.js';

const MAX_REPORTES = 50;

export function crearServicioPuestos({ puestos: base, reloj }) {
  const puestos = structuredClone(base);
  const resenas = new Map(puestos.map((p) => [p.id, []]));
  const pedidos = new Map();
  let reportes = [];
  let siguientePedido = 1;

  function puesto(id) {
    const encontrado = puestos.find((p) => p.id === id);
    if (!encontrado) throw crear('PUESTO_NO_ENCONTRADO', { puestoId: id });
    return encontrado;
  }

  return {
    listar: () => puestos.map(({ platos, ...resto }) => ({ ...resto, platos: platos.length })),
    obtener: (id) => structuredClone(puesto(id)),
    resenas: (id) => [...(resenas.get(puesto(id).id))],

    agregarResena(id, cuerpo) {
      puesto(id);
      const resena = { ...validarResena(cuerpo), creadaEn: reloj().toISOString() };
      resenas.get(id).push(resena);
      return resena;
    },

    crearPedido(cuerpo) {
      const { puestoId, items } = validarPedido(cuerpo);
      const elegido = puesto(puestoId);
      const errores = [];
      const lineas = items.map(({ platoId, cantidad }, i) => {
        const plato = elegido.platos.find((p) => p.id === platoId);
        if (!plato) {
          errores.push({ campo: `items[${i}].platoId`, mensaje: `el puesto no vende el plato ${platoId}` });
          return null;
        }
        return {
          platoId, nombre: plato.nombre, cantidad, subtotal: plato.precio * cantidad,
        };
      });
      terminar(errores);
      const pedido = {
        id: siguientePedido,
        puestoId,
        lineas,
        total: lineas.reduce((t, l) => t + l.subtotal, 0),
        creadoEn: reloj().toISOString(),
      };
      siguientePedido += 1;
      pedidos.set(pedido.id, pedido);
      return pedido;
    },

    obtenerPedido(id) {
      const pedido = pedidos.get(id);
      if (!pedido) throw crear('PEDIDO_NO_ENCONTRADO', { pedidoId: id });
      return pedido;
    },

    registrarReportesCsp(cuerpo, agente) {
      const nuevos = normalizarReporteCsp(cuerpo).map((r) => ({ ...r, agente, recibidoEn: reloj().toISOString() }));
      reportes = [...reportes, ...nuevos].slice(-MAX_REPORTES);
      return nuevos.length;
    },

    reportesCsp: () => [...reportes].reverse(),
  };
}
