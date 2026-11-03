import { listSquads, deployPlayerToSquad } from "../services/squads.service.js";

function getSquads(req, res) {
  res.status(200).json({ ok: true, data: listSquads() });
}

function postDeploy(req, res, next) {
  try {
    const updated = deployPlayerToSquad(req.params.id, req.body || {});
    res.status(200).json({ ok: true, data: updated });
  } catch (error) {
    next(error);
  }
}

export { getSquads, postDeploy };
