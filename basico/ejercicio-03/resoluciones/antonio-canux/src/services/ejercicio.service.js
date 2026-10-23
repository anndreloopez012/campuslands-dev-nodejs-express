// Función privada del módulo (no se exporta)
const calcularKDA = (kills, deaths, assists) => {
    return deaths === 0 ? (kills + assists) : ((kills + assists) / deaths).toFixed(2);
};

// Funciones que sí exportaremos
const obtenerEstadoPartida = () => {
    return "Fase de líneas terminada, transicionando a mid-game para pelear el dragón.";
};

const obtenerMVP = () => {
    return {
        jugador: "Faker",
        rol: "Mid Laner",
        kda_ratio: calcularKDA(10, 0, 5)
    };
};

const ejecutarEjercicio = () => {
    console.log("[MOBA Server] ⚔️ Obteniendo telemetría de la partida usando CommonJS...");

    return {
        ok: true,
        message: "Ejercicio ejecutado correctamente",
        topic: "modulos CommonJS",
        moba_context: {
            fase_actual: obtenerEstadoPartida(),
            jugador_destacado: obtenerMVP()
        }
    };
};

// Uso clásico de CommonJS para exportar múltiples elementos
module.exports = {
    ejecutarEjercicio,
    obtenerEstadoPartida,
    obtenerMVP
};