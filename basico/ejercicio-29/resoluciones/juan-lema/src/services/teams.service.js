const teams = [
  { id: 1, name: "Halcones FC", modality: "futbol" },
  { id: 2, name: "Rayo Sala", modality: "futbol sala" },
];
let nextId = 3;

function listTeams() {
  return teams;
}

function getTeamById(id) {
  return teams.find((t) => t.id === Number(id)) || null;
}

function createTeam({ name, modality }) {
  if (!name || typeof name !== "string" || !name.trim()) {
    throw new Error("name es obligatorio");
  }
  if (!["futbol", "futbol sala"].includes(modality)) {
    throw new Error("modality debe ser 'futbol' o 'futbol sala'");
  }

  const team = { id: nextId++, name: name.trim(), modality };
  teams.push(team);
  return team;
}

export { listTeams, getTeamById, createTeam };
