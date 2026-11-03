import config from "../config.js";

// avisa a otro sistema (un bot de discord por ejemplo) que se armo una partida
// si falla solo dejo un aviso, la partida igual se arma
async function notificarPartida(partida) {
    if (!config.notificarUrl) return false;

    try {
        const respuesta = await fetch(config.notificarUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ evento: "partida_creada", partida }),
            signal: AbortSignal.timeout(2000)
        });

        if (!respuesta.ok) {
            console.warn(`No se pudo notificar la partida ${partida.id}: respondio ${respuesta.status}`);
            return false;
        }
        return true;
    } catch (error) {
        console.warn(`No se pudo notificar la partida ${partida.id}: ${error.message}`);
        return false;
    }
}

export { notificarPartida };
