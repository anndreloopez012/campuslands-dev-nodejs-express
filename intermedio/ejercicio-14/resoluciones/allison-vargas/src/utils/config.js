const entero = (valor, porDefecto) => {
  const numero = Number.parseInt(valor, 10);
  return Number.isInteger(numero) && numero > 0 ? numero : porDefecto;
};

export const config = {
  sesionSegundos: entero(process.env.SESSION_TTL_SECONDS, 1800),
  maxIntentos: entero(process.env.LOGIN_MAX_INTENTOS, 5),
  bloqueoSegundos: entero(process.env.LOGIN_BLOQUEO_SEGUNDOS, 60),
};
