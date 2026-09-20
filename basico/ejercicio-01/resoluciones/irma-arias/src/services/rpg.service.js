class RpgService {
  obtenerEstadoServidor() {
    return {
      ok: true,
      message: "Ejercicio ejecutado correctamente",
      topic: "Node runtime y consola",
      juego: "RPG Backend Quest"
    };
  }
}

module.exports = new RpgService();