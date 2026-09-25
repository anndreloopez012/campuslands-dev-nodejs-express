import { listarPuestos, buscarPuestoPorId } from '../services/puestos.service.js';

function enviarJSON(res, statusCode, data) {
  const cuerpo = JSON.stringify(data);

  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(cuerpo),
  });

  res.end(cuerpo);
}

export function ejecutarEjercicio(req, res) {
  enviarJSON(res, 200, {
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'mini API HTTP nativa',
  });
}

export async function obtenerPuestos(req, res) {
  try {
    const puestos = await listarPuestos();
    enviarJSON(res, 200, { ok: true, puestos });
  } catch (error) {
    console.error('Error listando puestos:', error.message);
    enviarJSON(res, 500, {
      ok: false,
      message: 'Ocurrio un error al listar los puestos',
    });
  }
}

export async function obtenerPuestoPorId(req, res, params) {
  try {
    const puesto = await buscarPuestoPorId(params.id);

    if (!puesto) {
      enviarJSON(res, 404, {
        ok: false,
        message: `No existe un puesto con id ${params.id}`,
      });
      return;
    }

    enviarJSON(res, 200, { ok: true, puesto });
  } catch (error) {
    console.error('Error buscando puesto:', error.message);
    enviarJSON(res, 500, {
      ok: false,
      message: 'Ocurrio un error al buscar el puesto',
    });
  }
}

export function rutaNoEncontrada(req, res) {
  enviarJSON(res, 404, {
    ok: false,
    message: `Ruta no encontrada: ${req.method} ${req.url}`,
  });
}
