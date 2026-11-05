import { SANCIONADOS } from '../constants/shooter.js';

export function crearAnticheatSimulado({ sancionados = SANCIONADOS } = {}) {
  return {
    tipo: 'simulado',
    async verificar(nick) {
      if (sancionados.includes(nick.toLowerCase())) {
        return { limpio: false, motivo: 'Cuenta sancionada por software no permitido' };
      }
      return { limpio: true };
    },
    async ping() {
      return true;
    },
  };
}
