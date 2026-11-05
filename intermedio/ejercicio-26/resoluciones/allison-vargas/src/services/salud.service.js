export function crearSaludService({ anticheat, notificador }) {
  async function estado() {
    let estadoAnticheat = 'operativo';
    try {
      await anticheat.ping();
    } catch {
      estadoAnticheat = 'caido';
    }
    return {
      ok: estadoAnticheat === 'operativo',
      anticheat: { tipo: anticheat.tipo, estado: estadoAnticheat },
      notificador: { destinos: notificador.destinos },
    };
  }

  return { estado };
}
