import { describirOrden } from '../services/ordenamiento.service.js';
import { ordenJugadores } from '../validators/orden/jugadores.orden.js';
import { ordenPartidos } from '../validators/orden/partidos.orden.js';

export const campos = (req, res) =>
  res.status(200).json({
    ok: true,
    data: {
      jugadores: describirOrden(ordenJugadores),
      partidos: describirOrden(ordenPartidos),
    },
  });
