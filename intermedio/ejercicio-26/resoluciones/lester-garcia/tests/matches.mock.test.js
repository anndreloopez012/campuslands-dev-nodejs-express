import { describe, it, mock } from "node:test";
import assert from "node:assert/strict";
import { registerCompetitiveMatchService } from "../src/services/matches.service.js";
import { ForbiddenError } from "../src/utils/customErrors.js";

describe("Mock de Dependencias con node:test — matches.service.js", () => {
  it("Debe registrar una partida usando mocks para Anticheat y Repositorio sin tocar memoria real", async () => {
    const fakeAnticheat = {
      verifyPlayerIntegrity: mock.fn(async (playerTag) => ({
        playerTag,
        isClean: true,
        trustScore: 100
      }))
    };

    const fakeRepo = {
      findAll: mock.fn(async () => [{ id: "MTC-01" }]),
      save: mock.fn(async (data) => ({ ...data, persistedByMock: true }))
    };

    const result = await registerCompetitiveMatchService(
      {
        playerTag: "Chronicle#FNATIC",
        mapName: "Bind",
        kills: 24,
        deaths: 8,
        headshotPercentage: 42
      },
      { repo: fakeRepo, anticheat: fakeAnticheat }
    );

    assert.equal(fakeAnticheat.verifyPlayerIntegrity.mock.callCount(), 1);
    assert.equal(fakeRepo.save.mock.callCount(), 1);
    assert.equal(result.id, "MTC-02");
    assert.equal(result.kdRatio, 3);
    assert.equal(result.anticheatTrustScore, 100);
    assert.equal(result.persistedByMock, true);
  });

  it("Debe lanzar ForbiddenError (403) y NO llamar a repo.save cuando el mock de Anticheat detecta trampas", async () => {
    const fakeAnticheat = {
      verifyPlayerIntegrity: mock.fn(async (playerTag) => ({
        playerTag,
        isClean: false,
        trustScore: 2
      }))
    };

    const fakeRepo = {
      findAll: mock.fn(async () => []),
      save: mock.fn(async (data) => data)
    };

    await assert.rejects(
      async () => {
        await registerCompetitiveMatchService(
          {
            playerTag: "SpinBotter#999",
            mapName: "Mirage",
            kills: 50,
            deaths: 0,
            headshotPercentage: 100
          },
          { repo: fakeRepo, anticheat: fakeAnticheat }
        );
      },
      (err) => err instanceof ForbiddenError && err.statusCode === 403
    );

    assert.equal(fakeAnticheat.verifyPlayerIntegrity.mock.callCount(), 1);
    assert.equal(fakeRepo.save.mock.callCount(), 0);
  });
});
