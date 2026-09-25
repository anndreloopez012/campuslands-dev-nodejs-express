import {
  buscarArtistaPorId,
  listarDisenosDeArtista,
  buscarDisenoDeArtista,
} from '../services/tatuajes.service.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'req.params y req.query',
  });
}

// GET /artistas/:artistaId/disenos?estilo=&precioMax=
// req.params.artistaId identifica al artista; req.query filtra su lista.
export async function obtenerDisenosDeArtista(req, res) {
  try {
    const { artistaId } = req.params;
    const { estilo, precioMax } = req.query;

    const artista = await buscarArtistaPorId(artistaId);

    if (!artista) {
      return res.status(404).json({
        ok: false,
        message: `No existe un artista con id ${artistaId}`,
      });
    }

    const disenos = await listarDisenosDeArtista(artistaId, { estilo, precioMax });

    return res.status(200).json({ ok: true, artista: artista.nombre, disenos });
  } catch (error) {
    console.error('Error listando disenos:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al listar los disenos',
    });
  }
}

// GET /artistas/:artistaId/disenos/:disenoId
// Dos route params combinados: el diseno debe existir Y pertenecer
// justo a ese artista.
export async function obtenerDisenoEspecifico(req, res) {
  try {
    const { artistaId, disenoId } = req.params;
    const diseno = await buscarDisenoDeArtista(artistaId, disenoId);

    if (!diseno) {
      return res.status(404).json({
        ok: false,
        message: `No existe el diseno ${disenoId} para el artista ${artistaId}`,
      });
    }

    return res.status(200).json({ ok: true, diseno });
  } catch (error) {
    console.error('Error buscando diseno:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al buscar el diseno',
    });
  }
}
