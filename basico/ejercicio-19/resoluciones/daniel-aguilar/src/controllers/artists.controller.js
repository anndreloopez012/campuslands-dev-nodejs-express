const { artists, works } = require('../data/studios');
const { parseInteger, parsePositiveNumber, parseList } = require('../utils/query');

const SORT_FIELDS = ['name', 'hourlyRate'];
const bad = (res, message) => res.status(400).json({ ok: false, message });

const info = (req, res) =>
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'req.params y req.query',
  });

// GET /artists?style=realismo&style=acuarela&maxRate=60&sort=hourlyRate&order=desc&limit=2
function list(req, res) {
  const styles = parseList(req.query.style);
  const maxRate = parsePositiveNumber(req.query.maxRate);
  const limit = parseInteger(req.query.limit, { min: 1, max: 20, fallback: 10 });
  const sort = req.query.sort ?? 'name';
  const order = req.query.order ?? 'asc';

  if (maxRate === null) return bad(res, 'maxRate debe ser un numero positivo');
  if (limit === null) return bad(res, 'limit debe ser un entero entre 1 y 20');
  if (!SORT_FIELDS.includes(sort)) return bad(res, `sort debe ser uno de: ${SORT_FIELDS.join(', ')}`);
  if (!['asc', 'desc'].includes(order)) return bad(res, 'order debe ser asc o desc');

  let result = artists.filter((artist) => {
    if (styles.length > 0 && !artist.styles.some((style) => styles.includes(style))) return false;
    if (maxRate !== undefined && artist.hourlyRate > maxRate) return false;
    return true;
  });

  const direction = order === 'asc' ? 1 : -1;
  result = [...result]
    .sort((a, b) => (a[sort] > b[sort] ? 1 : a[sort] < b[sort] ? -1 : 0) * direction)
    .slice(0, limit);

  res.json({ ok: true, filters: { styles, maxRate, sort, order, limit }, total: result.length, artists: result });
}

// GET /artists/:id  (req.params.id)
function detail(req, res) {
  const id = parseInteger(req.params.id);
  if (id === null || id === undefined) return bad(res, 'El id debe ser un entero positivo');
  const artist = artists.find((item) => item.id === id);
  if (!artist) return res.status(404).json({ ok: false, message: 'Artista no encontrado' });
  res.json({ ok: true, artist });
}

// GET /artists/:id/works?style=realismo&minHours=3  (params + query a la vez)
function artistWorks(req, res) {
  const id = parseInteger(req.params.id);
  if (id === null || id === undefined) return bad(res, 'El id debe ser un entero positivo');
  const artist = artists.find((item) => item.id === id);
  if (!artist) return res.status(404).json({ ok: false, message: 'Artista no encontrado' });

  const styles = parseList(req.query.style);
  const minHours = parsePositiveNumber(req.query.minHours);
  if (minHours === null) return bad(res, 'minHours debe ser un numero positivo');

  const result = works.filter(
    (work) =>
      work.artistId === id &&
      (styles.length === 0 || styles.includes(work.style)) &&
      (minHours === undefined || work.hours >= minHours)
  );
  res.json({ ok: true, artist: artist.name, total: result.length, works: result });
}

// GET /studios/:studio/artists/:artistId  (dos parametros de ruta)
function studioArtist(req, res) {
  const artistId = parseInteger(req.params.artistId);
  if (artistId === null || artistId === undefined) return bad(res, 'artistId debe ser un entero positivo');
  const studio = req.params.studio.toLowerCase();
  const artist = artists.find((item) => item.id === artistId && item.studio === studio);
  if (!artist) {
    return res.status(404).json({ ok: false, message: `No hay un artista ${artistId} en el estudio "${req.params.studio}"` });
  }
  res.json({ ok: true, artist });
}

module.exports = { info, list, detail, artistWorks, studioArtist };
