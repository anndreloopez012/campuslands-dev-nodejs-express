import { enviarListado } from '../utils/respuesta.js';
import { catchAsync } from '../utils/catchAsync.js';

export function crearSistemaController({ salud, eventos }) {
  return {
    salud: catchAsync(async (req, res) => {
      const estado = await salud.estado();
      if (estado.ok) return res.status(200).json({ ok: true, data: estado });
      return res.status(503).json({
        ok: false,
        message: 'Una dependencia no esta disponible',
        codigo: 'DEPENDENCIA_CAIDA',
        data: estado,
      });
    }),
    eventos: catchAsync((req, res) => enviarListado(res, eventos.listar(req.query))),
  };
}
