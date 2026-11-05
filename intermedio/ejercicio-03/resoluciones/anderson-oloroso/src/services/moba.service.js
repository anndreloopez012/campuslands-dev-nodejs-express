const teams = [
  { id: 1, name: 'T1', region: 'LCK', titles: 4, coach: 'KkOma' },
  { id: 2, name: 'Gen.G', region: 'LCK', titles: 1, coach: 'Mata' },
  { id: 3, name: 'Bilibili Gaming', region: 'LPL', titles: 0, coach: 'BigWei' },
  { id: 4, name: 'G2 Esports', region: 'LEC', titles: 0, coach: 'Dylan Falco' }
];

const champions = [
  { id: 1, name: 'Aatrox', role: 'Top', damageType: 'Físico', tier: 'S' },
  { id: 2, name: 'Sejuani', role: 'Jungle', damageType: 'Mágico', tier: 'A' },
  { id: 3, name: 'Orianna', role: 'Mid', damageType: 'Mágico', tier: 'S' },
  { id: 4, name: 'Jinx', role: 'ADC', damageType: 'Físico', tier: 'S' },
  { id: 5, name: 'Thresh', role: 'Support', damageType: 'Mágico', tier: 'A' },
  { id: 6, name: 'Azir', role: 'Mid', damageType: 'Mágico', tier: 'A' },
  { id: 7, name: 'Lee Sin', role: 'Jungle', damageType: 'Físico', tier: 'S' },
  { id: 8, name: 'K`Sante', role: 'Top', damageType: 'Híbrido', tier: 'S' }
];

export const getTeamsList = () => teams;

export const getChampionsList = () => champions;

export const evaluateDraft = ({ teamName, picks }) => {
  if (!Array.isArray(picks) || picks.length !== 5) {
    const error = new Error('Un draft competitivo debe contener exactamente 5 campeones seleccionados.');
    error.statusCode = 400;
    throw error;
  }

  const selectedChampions = picks.map((pickName) => {
    const champ = champions.find((c) => c.name.toLowerCase() === pickName.toLowerCase());
    if (!champ) {
      const error = new Error(`El campeón '${pickName}' no existe en el metagame actual.`);
      error.statusCode = 404;
      throw error;
    }
    return champ;
  });

  const roles = selectedChampions.map((c) => c.role);
  const uniqueRoles = new Set(roles);
  const rolesCompletos = uniqueRoles.size === 5;

  const fisico = selectedChampions.filter((c) => c.damageType === 'Físico').length;
  const magico = selectedChampions.filter((c) => c.damageType === 'Mágico').length;

  let balanceDano = 'Equilibrado';
  if (fisico >= 4) balanceDano = 'Muy cargado a daño físico (vulnerable a armadura)';
  if (magico >= 4) balanceDano = 'Muy cargado a daño mágico (vulnerable a resistencia)';

  let scoreSinergia = 70;
  if (rolesCompletos) scoreSinergia += 20;
  if (fisico >= 2 && magico >= 2) scoreSinergia += 10;

  return {
    equipo: teamName,
    campeones: selectedChampions,
    sinergia: `${scoreSinergia}/100`,
    rolesCompletos,
    balanceDano,
    recomendacionTactico: scoreSinergia >= 90 ? 'Composición balanceada lista para torneo' : 'Se sugiere diversificar tipos de daño o cubrir todos los carriles'
  };
};
