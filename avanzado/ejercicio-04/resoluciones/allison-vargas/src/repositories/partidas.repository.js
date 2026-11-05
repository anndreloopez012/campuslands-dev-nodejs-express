export class RepositorioDePartidas {
  #partidas = new Map();
  #siguienteId = 1;

  guardar(partida) {
    this.#partidas.set(partida.id, partida);
    this.#siguienteId = Math.max(this.#siguienteId, partida.id + 1);
    return partida;
  }

  reservarId() {
    return this.#siguienteId++;
  }

  buscar(id) {
    return this.#partidas.get(id) ?? null;
  }

  listar(predicado = () => true) {
    return [...this.#partidas.values()].filter(predicado);
  }
}
