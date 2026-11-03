import * as questsRepo from "../repositories/quests.inMemory.repository.js";
import { NotFoundError } from "../utils/customErrors.js";

export const getAllQuestsService = async () => {
  return await questsRepo.findAllQuests();
};

export const getQuestByIdService = async (id) => {
  const quest = await questsRepo.findQuestById(id);
  if (!quest) {
    throw new NotFoundError(`La misión RPG con ID '${id}' no existe en el tablón del gremio.`);
  }
  return quest;
};

export const createQuestService = async (payload) => {
  const all = await questsRepo.findAllQuests();
  const nextId = `QST-${String(all.length + 1).padStart(2, "0")}`;

  const newQuest = {
    id: nextId,
    title: payload.title.trim(),
    region: payload.region.trim(),
    difficultyRank: payload.difficultyRank.trim(),
    recommendedLevel: Number(payload.recommendedLevel),
    goldReward: Number(payload.goldReward),
    createdAt: new Date().toISOString()
  };

  return await questsRepo.saveQuest(newQuest);
};
