import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SRC = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../src');
const MODULOS = path.join(SRC, 'modulos');

function archivos(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entrada) => {
    const ruta = path.join(dir, entrada.name);
    if (entrada.isDirectory()) return archivos(ruta);
    return ruta.endsWith('.js') ? [ruta] : [];
  });
}

function importaciones(archivo) {
  const texto = readFileSync(archivo, 'utf-8');
  return [...texto.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => m[1]);
}

const relativas = (archivo) => importaciones(archivo)
  .filter((destino) => destino.startsWith('.'))
  .map((destino) => path.resolve(path.dirname(archivo), destino));

const dentroDe = (ruta, carpeta) => ruta === carpeta || ruta.startsWith(`${carpeta}${path.sep}`);
const relativo = (ruta) => path.relative(SRC, ruta);

const carpetasDeModulos = readdirSync(MODULOS, { withFileTypes: true })
  .filter((entrada) => entrada.isDirectory())
  .map((entrada) => entrada.name);

describe('reglas de arquitectura', () => {
  it('el analizador encuentra los modulos y sus imports', () => {
    assert.deepEqual(carpetasDeModulos.sort(), ['clasificacion', 'jugadores', 'partidas']);
    const destinos = relativas(path.join(MODULOS, 'partidas/index.js')).map(relativo);
    assert.ok(destinos.includes(path.join('modulos', 'partidas', 'partidas.service.js')));
  });

  for (const carpeta of carpetasDeModulos) {
    it(`el modulo ${carpeta} no importa archivos de otros modulos`, () => {
      const propia = path.join(MODULOS, carpeta);
      const ajenas = carpetasDeModulos.filter((otra) => otra !== carpeta).map((otra) => path.join(MODULOS, otra));
      const infracciones = [];
      for (const archivo of archivos(propia)) {
        for (const destino of relativas(archivo)) {
          const prohibido = ajenas.some((ajena) => dentroDe(destino, ajena))
            || destino === path.join(MODULOS, 'index.js')
            || destino === path.join(SRC, 'app.js');
          if (prohibido) infracciones.push(`${relativo(archivo)} -> ${relativo(destino)}`);
        }
      }
      assert.deepEqual(infracciones, []);
    });
  }

  it('el codigo compartido nunca depende de los modulos ni de la app', () => {
    const compartidas = ['core', 'config', 'middlewares', 'utils', 'validators', 'repositories', 'constants']
      .map((nombre) => path.join(SRC, nombre));
    const infracciones = [];
    for (const carpeta of compartidas) {
      for (const archivo of archivos(carpeta)) {
        for (const destino of relativas(archivo)) {
          if (dentroDe(destino, MODULOS) || destino === path.join(SRC, 'app.js')) {
            infracciones.push(`${relativo(archivo)} -> ${relativo(destino)}`);
          }
        }
      }
    }
    assert.deepEqual(infracciones, []);
  });

  it('el nucleo no conoce Express', () => {
    const conExpress = archivos(path.join(SRC, 'core')).filter((archivo) => importaciones(archivo).includes('express'));
    assert.deepEqual(conExpress.map(relativo), []);
  });

  it('los servicios no conocen HTTP ni las rutas', () => {
    const infracciones = [];
    for (const archivo of archivos(MODULOS).filter((a) => a.endsWith('.service.js'))) {
      if (importaciones(archivo).includes('express')) infracciones.push(`${relativo(archivo)} importa express`);
      for (const destino of relativas(archivo)) {
        if (destino.endsWith('.routes.js')) infracciones.push(`${relativo(archivo)} importa rutas`);
      }
    }
    assert.deepEqual(infracciones, []);
  });

  it('las rutas llegan a los datos solo a traves del servicio', () => {
    const infracciones = [];
    for (const archivo of archivos(MODULOS).filter((a) => a.endsWith('.routes.js'))) {
      for (const destino of relativas(archivo)) {
        if (dentroDe(destino, path.join(SRC, 'repositories')) || destino.endsWith('.store.js')) {
          infracciones.push(`${relativo(archivo)} -> ${relativo(destino)}`);
        }
      }
    }
    assert.deepEqual(infracciones, []);
  });
});
