import * as loadoutsRepo from "../repositories/loadouts.inMemory.repository.js";
import { NotFoundError } from "../utils/customErrors.js";

export const getHttpExamplesCollectionService = () => {
  return [
    {
      name: "1. Listar todos los loadouts",
      method: "GET",
      url: "http://localhost:3000/api/v1/loadouts",
      expectedStatus: 200
    },
    {
      name: "2. Consultar loadout específico por ID",
      method: "GET",
      url: "http://localhost:3000/api/v1/loadouts/LDT-01",
      expectedStatus: 200
    },
    {
      name: "3. Crear nuevo equipamiento de escuadrón",
      method: "POST",
      url: "http://localhost:3000/api/v1/loadouts",
      headers: { "Content-Type": "application/json" },
      body: {
        squadName: "Valkyrie Squad",
        dropZone: "Military Base",
        primaryWeapon: "Subfusil Vector Táctico",
        rarityTier: "Epico",
        shieldCapacity: 150
      },
      expectedStatus: 201
    },
    {
      name: "4. Caso de error 400 por rareza inválida",
      method: "POST",
      url: "http://localhost:3000/api/v1/loadouts",
      headers: { "Content-Type": "application/json" },
      body: {
        squadName: "No",
        dropZone: "X",
        primaryWeapon: "Palo",
        rarityTier: "Inexistente",
        shieldCapacity: 999
      },
      expectedStatus: 400
    }
  ];
};

export const getAllLoadoutsService = async () => {
  return await loadoutsRepo.findAllLoadouts();
};

export const getLoadoutByIdService = async (id) => {
  const loadout = await loadoutsRepo.findLoadoutById(id);
  if (!loadout) {
    throw new NotFoundError(`El equipamiento con ID '${id}' no existe en la isla Battle Royale.`);
  }
  return loadout;
};

export const createLoadoutService = async (payload) => {
  const all = await loadoutsRepo.findAllLoadouts();
  const nextId = `LDT-${String(all.length + 1).padStart(2, "0")}`;

  const newLoadout = {
    id: nextId,
    squadName: payload.squadName.trim(),
    dropZone: payload.dropZone.trim(),
    primaryWeapon: payload.primaryWeapon.trim(),
    rarityTier: payload.rarityTier.trim(),
    shieldCapacity: Number(payload.shieldCapacity),
    createdAt: new Date().toISOString()
  };

  return await loadoutsRepo.saveLoadout(newLoadout);
};
