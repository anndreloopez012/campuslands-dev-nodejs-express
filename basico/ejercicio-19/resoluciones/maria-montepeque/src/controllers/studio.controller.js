import { json } from "../core/response.js";
import { parseQuery } from "../core/query.js";
import { sizeMultipliers } from "../data/studio.js";
import { listArtists, findArtist, listDesignsByArtist, quoteDesign } from "../services/studio.service.js";

const designsQuerySchema = {
    style: { type: "string" },
    maxPrice: { type: "number", min: 0 },
    sort: { type: "string", enum: ["name", "basePrice"], default: "name" },
    order: { type: "string", enum: ["asc", "desc"], default: "asc" },
    page: { type: "integer", min: 1, default: 1 },
    limit: { type: "integer", min: 1, max: 5, default: 5 },
};

function toId(value) {
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function getArtists(req, res) {
    const data = listArtists();
    json(res, 200, { ok: true, count: data.length, data });
}

function getArtist(req, res) {
    const artistId = toId(req.params.artistId);
    if (!artistId) return json(res, 400, { ok: false, message: "artistId debe ser un entero positivo" });

    const artist = findArtist(artistId);
    if (!artist) return json(res, 404, { ok: false, message: `No existe el artista ${artistId}` });

    json(res, 200, { ok: true, data: artist });
}

function getArtistDesigns(req, res) {
    const artistId = toId(req.params.artistId);
    if (!artistId) return json(res, 400, { ok: false, message: "artistId debe ser un entero positivo" });

    if (!findArtist(artistId)) return json(res, 404, { ok: false, message: `No existe el artista ${artistId}` });

    const { values, errors } = parseQuery(req.query, designsQuerySchema);
    if (errors.length > 0) return json(res, 400, { ok: false, message: "Query invalida", errors });

    const result = listDesignsByArtist(artistId, values);
    json(res, 200, { ok: true, params: req.params, query: values, ...result });
}

function getQuote(req, res) {
    const designId = toId(req.params.designId);
    const { size } = req.params;
    const sizes = Object.keys(sizeMultipliers);

    if (!designId) return json(res, 400, { ok: false, message: "designId debe ser un entero positivo" });
    if (!sizes.includes(size)) return json(res, 400, { ok: false, message: `size debe ser uno de: ${sizes.join(", ")}` });

    const quote = quoteDesign(designId, size);
    if (!quote) return json(res, 404, { ok: false, message: `No existe el diseno ${designId}` });

    json(res, 200, { ok: true, data: quote });
}

export { getArtists, getArtist, getArtistDesigns, getQuote };
