const ejecutarEjercicio = () => {
    // Log temático de shooter competitivo
    console.log("[Server] 🎯 Jugador conectado. Configurando el loadout...");

    return {
        ok: true,
        message: "Ejercicio ejecutado correctamente",
        topic: "npm scripts y package.json",
        shooter_context: {
            mode: "Ranked",
            map: "Dust_Arena",
            status: "Esperando jugadores..."
        }
    };
};

module.exports = {
    ejecutarEjercicio
};