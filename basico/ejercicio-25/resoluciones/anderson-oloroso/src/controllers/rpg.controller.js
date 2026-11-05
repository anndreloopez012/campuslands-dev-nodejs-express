import * as rpgService from '../services/rpg.service.js';

export const getHealth = (_req, res) => res.status(200).json({ ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'respuestas HTTP correctas' });

export const listItems = (_req, res) => {
  const data = rpgService.getInventory();
  return res.status(200).json({ ok: true, total: data.length, data });
};

export const getItem = (req, res) => {
  try {
    const data = rpgService.getItemById(req.params.id);
    return res.status(200).json({ ok: true, data });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, error: 'NotFoundError', message: err.message });
  }
};

export const createItem = (req, res) => {
  try {
    const { item, tipo, cantidad, valorOro } = req.body;
    if (!item || !tipo || cantidad === undefined || valorOro === undefined) {
      return res.status(400).json({ ok: false, error: 'BadRequest', message: 'Los campos item, tipo, cantidad y valorOro son obligatorios.' });
    }
    const created = rpgService.addItem({ item, tipo, cantidad, valorOro });
    return res.status(201).json({ ok: true, message: 'Item añadido al inventario con éxito', data: created });
  } catch (err) {
    return res.status(err.statusCode || 500).json({ ok: false, message: err.message });
  }
};
