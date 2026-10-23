export const getMatchStats = (gameMode) => {
  if (gameMode && gameMode.toLowerCase() !== 'ranked' && gameMode.toLowerCase() !== 'casual') {
    throw new Error("Modo de juego inválido. Usa 'ranked' o 'casual'.");
  }

  return {
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "npm scripts y package.json",
    data: {
      game: "Valorant / CS:GO Competitive",
      mode: gameMode || "ranked",
      stats: {
        kills: 24,
        deaths: 12,
        assists: 8,
        kdRatio: 2.0,
        mvpCount: 4,
        result: "Victory"
      }
    }
  };
};