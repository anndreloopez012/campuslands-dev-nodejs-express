import test from 'node:test';
import assert from 'node:assert/strict';
import { MatchmakingService } from '../src/services/matchmaking.service.js';

test('MatchmakingService con Mock de AntiCheat limpio (Caso Éxito)', async () => {
  // Mock que simula respuesta exitosa sin llamar red
  const mockCleanClient = {
    verifyPlayer: async (playerId) => ({
      playerId,
      isClean: true,
      trustScore: 99
    })
  };

  const service = new MatchmakingService(mockCleanClient);
  const result = await service.queuePlayer({
    playerId: 'p-101',
    playerName: 'OlorosoSniper',
    mmr: 2150
  });

  assert.equal(result.playerName, 'OlorosoSniper');
  assert.equal(result.tier, 'Radiante / Inmortal');
  assert.equal(result.antiCheatValidation.trustScore, 99);
});

test('MatchmakingService con Mock de Jugador Tramposo (Caso Fallo 403)', async () => {
  // Mock que simula jugador detectado por AntiCheat
  const mockBannedClient = {
    verifyPlayer: async (playerId) => ({
      playerId,
      isClean: false,
      trustScore: 10
    })
  };

  const service = new MatchmakingService(mockBannedClient);

  await assert.rejects(
    async () => {
      await service.queuePlayer({
        playerId: 'p-666',
        playerName: 'AimbotUser',
        mmr: 1500
      });
    },
    (err) => {
      assert.equal(err.statusCode, 403);
      assert.match(err.message, /bloqueado por el sistema Anti-Cheat/);
      return true;
    }
  );
});
