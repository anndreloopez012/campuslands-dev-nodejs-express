import { randomUUID } from 'node:crypto';

// pasarela de pago simulada: tarda un poco y devuelve un id de transaccion
export function crearPasarelaSimulada({ demoraMs = 150 } = {}) {
  const cobros = [];
  return {
    cobros,
    cobrar({ monto, referencia }) {
      return new Promise((resolver) => {
        setTimeout(() => {
          const transaccion = { id: `tx_${randomUUID()}`, monto, referencia };
          cobros.push(transaccion);
          resolver(transaccion);
        }, demoraMs);
      });
    },
  };
}
