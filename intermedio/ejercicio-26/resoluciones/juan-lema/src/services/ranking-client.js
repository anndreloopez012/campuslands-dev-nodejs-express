const DEFAULT_BASE_URL = process.env.RANKING_API_URL ?? "https://ranking.example-esports.test";

function createRankingClient({ baseUrl = DEFAULT_BASE_URL, fetchImpl = fetch } = {}) {
  async function getRank(playerId) {
    let response;
    try {
      response = await fetchImpl(`${baseUrl}/players/${playerId}/rank`);
    } catch (cause) {
      throw new Error(`No se pudo contactar la API de ranking: ${cause.message}`, { cause });
    }

    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`La API de ranking respondio ${response.status}`);

    const data = await response.json();
    if (!Number.isInteger(data.rank) || data.rank < 0) throw new Error("La API de ranking devolvio un rank invalido");

    return data.rank;
  }

  return { getRank };
}

export { createRankingClient };
