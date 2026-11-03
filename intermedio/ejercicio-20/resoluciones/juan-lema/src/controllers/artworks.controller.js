import { listArtworks, getArtworkById, createArtwork } from "../services/artworks.service.js";

const getArtworks = (req, res) => res.json({ ok: true, data: listArtworks() });

function getArtwork(req, res) {
  const { id } = req.params;
  if (!Number.isInteger(Number(id))) return res.status(400).json({ ok: false, message: "id debe ser numerico" });

  const artwork = getArtworkById(id);
  if (!artwork) return res.status(404).json({ ok: false, message: `Obra con id ${id} no encontrada` });

  res.json({ ok: true, data: artwork });
}

function postArtwork(req, res) {
  try {
    res.status(201).json({ ok: true, data: createArtwork(req.body || {}) });
  } catch (error) {
    res.status(400).json({ ok: false, message: error.message });
  }
}

export { getArtworks, getArtwork, postArtwork };
