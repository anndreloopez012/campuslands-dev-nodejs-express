import * as questsService from "../services/quests.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getAllQuestsController = asyncHandler(async (req, res) => {
  const quests = await questsService.getAllQuestsService();
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    total: quests.length,
    data: quests
  });
});

export const getQuestByIdController = asyncHandler(async (req, res) => {
  const quest = await questsService.getQuestByIdService(req.params.id);
  return res.status(200).json({
    status: "success",
    requestId: req.id,
    data: quest
  });
});

export const createQuestController = asyncHandler(async (req, res) => {
  const created = await questsService.createQuestService(req.body);
  return res.status(201).json({
    status: "success",
    requestId: req.id,
    message: "Misión RPG publicada en el tablón de aventureros.",
    data: created
  });
});
