class MatchService {
  getMatchInfo() {
    return {
      game: "Valorant / CS2",
      mode: "Competitivo 5v5",
      map: "De_Dust2 / Ascent",
      status: "Buscando partida..."
    };
  }
}

export default new MatchService();