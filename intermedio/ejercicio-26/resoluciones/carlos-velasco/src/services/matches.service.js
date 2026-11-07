const { ValidationError } = require('../errors/app.error');

const MODOS_VALIDOS = ['dm', 'ctf', 'snd'];

/**
 * MatchService con DEPENDENCIA INYECTADA en vez de require interno.
 * Es la clave para testear con mocks: en produccion se inyecta el
 * MapRepository real; en tests, un fake con la misma interfaz.
 *
 * NOTA: lo que se mockea en las pruebas es el CONTRATO de MapRepository
 * (findById/save/all), no su implementacion.
 */
class MatchService {
  constructor({ mapRepository }) {
    this.maps = mapRepository;
  }

  listarMapas() {
    return this.maps.all();
  }

  obtenerMapa(id) {
    return this.maps.findById(id);
  }

  crearPartida(datos) {
    const { mapId, titulo, modo } = datos;

    // Validaciones de formato ANTES de tocar la dependencia (fail fast)
    if (!titulo || typeof titulo !== 'string' || titulo.trim().length < 3) {
      throw new ValidationError('El campo "titulo" es obligatorio (min 3 caracteres)');
    }
    if (!MODOS_VALIDOS.includes(modo)) {
      throw new ValidationError(`El modo "${modo}" no es valido. Modos: ${MODOS_VALIDOS.join(', ')}`);
    }

    // Solo despues, integridad contra el repositorio inyectado
    if (!this.maps.findById(mapId)) {
      throw new ValidationError(`El mapa ${mapId} no existe`);
    }

    return {
      id: Date.now(),
      mapId,
      titulo: titulo.trim(),
      modo,
      estado: 'programada'
    };
  }
}

module.exports = { MatchService, MODOS_VALIDOS };
