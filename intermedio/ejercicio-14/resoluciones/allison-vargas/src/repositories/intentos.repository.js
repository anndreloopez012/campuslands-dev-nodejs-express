class IntentosRepository {
  #registros = new Map();

  segundosDeBloqueo(email, ahora) {
    const registro = this.#registros.get(email);
    if (!registro || registro.bloqueadoHasta <= ahora) return 0;
    return Math.ceil((registro.bloqueadoHasta - ahora) / 1000);
  }

  registrarFallo(email, ahora, { maxIntentos, bloqueoSegundos }) {
    this.#limpiarVencidos(ahora);
    const previo = this.#registros.get(email);
    const vigente = previo && previo.bloqueadoHasta === 0;
    const fallos = (vigente ? previo.fallos : 0) + 1;
    const bloqueadoHasta = fallos >= maxIntentos ? ahora + bloqueoSegundos * 1000 : 0;
    this.#registros.set(email, { fallos, bloqueadoHasta, ultimo: ahora });
    return { fallos, bloqueado: bloqueadoHasta > 0 };
  }

  limpiar(email) {
    this.#registros.delete(email);
  }

  #limpiarVencidos(ahora) {
    if (this.#registros.size < 500) return;
    for (const [email, registro] of this.#registros) {
      const caducado = registro.bloqueadoHasta > 0 ? registro.bloqueadoHasta <= ahora : ahora - registro.ultimo > 600000;
      if (caducado) this.#registros.delete(email);
    }
  }
}

export const intentosRepository = new IntentosRepository();
