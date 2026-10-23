import { compoundsService } from "../services/compounds.service.js";

const getCompounds = (req, res) => res.json({ ok: true, data: compoundsService.list({ element: req.query.element }) });

const getCompound = (req, res) => res.json({ ok: true, data: compoundsService.getById(req.params.id) });

const postCompound = (req, res) => res.status(201).json({ ok: true, data: compoundsService.register(req.body) });

export { getCompounds, getCompound, postCompound };
