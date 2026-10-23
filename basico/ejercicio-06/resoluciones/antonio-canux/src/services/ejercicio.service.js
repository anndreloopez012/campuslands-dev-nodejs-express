const path = require('path');
const fs = require('fs/promises');

// Carpeta permitida para lectura de manuales
const BASE_DIR = path.resolve(__dirname, '../manuales');

const consultarManualSeguro = async (nombreArchivo) => {
    // Normalizamos y resolvemos la ruta absoluta
    const rutaSolicitada = path.resolve(BASE_DIR, nombreArchivo);

    // Validación de seguridad contra Path Traversal
    if (!rutaSolicitada.startsWith(BASE_DIR)) {
        const error = new Error('Acceso denegado: intento de path traversal detectado');
        error.codigo = 'PATH_INSEGURO';
        throw error;
    }

    try {
        const contenido = await fs.readFile(rutaSolicitada, 'utf-8');
        return {
            archivo: path.basename(rutaSolicitada),
            directorio_seguro: true,
            guia: contenido.trim()
        };
    } catch (err) {
        if (err.code === 'ENOENT') {
            const error = new Error('Manual técnico no encontrado');
            error.codigo = 'NOT_FOUND';
            throw error;
        }
        throw err;
    }
};

const ejecutarEjercicio = async (queryArchivo) => {
    const archivoAConsultar = queryArchivo || 'carburador.txt';
    const manualInfo = await consultarManualSeguro(archivoAConsultar);

    return {
        ok: true,
        message: "Ejercicio ejecutado correctamente",
        topic: "path y rutas seguras",
        mecanica_context: {
            taller: "Mecánica & Motos Campus",
            manual_consultado: manualInfo
        }
    };
};

module.exports = {
    ejecutarEjercicio,
    consultarManualSeguro
};