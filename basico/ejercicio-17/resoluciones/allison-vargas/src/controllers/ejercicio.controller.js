import {
  listarDestinos,
  listarDestinosPopulares,
  buscarDestinoPorId,
} from '../services/destinos.service.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'rutas GET',
  });
}

// req.query: lo que viene despues del "?" en la url (filtros opcionales)
export async function obtenerDestinos(req, res) {
  try {
    const { pais, precioMax } = req.query;
    const destinos = await listarDestinos({ pais, precioMax });

    return res.status(200).json({ ok: true, destinos });
  } catch (error) {
    console.error('Error listando destinos:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al listar los destinos',
    });
  }
}

export async function obtenerDestinosPopulares(req, res) {
  try {
    const destinos = await listarDestinosPopulares();

    return res.status(200).json({ ok: true, destinos });
  } catch (error) {
    console.error('Error listando destinos populares:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al listar los destinos populares',
    });
  }
}

// req.params: lo que viene de la parte dinamica de la ruta (:id)
export async function obtenerDestinoPorId(req, res) {
  try {
    const { id } = req.params;
    const destino = await buscarDestinoPorId(id);

    if (!destino) {
      return res.status(404).json({
        ok: false,
        message: `No existe un destino con id ${id}`,
      });
    }

    return res.status(200).json({ ok: true, destino });
  } catch (error) {
    console.error('Error buscando destino:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al buscar el destino',
    });
  }
}
