const claveVersion = (clave) => `@clave:${clave}`;

export class Cache {
  #entradas = new Map();
  #indice = new Map();
  #versiones = new Map();
  #versionGlobal = 0;
  #reloj;
  #capacidad;
  #contadores = {
    aciertos: 0,
    obsoletos: 0,
    fallos: 0,
    escrituras: 0,
    expiradas: 0,
    desalojadas: 0,
    invalidadas: 0,
  };

  constructor({ reloj = () => new Date(), capacidad = 100 } = {}) {
    if (!Number.isInteger(capacidad) || capacidad < 1) throw new RangeError('capacidad debe ser un entero positivo');
    this.#reloj = reloj;
    this.#capacidad = capacidad;
  }

  #ahora() {
    return this.#reloj().getTime();
  }

  #quitar(clave) {
    const entrada = this.#entradas.get(clave);
    if (!entrada) return false;
    this.#entradas.delete(clave);
    for (const etiqueta of entrada.etiquetas) {
      const claves = this.#indice.get(etiqueta);
      claves.delete(clave);
      if (claves.size === 0) this.#indice.delete(etiqueta);
    }
    return true;
  }

  #subir(clave) {
    if (!clave) return;
    this.#versiones.set(clave, (this.#versiones.get(clave) ?? 0) + 1);
  }

  #vista(clave, entrada, ahora) {
    return {
      clave,
      valor: entrada.valor,
      obsoleto: ahora >= entrada.venceMs,
      restanteMs: Math.max(0, entrada.venceMs - ahora),
      edadMs: ahora - entrada.creadaMs,
      etiquetas: [...entrada.etiquetas].sort(),
      aciertos: entrada.aciertos,
    };
  }

  marca(clave, etiquetas = []) {
    return [this.#versionGlobal, ...[claveVersion(clave), ...etiquetas].map((v) => this.#versiones.get(v) ?? 0)].join('.');
  }

  cambio(marca, clave, etiquetas = []) {
    return this.marca(clave, etiquetas) !== marca;
  }

  poner(clave, valor, { ttlMs, staleMs = 0, etiquetas = [] } = {}) {
    if (!Number.isInteger(ttlMs) || ttlMs < 1) throw new RangeError('ttlMs debe ser un entero positivo');
    if (!Number.isInteger(staleMs) || staleMs < 0) throw new RangeError('staleMs no puede ser negativo');
    const ahora = this.#ahora();
    this.#quitar(clave);
    this.purgar();
    while (this.#entradas.size >= this.#capacidad) {
      const [masAntigua] = this.#entradas.keys();
      this.#quitar(masAntigua);
      this.#contadores.desalojadas += 1;
    }
    const conjunto = new Set(etiquetas);
    this.#entradas.set(clave, {
      valor,
      creadaMs: ahora,
      venceMs: ahora + ttlMs,
      caducaMs: ahora + ttlMs + staleMs,
      etiquetas: conjunto,
      aciertos: 0,
    });
    for (const etiqueta of conjunto) {
      if (!this.#indice.has(etiqueta)) this.#indice.set(etiqueta, new Set());
      this.#indice.get(etiqueta).add(clave);
    }
    this.#contadores.escrituras += 1;
  }

  consultar(clave) {
    const ahora = this.#ahora();
    const entrada = this.#entradas.get(clave);
    if (!entrada) {
      this.#contadores.fallos += 1;
      return null;
    }
    if (ahora >= entrada.caducaMs) {
      this.#quitar(clave);
      this.#contadores.expiradas += 1;
      this.#contadores.fallos += 1;
      return null;
    }
    this.#entradas.delete(clave);
    this.#entradas.set(clave, entrada);
    entrada.aciertos += 1;
    const vista = this.#vista(clave, entrada, ahora);
    if (vista.obsoleto) this.#contadores.obsoletos += 1;
    else this.#contadores.aciertos += 1;
    return vista;
  }

  espiar(clave) {
    const ahora = this.#ahora();
    const entrada = this.#entradas.get(clave);
    if (!entrada || ahora >= entrada.caducaMs) return null;
    return this.#vista(clave, entrada, ahora);
  }

  borrar(clave) {
    this.#subir(claveVersion(clave));
    const existia = this.#quitar(clave);
    if (existia) this.#contadores.invalidadas += 1;
    return existia;
  }

  invalidarEtiqueta(etiqueta) {
    this.#subir(etiqueta);
    const claves = [...(this.#indice.get(etiqueta) ?? [])];
    for (const clave of claves) this.#quitar(clave);
    this.#contadores.invalidadas += claves.length;
    return claves.length;
  }

  vaciar() {
    const total = this.#entradas.size;
    this.#entradas.clear();
    this.#indice.clear();
    this.#versionGlobal += 1;
    this.#contadores.invalidadas += total;
    return total;
  }

  purgar() {
    const ahora = this.#ahora();
    let quitadas = 0;
    for (const [clave, entrada] of [...this.#entradas]) {
      if (ahora >= entrada.caducaMs) {
        this.#quitar(clave);
        quitadas += 1;
      }
    }
    this.#contadores.expiradas += quitadas;
    return quitadas;
  }

  claves({ etiqueta, prefijo } = {}) {
    const ahora = this.#ahora();
    return [...this.#entradas]
      .filter(([clave, entrada]) => ahora < entrada.caducaMs
        && (!etiqueta || entrada.etiquetas.has(etiqueta))
        && (!prefijo || clave.startsWith(prefijo)))
      .map(([clave, entrada]) => {
        const { valor, ...resto } = this.#vista(clave, entrada, ahora);
        return resto;
      });
  }

  estadisticas() {
    const consultas = this.#contadores.aciertos + this.#contadores.obsoletos + this.#contadores.fallos;
    return {
      entradas: this.#entradas.size,
      capacidad: this.#capacidad,
      ...this.#contadores,
      consultas,
      tasaDeAcierto: consultas === 0 ? null : Number(((this.#contadores.aciertos + this.#contadores.obsoletos) / consultas).toFixed(4)),
    };
  }
}
