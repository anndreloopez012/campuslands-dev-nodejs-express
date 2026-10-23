import { listarProductos } from '../services/productos.service.js';

export function ejecutarEjercicio(req, res) {
  return res.status(200).json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'primer servidor Express',
  });
}

export async function obtenerProductos(req, res) {
  try {
    const productos = await listarProductos();

    return res.status(200).json({ ok: true, productos });
  } catch (error) {
    console.error('Error listando productos:', error.message);

    return res.status(500).json({
      ok: false,
      message: 'Ocurrio un error al listar los productos',
    });
  }
}
