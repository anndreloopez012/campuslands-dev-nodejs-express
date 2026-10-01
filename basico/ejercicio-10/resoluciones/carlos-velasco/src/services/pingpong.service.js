const getPingPongData = async () => {
  await new Promise((resolve) => {
    setTimeout(resolve, 500);
  });

  return {
    sport: 'pingpong',
    players: 2,
    status: 'ready',
    message: 'Datos de pingpong obtenidos correctamente'
  };
};

module.exports = {
  getPingPongData
};