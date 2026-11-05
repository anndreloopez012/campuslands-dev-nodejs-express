let tournaments = [
  { id: 1, torneo: 'Worlds Championship 2026', fase: 'Cuartos de final', partidosJugados: 12 },
  { id: 2, torneo: 'Mid-Season Invitational', fase: 'Final', partidosJugados: 20 }
];

export const getTournaments = () => tournaments;

export const createTournament = ({ torneo, fase }) => {
  const newT = { id: tournaments.length + 1, torneo, fase: fase || 'Fase de Grupos', partidosJugados: 0 };
  tournaments.push(newT);
  return newT;
};
