import * as mapsService from '../services/maps.service.js';

export function info(req, res) {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'modulos ES Modules',
  });
}

export async function list(req, res, next) {
  try {
    res.json({ ok: true, maps: await mapsService.listMaps() });
  } catch (error) {
    next(error);
  }
}

export async function detail(req, res, next) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ ok: false, message: 'El id debe ser un entero positivo' });
    }
    const map = await mapsService.getMapById(id);
    if (!map) {
      return res.status(404).json({ ok: false, message: 'Mapa no encontrado' });
    }
    res.json({ ok: true, map });
  } catch (error) {
    next(error);
  }
}
