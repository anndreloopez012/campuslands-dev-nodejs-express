function calcularKda(kills, deaths, assists) {
  let muertes = deaths;

  if (muertes === 0) {
    muertes = 1;
  }

  const resultado = (kills + assists) / muertes;
  return Number(resultado.toFixed(2));
}

module.exports = { calcularKda };
