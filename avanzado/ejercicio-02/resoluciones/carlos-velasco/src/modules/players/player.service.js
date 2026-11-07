const { NotFoundError, ValidationError, ConflictError } = require("../../core/errors/app.error");
const store = require("./player.store");

function list() {
  return store.list();
}

function getById(id) {
  const idNumber = Number(id);
  if (!Number.isInteger(idNumber) || idNumber <= 0) {
    throw new ValidationError("El id del jugador debe ser un entero positivo");
  }
  const player = store.get(idNumber);
  if (!player) {
    throw new NotFoundError(`No existe un jugador con id ${idNumber}`);
  }
  return player;
}

function registerPlayer(input) {
  const requiredFields = ["callsign", "main"];
  const missing = requiredFields.filter((field) => !input?.[field] || typeof input[field] !== "string");
  if (missing.length > 0) {
    throw new ValidationError(`Faltan campos obligatorios: ${missing.join(", ")}`);
  }
  const aimRating = Number(input.aimRating);
  if (!Number.isFinite(aimRating) || aimRating < 0 || aimRating > 100) {
    throw new ValidationError("aimRating debe ser un numero entre 0 y 100");
  }
  const exists = store.list().some((player) => player.callsign.toLowerCase() === input.callsign.trim().toLowerCase());
  if (exists) {
    throw new ConflictError(`El callsign "${input.callsign}" ya esta registrado`);
  }
  return store.create({
    callsign: input.callsign.trim(),
    main: input.main.trim(),
    aimRating,
    reaction: Number.isFinite(Number(input.reaction)) ? Number(input.reaction) : 250,
  });
}

function applyResult(playerId, won) {
  const player = store.registerResult(Number(playerId), Boolean(won));
  if (!player) {
    throw new NotFoundError(`No existe un jugador con id ${playerId}`);
  }
  return player;
}

function leaderboard() {
  return store
    .list()
    .sort((a, b) => (b.wins / b.matches || 0) - (a.wins / a.matches || 0))
    .map((player, position) => ({
      position: position + 1,
      callsign: player.callsign,
      winRate: player.matches === 0 ? 0 : Math.round((player.wins / player.matches) * 100) / 100,
      aimRating: player.aimRating,
    }));
}

module.exports = { list, getById, registerPlayer, applyResult, leaderboard };
