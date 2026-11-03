const STATUSES = ['abierta', 'en_progreso', 'completada'];

const quests = [
  { id: 1, title: 'El bosque susurrante', level: 3, reward: 150, status: 'abierta' },
  { id: 2, title: 'Rescate en la torre', level: 8, reward: 600, status: 'en_progreso' },
  { id: 3, title: 'El tesoro del dragon', level: 15, reward: 2500, status: 'completada' },
];

function serviceError(status, code, message, details) {
  const error = new Error(message);
  Object.assign(error, { status, code });
  if (details) error.details = details;
  return error;
}

const list = (status) => quests.filter((quest) => !status || quest.status === status);

function get(id) {
  const quest = quests.find((item) => item.id === id);
  if (!quest) throw serviceError(404, 'NOT_FOUND', `La mision ${id} no existe`);
  return quest;
}

function create(data) {
  const details = [];
  if (typeof data?.title !== 'string' || data.title.trim().length < 3) details.push('title debe tener al menos 3 caracteres');
  if (!Number.isInteger(data?.level) || data.level < 1 || data.level > 100) details.push('level debe ser un entero entre 1 y 100');
  if (!Number.isInteger(data?.reward) || data.reward < 0) details.push('reward debe ser un entero mayor o igual a 0');
  if (details.length > 0) throw serviceError(400, 'VALIDATION_ERROR', 'Datos invalidos', details);

  const quest = {
    id: quests.reduce((max, item) => Math.max(max, item.id), 0) + 1,
    title: data.title.trim(),
    level: data.level,
    reward: data.reward,
    status: 'abierta',
  };
  quests.push(quest);
  return quest;
}

function complete(id) {
  const quest = get(id);
  if (quest.status === 'completada') {
    throw serviceError(409, 'ALREADY_COMPLETED', 'La mision ya estaba completada');
  }
  quest.status = 'completada';
  return quest;
}

function remove(id) {
  const index = quests.findIndex((item) => item.id === id);
  if (index === -1) throw serviceError(404, 'NOT_FOUND', `La mision ${id} no existe`);
  quests.splice(index, 1);
}

module.exports = { STATUSES, list, get, create, complete, remove };
