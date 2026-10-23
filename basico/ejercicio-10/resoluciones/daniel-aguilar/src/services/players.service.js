const { delay } = require('../utils/delay');

const players = [
  { id: 1, name: 'Kenji Mori', points: 2410, country: 'JP' },
  { id: 2, name: 'Lin Zhao', points: 2630, country: 'CN' },
  { id: 3, name: 'Tomas Reyes', points: 1980, country: 'GT' },
  { id: 4, name: 'Anna Berg', points: 2275, country: 'SE' },
];

// Una funcion async SIEMPRE devuelve una promesa, aunque dentro haya "return valor".
async function getPlayer(id) {
  await delay(30); // simula una consulta lenta a una base de datos
  return players.find((player) => player.id === id) || null;
}

async function getAllPlayers() {
  await delay(30);
  return players.map((player) => ({ ...player }));
}

async function getRanking() {
  const all = await getAllPlayers();
  return all
    .sort((a, b) => b.points - a.points)
    .map((player, index) => ({ position: index + 1, ...player }));
}

// Muestra el orden real de ejecucion: sincrono -> microtareas (promesas) -> macrotareas (timers).
async function eventLoopOrder() {
  const order = [];
  await new Promise((resolve) => {
    setTimeout(() => {
      order.push('setTimeout 0 (macrotarea)');
      resolve();
    }, 0);
    Promise.resolve().then(() => order.push('Promise.then (microtarea)'));
    order.push('codigo sincrono');
  });
  return order;
}

module.exports = { getPlayer, getRanking, eventLoopOrder };
