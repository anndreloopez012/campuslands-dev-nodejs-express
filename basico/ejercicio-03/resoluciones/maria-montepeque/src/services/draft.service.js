function evaluatePlayer(winRateArg, gamesArg) {
    const winRate = Number(winRateArg);
    const games = Number(gamesArg);

    if (!Number.isFinite(winRate) || winRate < 0 || winRate > 100) {
        throw new Error("El winrate debe ser un numero entre 0 y 100");
    }
    if (!Number.isFinite(games) || games < 0) {
        throw new Error("La cantidad de partidas debe ser un numero mayor o igual a 0");
    }

    let tier = "C";
    if (games >= 50 && winRate >= 60) tier = "S";
    else if (games >= 20 && winRate >= 50) tier = "A";
    else if (games >= 10 && winRate >= 40) tier = "B";

    return { winRate, games, tier };
}

module.exports = { evaluatePlayer };