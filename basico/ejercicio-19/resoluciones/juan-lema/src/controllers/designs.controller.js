import { getDesignsByArtist } from "../services/designs.service.js";

async function listArtistDesigns(req, res) {
  const { artistId } = req.params;
  const { style, minPrice, maxPrice } = req.query;

  if (!Number.isInteger(Number(artistId))) {
    res.status(400).json({ ok: false, message: "artistId debe ser numerico" });
    return;
  }

  if ((minPrice !== undefined && Number.isNaN(Number(minPrice))) || (maxPrice !== undefined && Number.isNaN(Number(maxPrice)))) {
    res.status(400).json({ ok: false, message: "minPrice y maxPrice deben ser numericos" });
    return;
  }

  const designs = await getDesignsByArtist(artistId, { style, minPrice, maxPrice });
  res.json({ ok: true, data: designs });
}

export { listArtistDesigns };
