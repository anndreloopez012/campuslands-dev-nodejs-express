import * as repo from "../repositories/loadouts.inMemory.repository.js";
import { AppError, BadRequestError, ConflictError, NotFoundError } from "../utils/customErrors.js";
export const COMPETITIVE_FIXTURES = Object.freeze([
  { id: "FIX-01", proPlayer: "ZywOo", primaryWeapon: "AK-47 Wild Lotus", headshotPct: 59.2, edpi: 800 },
  { id: "FIX-02", proPlayer: "aspas", primaryWeapon: "Operator Ion", headshotPct: 48.0, edpi: 320 }
]);

let factoryCounter = 1;
export const buildLoadoutFactory = (overrides = {}) => ({
  id: overrides.id || `FAC-0${factoryCounter++}`,
  proPlayer: overrides.proPlayer || `ProPlayer_${factoryCounter}`,
  primaryWeapon: overrides.primaryWeapon || "Phantom Recon",
  headshotPct: Number(overrides.headshotPct ?? 55.0),
  edpi: Number(overrides.edpi ?? 400)
});

export const listItemsService = async () => ({
  fixtures: COMPETITIVE_FIXTURES,
  loadouts: await repo.findAll()
});

export const getItemByIdService = async (id) => {
  const item = await repo.findById(id);
  if (!item) throw new NotFoundError(`El loadout competitivo '${id}' no existe.`);
  return item;
};

export const createItemService = async (payload) => {
  if (payload.useFactory) {
    const generated = buildLoadoutFactory(payload.overrides || {});
    return repo.save(generated);
  }
  if (!payload.proPlayer || !payload.primaryWeapon) {
    throw new BadRequestError("Se requiere 'proPlayer' y 'primaryWeapon' (o 'useFactory': true).");
  }
  const all = await repo.findAll();
  return repo.save(
    buildLoadoutFactory({
      id: `LDT-0${all.length + 1}`,
      proPlayer: payload.proPlayer.trim(),
      primaryWeapon: payload.primaryWeapon.trim(),
      headshotPct: payload.headshotPct,
      edpi: payload.edpi
    })
  );
};
