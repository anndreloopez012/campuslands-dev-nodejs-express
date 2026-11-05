import * as service from "../services/designs.service.js";

export const getDesignsByArtist = async (req, res) => {
  try {
    const { artistId } = req.params;
    const { style, minPrice, maxPrice } = req.query;

    const result = await service.getByArtist(artistId, { style, minPrice, maxPrice });

    if (result.error) {
      return res.status(result.status).json({ error: result.error });
    }

    res.json(result.data);
  } catch {
    res.status(500).json({ error: "Error interno del servidor" });
  }
};
