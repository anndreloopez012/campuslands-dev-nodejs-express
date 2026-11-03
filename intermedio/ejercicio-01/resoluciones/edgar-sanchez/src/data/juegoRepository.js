const juegosEnMemoria = [
  { id: "1", nombre: "Chrono Quest", genero: "RPG", plataforma: "PC" }
];

let contadorIdentificador = 2;

export const repositorioJuegos = {
  async obtenerTodos() {
    return [...juegosEnMemoria];
  },
  async obtenerPorId(identificador) {
    return juegosEnMemoria.find((juego) => juego.id === identificador) || null;
  },
  async crear(datosJuego) {
    const nuevoJuego = { id: String(contadorIdentificador++), ...datosJuego };
    juegosEnMemoria.push(nuevoJuego);
    return nuevoJuego;
  },
  async actualizar(identificador, datosJuego) {
    const indice = juegosEnMemoria.findIndex((juego) => juego.id === identificador);
    if (indice === -1) return null;
    juegosEnMemoria[indice] = { ...juegosEnMemoria[indice], ...datosJuego };
    return juegosEnMemoria[indice];
  },
  async eliminar(identificador) {
    const indice = juegosEnMemoria.findIndex((juego) => juego.id === identificador);
    if (indice === -1) return false;
    juegosEnMemoria.splice(indice, 1);
    return true;
  }
};
