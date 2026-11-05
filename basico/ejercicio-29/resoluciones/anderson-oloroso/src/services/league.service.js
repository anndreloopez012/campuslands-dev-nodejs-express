let standings = [
  { id: 1, club: 'Campus F.C.', modalidad: 'Fútbol 11', pj: 10, pg: 8, pe: 1, pp: 1, pts: 25 },
  { id: 2, club: 'Titanes Futsal', modalidad: 'Futsal', pj: 8, pg: 7, pe: 0, pp: 1, pts: 21 },
  { id: 3, club: 'Atlético Santander', modalidad: 'Fútbol 11', pj: 10, pg: 6, pe: 2, pp: 2, pts: 20 }
];

export const getStandings = () => standings;

export const registerTeam = ({ club, modalidad }) => {
  const newTeam = { id: standings.length + 1, club, modalidad: modalidad || 'Futsal', pj: 0, pg: 0, pe: 0, pp: 0, pts: 0 };
  standings.push(newTeam);
  return newTeam;
};
