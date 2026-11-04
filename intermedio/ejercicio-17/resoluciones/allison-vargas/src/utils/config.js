const entero = (valor, porDefecto) => {
  const numero = Number.parseInt(valor, 10);
  return Number.isInteger(numero) && numero > 0 ? numero : porDefecto;
};

export const config = {
  jwtSecreto: process.env.JWT_SECRET || 'secreto-solo-para-desarrollo-local',
  jwtExpiraSegundos: entero(process.env.JWT_EXPIRES_SECONDS, 3600),
  jwtEmisor: 'viajes-turismo-api',
};
