import { listQuests, getQuestById, createQuest, deleteQuest } from "../services/quests.service.js";
import { sendSuccess, sendError, sendNoContent } from "../utils/respond.js";

function getQuests(req, res) {
  sendSuccess(res, 200, listQuests());
}

function getQuest(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    sendError(res, 400, "id debe ser numerico");
    return;
  }

  const quest = getQuestById(id);
  if (!quest) {
    sendError(res, 404, `Mision con id ${id} no encontrada`);
    return;
  }

  sendSuccess(res, 200, quest);
}

function postQuest(req, res) {
  try {
    const quest = createQuest(req.body || {});
    // 201 + Location: apunta al recurso recien creado.
    res.location(`/quests/${quest.id}`);
    sendSuccess(res, 201, quest);
  } catch (error) {
    sendError(res, 400, error.message);
  }
}

function removeQuest(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) {
    sendError(res, 400, "id debe ser numerico");
    return;
  }

  const removed = deleteQuest(id);
  if (!removed) {
    sendError(res, 404, `Mision con id ${id} no encontrada`);
    return;
  }

  // 204: sin body en la respuesta.
  sendNoContent(res);
}

export { getQuests, getQuest, postQuest, removeQuest };
