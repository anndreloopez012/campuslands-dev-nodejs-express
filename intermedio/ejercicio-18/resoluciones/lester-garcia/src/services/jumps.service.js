import * as jumpsRepo from "../repositories/jumps.inMemory.repository.js";

export const getJumpsService = async (currentUser) => {
  return await jumpsRepo.findJumpsBySkydiverId(currentUser.id);
};

export const logNewJumpService = async (payload, currentUser) => {
  const userJumps = await jumpsRepo.findJumpsBySkydiverId(currentUser.id);
  const nextJumpNumber = userJumps.length + 1;

  const newJump = {
    id: String(Date.now()),
    jumpNumber: nextJumpNumber,
    dropzone: payload.dropzone.trim(),
    exitAltitudeFeet: Number(payload.exitAltitudeFeet),
    freefallSeconds: Number(payload.freefallSeconds),
    parachuteModel: payload.parachuteModel.trim(),
    skydiverId: currentUser.id,
    createdAt: new Date().toISOString()
  };

  return await jumpsRepo.saveJump(newJump);
};