class SesionesRepository {
  #sesiones = new Map();

  crear(sesion) {
    this.#sesiones.set(sesion.huella, sesion);
    return { ...sesion };
  }

  buscar(huella) {
    const sesion = this.#sesiones.get(huella);
    return sesion ? { ...sesion } : null;
  }

  eliminar(huella) {
    return this.#sesiones.delete(huella);
  }

  eliminarDeUsuario(usuarioId, excepto) {
    let cerradas = 0;
    for (const [huella, sesion] of this.#sesiones) {
      if (sesion.usuarioId === usuarioId && huella !== excepto) {
        this.#sesiones.delete(huella);
        cerradas += 1;
      }
    }
    return cerradas;
  }

  purgarVencidas(limite) {
    for (const [huella, sesion] of this.#sesiones) {
      if (sesion.expiraEn <= limite) this.#sesiones.delete(huella);
    }
  }
}

export const sesionesRepository = new SesionesRepository();
