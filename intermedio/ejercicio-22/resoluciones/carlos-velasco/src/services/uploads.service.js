const { ValidationError, NotFoundError } = require('../errors/app.error');
const modelos = require('../data/modelos.data');

const FORMATOS_VALIDOS = ['obj', 'fbx', 'gltf'];
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB simulado

/**
 * "Subida" de archivos sin disco ni red: se manda base64 por JSON
 * y se guarda en memoria como Buffer. Sirve para aprender el flujo:
 *
 * 1. Validar el nombre y formato ANTES de aceptar bytes.
 * 2. Controlar tamano maximo (protege la memoria del servidor).
 * 3. Guardar meta + payload y devolver una referencia (url simulada).
 *
 * En un servidor real se reciben los bytes con multer o streams:
 * la validacion y los limites no cambian, solo el transporte.
 */
function iniciarSubida(datos) {
  const { nombre, formato } = datos;

  if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 3 || nombre.includes('..')) {
    throw new ValidationError('El campo "nombre" es obligatorio (min 3 caracteres, sin rutas)');
  }
  if (!FORMATOS_VALIDOS.includes(formato)) {
    throw new ValidationError(`Formato "${formato}" no soportado. Formatos: ${FORMATOS_VALIDOS.join(', ')}`);
  }

  // Nota: el payload de bytes llega en la confirmacion, no aqui.
  // model es una "sesion de subida" con expiracion.
  const modelo = {
    id: modelos.siguienteId(),
    nombre: nombre.trim(),
    formato,
    estado: 'esperando_chunks',
    bytes_recibidos: 0
  };
  modelos.guardar(modelo);
  return modelo;
}

/** Recibe un chunk (base64) y lo acumula en memoria. */
function enviarChunk(id, datos) {
  const modelo = modelos.obtener(id);
  if (!modelo) throw new NotFoundError(`El modelo ${id} no existe`);
  if (modelo.estado === 'completado') throw new ValidationError('La subida ya esta completada');

  const { bytes_base64 } = datos;
  if (typeof bytes_base64 !== 'string' || bytes_base64.length === 0) {
    throw new ValidationError('El campo "bytes_base64" es obligatorio');
  }

  const buffer = Buffer.from(bytes_base64, 'base64');
  if (modelo.bytes_recibidos + buffer.length > MAX_BYTES) {
    throw new ValidationError(`Tamano total maximo superado (${MAX_BYTES} bytes)`);
  }

  if (!Array.isArray(modelo.chunks)) modelo.chunks = [];
  modelo.chunks.push(buffer);
  modelo.bytes_recibidos += buffer.length;

  const completado = datos.ultimo === true;
  if (completado) {
    modelo.estado = 'completado';
    modelo.tamano_bytes = modelo.bytes_recibidos;
    modelo.url_simulada = `mem://modelos/${modelo.id}/${modelo.nombre}.${modelo.formato}`;
  }
  return modelo;
}

function listarModelos(resumen = true) {
  return modelos.listar().map((modelo) => {
    if (resumen) {
      const { chunks, ...resto } = modelo;
      return { ...resto, chunks_guardados: Array.isArray(modelo.chunks) ? modelo.chunks.length : 0 };
    }
    return modelo;
  });
}

module.exports = { iniciarSubida, enviarChunk, listarModelos, FORMATOS_VALIDOS, MAX_BYTES };
