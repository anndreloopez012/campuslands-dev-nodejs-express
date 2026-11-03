export class RankCalculatorService {
   // Calcular el K/D Ratio
  static calculateKd(kills, deaths) {
    if (deaths === 0) return kills > 0 ? kills : 0;
    return Number((kills / deaths).toFixed(2));
  }

  static computeMatchScore(kills, placement, damageDealt) {
    // Reglas de puntuación Battle Royale:
    // - Top 1 (Victoria): 100 pts
    // - Top 2-5: 50 pts
    // - Top 6-10: 25 pts
    // - Cada kill suma 15 pts
    // - Cada 100 de daño suma 5 pts
    let placementBonus = 0;
    if (placement === 1) placementBonus = 100;
    else if (placement <= 5) placementBonus = 50;
    else if (placement <= 10) placementBonus = 25;

    const killPoints = kills * 15;
    const damagePoints = Math.floor(damageDealt / 100) * 5;

    return placementBonus + killPoints + damagePoints;
  }

  static determineTier(points) {
    if (points >= 1000) return "Depredador";
    if (points >= 600) return "Diamante";
    if (points >= 300) return "Platino";
    if (points >= 100) return "Oro";
    return "Bronce";
  }
}