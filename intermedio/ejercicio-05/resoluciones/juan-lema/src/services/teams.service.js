import { findAll, findById, insert } from "../repositories/teams.repository.js";

const MODALITIES = ["futbol", "futbol sala"];

const listTeams = () => findAll();
const getTeamById = (id) => findById(id);

function createTeam({ name, modality, points }) {
  if (!name || typeof name !== "string" || !name.trim()) throw new Error("name es obligatorio");
  if (!modality || !MODALITIES.includes(modality)) throw new Error(`modality debe ser una de: ${MODALITIES.join(", ")}`);

  const numericPoints = points === undefined ? 0 : Number(points);
  if (Number.isNaN(numericPoints) || numericPoints < 0) throw new Error("points debe ser un numero mayor o igual a 0");

  return insert({ name: name.trim(), modality, points: numericPoints });
}

export { listTeams, getTeamById, createTeam };
