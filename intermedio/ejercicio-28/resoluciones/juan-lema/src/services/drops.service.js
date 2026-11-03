import { AppError } from "../errors.js";

const LOOT_TIERS = Object.freeze(["comun", "raro", "epico", "legendario"]);
const ID_PATTERN = /^[1-9]\d*$/;

const SEED_DROPS = Object.freeze([
  { zone: "Bosque Norte", lootTier: "raro" },
  { zone: "Ruinas del Sur", lootTier: "legendario" },
  { zone: "Muelle Este", lootTier: "comun" },
]);

const invalid = (code, message) => new AppError(400, code, message);

function checkZone(zone) {
  if (typeof zone !== "string" || zone.trim().length < 2 || zone.trim().length > 40) throw invalid("INVALID_BODY", "zone debe tener entre 2 y 40 caracteres");
}

function createDropsService({ seed = [] } = {}) {
  const drops = [];
  let nextId = 1;

  function findById(id) {
    if (!ID_PATTERN.test(id)) throw invalid("INVALID_ID", "id debe ser un entero positivo");

    const drop = drops.find((d) => d.id === Number(id));
    if (!drop) throw new AppError(404, "NOT_FOUND", `Drop ${id} no encontrado`);
    return drop;
  }

  function list({ zone, lootTier, claimed } = {}) {
    if (lootTier !== undefined && !LOOT_TIERS.includes(lootTier)) throw invalid("INVALID_QUERY", `lootTier debe ser uno de: ${LOOT_TIERS.join(", ")}`);
    if (claimed !== undefined && claimed !== "true" && claimed !== "false") throw invalid("INVALID_QUERY", "claimed debe ser true o false");

    return drops
      .filter((d) => (zone === undefined || d.zone === zone) && (lootTier === undefined || d.lootTier === lootTier) && (claimed === undefined || d.claimed === (claimed === "true")))
      .map((d) => ({ ...d }));
  }

  const getById = (id) => ({ ...findById(id) });

  function create({ zone, lootTier } = {}) {
    checkZone(zone);
    if (!LOOT_TIERS.includes(lootTier)) throw invalid("INVALID_BODY", `lootTier debe ser uno de: ${LOOT_TIERS.join(", ")}`);

    const drop = { id: nextId++, zone: zone.trim(), lootTier, claimed: false };
    drops.push(drop);
    return { ...drop };
  }

  function claim(id) {
    const drop = findById(id);
    if (drop.claimed) throw new AppError(409, "ALREADY_CLAIMED", `Drop ${id} ya fue reclamado`);

    drop.claimed = true;
    return { ...drop };
  }

  function remove(id) {
    const drop = findById(id);
    drops.splice(drops.indexOf(drop), 1);
  }

  seed.forEach(create);
  return { list, getById, create, claim, remove };
}

export { createDropsService, SEED_DROPS, LOOT_TIERS };
