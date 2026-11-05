import { defaultAntiCheatClient } from './anticheat.client.js';

export class MatchmakingService {
  constructor(antiCheatClient = defaultAntiCheatClient) {
    this.antiCheatClient = antiCheatClient;
  }

  async queuePlayer({ playerId, playerName, mmr = 1200 }) {
    if (!playerId || !playerName) {
      const err = new Error('playerId y playerName son obligatorios.');
      err.statusCode = 400;
      throw err;
    }

    // Consulta la dependencia externa
    const antiCheatStatus = await this.antiCheatClient.verifyPlayer(playerId);

    if (!antiCheatStatus.isClean) {
      const err = new Error(`Acceso denegado: El jugador '${playerName}' fue bloqueado por el sistema Anti-Cheat.`);
      err.statusCode = 403;
      throw err;
    }

    let tier = 'Plata';
    if (mmr >= 2000) tier = 'Radiante / Inmortal';
    else if (mmr >= 1600) tier = 'Diamante';
    else if (mmr >= 1300) tier = 'Oro';

    return {
      playerId,
      playerName,
      mmr,
      tier,
      queueStatus: 'En cola competitiva',
      antiCheatValidation: {
        verified: true,
        trustScore: antiCheatStatus.trustScore
      }
    };
  }
}

export const matchmakingService = new MatchmakingService();
