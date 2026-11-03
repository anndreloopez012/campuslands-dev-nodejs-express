import * as repo from "../repositories/matches-csv.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const parsePingPongCsv = (csvText = "") => {
  const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) {
    throw new BadRequestError("El contenido CSV debe incluir cabecera y al menos una fila de datos.");
  }
  const headers = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((line, idx) => {
    const cols = line.split(",").map((c) => c.trim());
    const row = {};
    headers.forEach((h, i) => { row[h] = cols[i]; });
    if (!row.playerA || !row.playerB || !row.setsScore) {
      throw new BadRequestError(`Fila CSV #${idx + 1} inválida: requiere playerA, playerB y setsScore.`);
    }
    return row;
  });
};

export const listItemsService = async () => repo.findAll();

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El partido de pingpong '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (payload.csvContent) {
    const parsedRows = parsePingPongCsv(payload.csvContent);
    const created = [];
    for (const row of parsedRows) {
      const all = await repo.findAll();
      created.push(await repo.save({
        id: `PPG-0${all.length + 1}`,
        playerA: row.playerA,
        playerB: row.playerB,
        setsScore: row.setsScore,
        spinRpmMax: Number(row.spinRpmMax || 8500)
      }));
    }
    return { importedFromCsv: created.length, records: created };
  }
  if (!payload.playerA || !payload.playerB || !payload.setsScore) {
    throw new BadRequestError("Envía 'csvContent' o los campos 'playerA', 'playerB' y 'setsScore'.");
  }
  const all = await repo.findAll();
  return repo.save({
    id: `PPG-0${all.length + 1}`,
    playerA: payload.playerA.trim(),
    playerB: payload.playerB.trim(),
    setsScore: payload.setsScore.trim(),
    spinRpmMax: Number(payload.spinRpmMax || 8500)
  });
};
