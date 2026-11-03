import { servicioJuegos } from "../services/juegoService.js";

export const controladorJuegos = {
  async listar(peticion, respuesta, siguiente) {
    try {
      const juegos = await servicioJuegos.listarTodos();
      respuesta.json({ ok: true, data: juegos });
    } catch (error) {
      siguiente(error);
    }
  },
  async obtenerPorId(peticion, respuesta, siguiente) {
    try {
      const juego = await servicioJuegos.obtenerPorId(peticion.params.id);
      if (!juego) return respuesta.status(404).json({ ok: false, message: "juego no encontrado" });
      respuesta.json({ ok: true, data: juego });
    } catch (error) {
      siguiente(error);
    }
  },
  async crear(peticion, respuesta, siguiente) {
    try {
      const juegoCreado = await servicioJuegos.crear(peticion.body);
      respuesta.status(201).json({ ok: true, data: juegoCreado });
    } catch (error) {
      siguiente(error);
    }
  },
  async actualizar(peticion, respuesta, siguiente) {
    try {
      const juegoActualizado = await servicioJuegos.actualizar(peticion.params.id, peticion.body);
      if (!juegoActualizado) return respuesta.status(404).json({ ok: false, message: "juego no encontrado" });
      respuesta.json({ ok: true, data: juegoActualizado });
    } catch (error) {
      siguiente(error);
    }
  },
  async eliminar(peticion, respuesta, siguiente) {
    try {
      const eliminado = await servicioJuegos.eliminar(peticion.params.id);
      if (!eliminado) return respuesta.status(404).json({ ok: false, message: "juego no encontrado" });
      respuesta.json({ ok: true, message: "juego eliminado" });
    } catch (error) {
      siguiente(error);
    }
  }
};
