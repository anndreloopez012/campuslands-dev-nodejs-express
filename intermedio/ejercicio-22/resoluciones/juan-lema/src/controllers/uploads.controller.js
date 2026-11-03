import { listUploads, getUploadById, registerUpload } from "../services/uploads.service.js";

const getUploads = (req, res) => res.json({ ok: true, data: listUploads() });

const getUpload = (req, res) => res.json({ ok: true, data: getUploadById(req.params.id) });

const postUpload = (req, res) => res.status(201).json({ ok: true, data: registerUpload({ file: req.file, project: req.body?.project }) });

export { getUploads, getUpload, postUpload };
