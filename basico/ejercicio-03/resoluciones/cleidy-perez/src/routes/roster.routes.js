function getRoutes() { return [{ method: 'GET', path: '/players', description: 'Listar jugadores' }, { method: 'GET', path: '/players/:id', description: 'Consultar un jugador' }]; }
module.exports = { getRoutes };
