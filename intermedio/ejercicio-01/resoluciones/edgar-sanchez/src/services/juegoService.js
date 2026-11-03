import { repositorioJuegos } from "../data/juegoRepository.js";

export const servicioJuegos = {
  async listarTodos() {
    return repositorioJuegos.obtenerTodos();
  },
  async obtenerPorId(identificador) {
    return repositorioJuegos.obtenerPorId(identificador);
  },
  async crear(datosJuego) {
    if (!datosJuego?.nombre || !datosJuego?.genero) {
      throw new Error("nombre y genero son obligatorios");
    }
    return repositorioJuegos.crear(datosJuego);
  },
  async actualizar(identificador, datosJuego) {
    return repositorioJuegos.actualizar(identificador, datosJuego);
  },
  async eliminar(identificador) {
    return repositorioJuegos.eliminar(identificador);
  }
};
