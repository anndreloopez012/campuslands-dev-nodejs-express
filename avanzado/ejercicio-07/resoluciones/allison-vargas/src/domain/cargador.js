export class CacheAside {
  #cache;
  #enVuelo = new Map();
  #refrescos = new Set();
  #contadores = { cargas: 0, compartidas: 0, refrescos: 0, erroresDeCarga: 0, erroresDeRefresco: 0, descartadas: 0 };

  constructor({ cache }) {
    this.#cache = cache;
  }

  async #cargar(clave, cargar, { ttlMs, staleMs = 0, etiquetas = [], ttlAusenteMs = 0 }, guardar) {
    const marca = this.#cache.marca(clave, etiquetas);
    this.#contadores.cargas += 1;
    let valor;
    try {
      valor = await cargar();
    } catch (error) {
      this.#contadores.erroresDeCarga += 1;
      throw error;
    }
    const ausente = valor === undefined || valor === null;
    if (guardar && (!ausente || ttlAusenteMs > 0)) {
      if (this.#cache.cambio(marca, clave, etiquetas)) this.#contadores.descartadas += 1;
      else if (ausente) this.#cache.poner(clave, { ausente: true, valor: null }, { ttlMs: ttlAusenteMs, etiquetas });
      else this.#cache.poner(clave, { ausente: false, valor }, { ttlMs, staleMs, etiquetas });
    }
    return ausente ? null : valor;
  }

  #compartir(clave, promesa) {
    this.#enVuelo.set(clave, promesa);
    const limpiar = () => {
      if (this.#enVuelo.get(clave) === promesa) this.#enVuelo.delete(clave);
    };
    promesa.then(limpiar, limpiar);
    return promesa;
  }

  #refrescarEnSegundoPlano(clave, cargar, opciones) {
    if (this.#enVuelo.has(clave)) return;
    this.#contadores.refrescos += 1;
    const promesa = this.#compartir(clave, this.#cargar(clave, cargar, opciones, true));
    const seguimiento = promesa
      .catch(() => {
        this.#contadores.erroresDeRefresco += 1;
      })
      .finally(() => this.#refrescos.delete(seguimiento));
    this.#refrescos.add(seguimiento);
  }

  async obtener(clave, cargar, opciones, modo = 'normal') {
    if (modo === 'omitir') {
      const valor = await this.#cargar(clave, cargar, opciones, false);
      return { valor, ausente: valor === null, estado: 'BYPASS', restanteMs: null };
    }
    if (modo === 'normal') {
      const encontrada = this.#cache.consultar(clave);
      if (encontrada) {
        const { ausente, valor } = encontrada.valor;
        if (encontrada.obsoleto) this.#refrescarEnSegundoPlano(clave, cargar, opciones);
        return { valor, ausente, estado: encontrada.obsoleto ? 'STALE' : 'HIT', restanteMs: encontrada.restanteMs };
      }
    }
    const compartida = this.#enVuelo.get(clave);
    if (compartida) {
      this.#contadores.compartidas += 1;
      const valor = await compartida;
      return { valor, ausente: valor === null, estado: 'COALESCED', restanteMs: this.#cache.espiar(clave)?.restanteMs ?? null };
    }
    const valor = await this.#compartir(clave, this.#cargar(clave, cargar, opciones, true));
    return {
      valor,
      ausente: valor === null,
      estado: modo === 'refrescar' ? 'REFRESH' : 'MISS',
      restanteMs: this.#cache.espiar(clave)?.restanteMs ?? null,
    };
  }

  async esperarRefrescos() {
    await Promise.all([...this.#refrescos]);
  }

  estadisticas() {
    return { ...this.#contadores, enVuelo: this.#enVuelo.size };
  }
}
