const teams = [
  { id: 1, name: "Aguilas FC", modality: "futbol", points: 32 },
  { id: 2, name: "Halcones Sala", modality: "futbol sala", points: 27 },
];
let nextId = 3;

const findAll = () => teams;
const findById = (id) => teams.find((t) => t.id === Number(id)) || null;

function insert(team) {
  const record = { id: nextId++, ...team };
  teams.push(record);
  return record;
}

export { findAll, findById, insert };
