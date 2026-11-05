import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { AlmacenDePartidos } from '../domain/almacen.js';
import { crearImportador } from './importador.service.js';
import { crearServicioImportaciones } from './importaciones.service.js';
import { crearServicioJugadores } from './jugadores.service.js';
import { crearServicioPartidos } from './partidos.service.js';

const archivoSemilla = path.join(path.dirname(fileURLToPath(import.meta.url)), '../data/partidos.csv');

export function crearServicios({ reloj = () => new Date(), semilla = readFileSync(archivoSemilla) } = {}) {
  const almacen = new AlmacenDePartidos();
  const importador = crearImportador({ almacen, reloj });
  if (semilla && semilla.length > 0) {
    importador.importar(Buffer.from(semilla), {
      charset: 'utf-8', delimitador: 'auto', modo: 'permisivo', dryRun: false, nombre: 'partidos.csv', origen: 'semilla',
    });
  }
  return {
    importador,
    partidos: crearServicioPartidos({ almacen }),
    jugadores: crearServicioJugadores({ almacen }),
    importaciones: crearServicioImportaciones({ almacen }),
  };
}
