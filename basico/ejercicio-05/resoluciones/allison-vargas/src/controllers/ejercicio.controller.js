import { obtenerResumenEquipos, listarEquipos } from '../services/equipos.service.js';

export async function ejecutarEjercicio(req, res) {
  try {
    const resumen = await obtenerResumenEquipos();

    return res.status(200).json({
      ok: true,
      message: 'Ejercicio ejecutado correctamente',
      topic: 'fs para leer archivos',
      resumen,
    });
  } catch (error) {
    console.error('Error leyendo el archivo de equipos:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'No se pudo leer el archivo de equipos',
    });
  }
}

export async function obtenerEquipos(req, res) {
  try {
    const equipos = await listarEquipos();

    return res.status(200).json({
      ok: true,
      equipos,
    });
  } catch (error) {
    console.error('Error leyendo el archivo de equipos:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'No se pudo leer el archivo de equipos',
    });
  }
}
