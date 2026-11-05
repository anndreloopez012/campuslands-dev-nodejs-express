import { Catalogo } from '../domain/catalogo.js';
import { crearServicioCanciones } from './canciones.service.js';
import { crearServicioImportaciones } from './importaciones.service.js';

export function crearServicios({ reloj = () => new Date(), cederTurno, registro } = {}) {
  const catalogo = new Catalogo();
  return {
    catalogo,
    canciones: crearServicioCanciones({ catalogo }),
    importaciones: crearServicioImportaciones({
      catalogo, reloj, cederTurno, registro,
    }),
  };
}
