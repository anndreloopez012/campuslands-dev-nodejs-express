import { listWelds, getWeldById, createWeld, changeWeldStatus } from "../services/welds.service.js";

const getWelds = (req, res) => res.json({ ok: true, data: listWelds() });

const getWeld = (req, res) => res.json({ ok: true, data: getWeldById(req.params.id) });

const postWeld = (req, res) => res.status(201).json({ ok: true, data: createWeld(req.body ?? {}) });

const patchWeldStatus = (req, res) => res.json({ ok: true, data: changeWeldStatus(req.params.id, req.body?.status) });

export { getWelds, getWeld, postWeld, patchWeldStatus };
