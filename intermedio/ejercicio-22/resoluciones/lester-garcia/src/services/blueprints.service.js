import * as blueprintsRepo from "../repositories/blueprints.inMemory.repository.js";
import { NotFoundError } from "../utils/customErrors.js";

export const getAllBlueprintsService = async () => {
  return await blueprintsRepo.findAllBlueprints();
};

export const getBlueprintByIdService = async (id) => {
  const blueprint = await blueprintsRepo.findBlueprintById(id);
  if (!blueprint) {
    throw new NotFoundError(`El modelo arquitectónico 3D con ID '${id}' no existe.`);
  }
  return blueprint;
};

export const uploadBlueprintService = async (payload, uploadedFile) => {
  const all = await blueprintsRepo.findAllBlueprints();
  const nextId = `BIM-${String(all.length + 1).padStart(2, "0")}`;

  const newBlueprint = {
    id: nextId,
    projectName: payload.projectName.trim(),
    architect: payload.architect.trim(),
    scale: payload.scale.trim(),
    fileMetadata: uploadedFile,
    uploadedAt: new Date().toISOString()
  };

  return await blueprintsRepo.saveBlueprint(newBlueprint);
};
