import * as repo from "../repositories/drops.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export class DomainError extends AppError {
  constructor(message, domainCode, statusCode = 422) {
    super(message, statusCode);
    this.domainCode = domainCode;
  }
}

export const listItemsService = async () => repo.findAll();

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El suministro aéreo '${id}' no existe en el mapa.`);
  return item;
};

export const createItemService = async (payload) => {
  const { sector, stormPhase, activeSquads } = payload || {};
  if (!sector || typeof sector !== "string") {
    throw new DomainError("El sector de aterrizaje es inválido.", "BR_INVALID_SECTOR", 400);
  }
  if (Number(stormPhase) >= Number(process.env.MAX_STORM_PHASE || 6)) {
    throw new DomainError(
      `No se pueden desplegar cajas de suministro en fase de tormenta ${stormPhase} (zona cerrada).`,
      "BR_STORM_ZONE_CLOSED",
      422
    );
  }
  if (Number(activeSquads) <= 0) {
    throw new DomainError("La partida no tiene escuadrones vivos para recibir suministros.", "BR_NO_ACTIVE_SQUADS", 409);
  }
  const all = await repo.findAll();
  return repo.save({
    id: `DRP-0${all.length + 1}`,
    sector: sector.trim(),
    stormPhase: Number(stormPhase || 1),
    activeSquads: Number(activeSquads),
    crateLooted: false
  });
};
