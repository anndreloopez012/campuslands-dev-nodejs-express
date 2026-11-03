/**
 * DTO / Mapper puro extraído durante la refactorización para desacoplar
 * el cálculo de puntos, diferencia de goles y rendimiento del controlador.
 */
export const toClubStandingDTO = (club) => {
  const matchesPlayed = club.wins + club.draws + club.losses;
  const points = club.wins * 3 + club.draws;
  const goalDifference = club.goalsFor - club.goalsAgainst;
  const maxPossiblePoints = matchesPlayed * 3;
  const efficiencyPercentage = maxPossiblePoints > 0
    ? Number(((points / maxPossiblePoints) * 100).toFixed(1))
    : 0;

  return {
    id: club.id,
    clubName: club.clubName,
    modality: club.modality,
    stats: {
      matchesPlayed,
      wins: club.wins,
      draws: club.draws,
      losses: club.losses,
      goalsFor: club.goalsFor,
      goalsAgainst: club.goalsAgainst,
      goalDifference,
      points,
      efficiencyPercentage
    },
    createdAt: club.createdAt
  };
};
