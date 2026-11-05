export class Records {
  #records = new Map();

  constructor(circuitos) {
    for (const c of circuitos) {
      this.#records.set(c.id, { circuitoId: c.id, tiempoMs: c.recordMs, piloto: null, auto: null, sesionId: null, vuelta: null });
    }
  }

  actual(circuitoId) {
    const registro = this.#records.get(circuitoId);
    return registro ? { ...registro } : null;
  }

  superar(circuitoId, { tiempoMs, piloto, auto, sesionId, vuelta }) {
    const anterior = this.#records.get(circuitoId);
    this.#records.set(circuitoId, { circuitoId, tiempoMs, piloto, auto, sesionId, vuelta });
    return anterior.tiempoMs;
  }

  todos() {
    return [...this.#records.values()].map((r) => ({ ...r }));
  }
}
