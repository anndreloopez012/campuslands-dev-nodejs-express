// Función auxiliar que simula un retraso en la red o base de datos (Ej: 2 segundos)
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const simulateMatch = async (player1, player2) => {
    // 1. Simulamos que el servidor está "pensando" o calculando estadísticas
    await delay(2500); 

    // 2. Lógica sencilla: Elegimos un ganador al azar
    const random = Math.random();
    const winner = random > 0.5 ? player1 : player2;
    const loser = random > 0.5 ? player2 : player1;

    // 3. Devolvemos el resultado simulado
    return {
        match: `${player1} vs ${player2}`,
        winner: winner,
        loser: loser,
        score: "11-8",
        durationSimulated: "2.5 segundos"
    };
};