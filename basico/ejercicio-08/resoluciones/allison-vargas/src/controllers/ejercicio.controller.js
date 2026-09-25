import { obtenerResumen, listarHiperdeportivos } from '../services/hiperdeportivos.service.js';

export async function ejecutarEjercicio(req, res) {
  try {
    const resumen = await obtenerResumen();

    return res.status(200).json({
      ok: true,
      message: 'Ejercicio ejecutado correctamente',
      topic: 'variables de entorno',
      resumen,
    });
  } catch (error) {
    console.error('Error preparando el resumen:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al ejecutar el ejercicio',
    });
  }
}

export async function obtenerAutos(req, res) {
  try {
    const autos = await listarHiperdeportivos();

    return res.status(200).json({ ok: true, autos });
  } catch (error) {
    console.error('Error listando hiperdeportivos:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al listar los hiperdeportivos',
    });
  }
}
