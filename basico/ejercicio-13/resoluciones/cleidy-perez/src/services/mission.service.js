class MissionError extends Error { constructor(message) { super(message); this.name = 'MissionError'; } }
async function loadMission({ fail = false } = {}) { await new Promise((resolve) => setTimeout(resolve, 20)); if (fail) throw new MissionError('La nave no tiene energía suficiente'); return { id: 'M-01', destination: 'Órbita baja', status: 'preparada' }; }
module.exports = { MissionError, loadMission };
