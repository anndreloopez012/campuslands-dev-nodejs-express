import { AppError } from "../errors.js";

const MODALITIES = Object.freeze(["futbol", "futbol_sala"]);
const STATUSES = Object.freeze(["programado", "en_juego", "finalizado"]);
const ID_PATTERN = /^[1-9]\d*$/;

const invalid = (code, message) => new AppError(400, code, message);

function checkTeamName(name, field) {
  if (typeof name !== "string" || name.trim().length < 2 || name.trim().length > 40) throw invalid("INVALID_BODY", `${field} debe tener entre 2 y 40 caracteres`);
}

function checkScore(value, field) {
  if (!Number.isInteger(value) || value < 0) throw invalid("INVALID_BODY", `${field} debe ser un entero mayor o igual a 0`);
}

function createMatchesService({ seed = [] } = {}) {
  const matches = [];
  let nextId = 1;

  function findById(id) {
    if (!ID_PATTERN.test(id)) throw invalid("INVALID_ID", "id debe ser un entero positivo");

    const match = matches.find((m) => m.id === Number(id));
    if (!match) throw new AppError(404, "NOT_FOUND", `Partido ${id} no encontrado`);
    return match;
  }

  function ensureStatus(match, expected, action) {
    if (match.status !== expected) throw new AppError(409, "INVALID_TRANSITION", `Solo un partido ${expected} puede ${action}`);
  }

  function list({ modality, status } = {}) {
    if (modality !== undefined && !MODALITIES.includes(modality)) throw invalid("INVALID_QUERY", `modality debe ser una de: ${MODALITIES.join(", ")}`);
    if (status !== undefined && !STATUSES.includes(status)) throw invalid("INVALID_QUERY", `status debe ser uno de: ${STATUSES.join(", ")}`);

    return matches.filter((m) => (modality === undefined || m.modality === modality) && (status === undefined || m.status === status)).map((m) => ({ ...m }));
  }

  const getById = (id) => ({ ...findById(id) });

  function create({ homeTeam, awayTeam, modality } = {}) {
    checkTeamName(homeTeam, "homeTeam");
    checkTeamName(awayTeam, "awayTeam");
    if (homeTeam.trim() === awayTeam.trim()) throw invalid("INVALID_BODY", "homeTeam y awayTeam no pueden ser el mismo equipo");
    if (!MODALITIES.includes(modality)) throw invalid("INVALID_BODY", `modality debe ser una de: ${MODALITIES.join(", ")}`);

    const match = { id: nextId++, homeTeam: homeTeam.trim(), awayTeam: awayTeam.trim(), modality, status: "programado", homeScore: null, awayScore: null };
    matches.push(match);
    return { ...match };
  }

  function start(id) {
    const match = findById(id);
    ensureStatus(match, "programado", "iniciar");

    match.status = "en_juego";
    match.homeScore = 0;
    match.awayScore = 0;
    return { ...match };
  }

  function score(id, { homeScore, awayScore } = {}) {
    const match = findById(id);
    ensureStatus(match, "en_juego", "anotar");
    checkScore(homeScore, "homeScore");
    checkScore(awayScore, "awayScore");

    match.homeScore = homeScore;
    match.awayScore = awayScore;
    return { ...match };
  }

  function finish(id) {
    const match = findById(id);
    ensureStatus(match, "en_juego", "finalizar");

    match.status = "finalizado";
    return { ...match };
  }

  seed.forEach(create);
  return { list, getById, create, start, score, finish };
}

export { createMatchesService, MODALITIES, STATUSES };
