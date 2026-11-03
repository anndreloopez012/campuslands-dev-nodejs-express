import config from "../config.js";
import AppError from "../utils/app-error.js";

// habla con la API externa de estadisticas usando el fetch global
// en los tests no hay API externa: se reemplaza globalThis.fetch con un mock
async function pedirStats(gamertag) {
    const url = `${config.proveedorUrl}/stats/${encodeURIComponent(gamertag)}`;
    let respuesta;

    try {
        // si el proveedor tarda mucho corto la peticion
        respuesta = await fetch(url, { signal: AbortSignal.timeout(config.proveedorTimeoutMs) });
    } catch (error) {
        if (error.name === "TimeoutError") {
            throw new AppError(504, "El proveedor de estadisticas tardo demasiado");
        }
        throw new AppError(502, "No se pudo conectar con el proveedor de estadisticas");
    }

    if (respuesta.status === 404) {
        throw new AppError(404, `No existe el jugador ${gamertag}`);
    }
    if (!respuesta.ok) {
        throw new AppError(502, `El proveedor de estadisticas respondio ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    // no confio en lo que llega de afuera, reviso que traiga lo que uso
    const { kills, muertes, victorias, partidas } = datos;
    const numeros = [kills, muertes, victorias, partidas];
    if (!numeros.every((n) => Number.isInteger(n) && n >= 0) || victorias > partidas) {
        throw new AppError(502, "El proveedor de estadisticas mando datos raros");
    }

    return { gamertag, kills, muertes, victorias, partidas };
}

export { pedirStats };
