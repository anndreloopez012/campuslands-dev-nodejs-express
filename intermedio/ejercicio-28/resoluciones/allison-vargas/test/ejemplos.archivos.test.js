import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PASOS, SECCIONES } from '../src/ejemplos/catalogo.js';
import { generarArchivos, URL_BASE } from '../src/ejemplos/archivos.js';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const archivos = generarArchivos();
const leer = (ruta) => readFileSync(resolve(raiz, ruta), 'utf8');

describe('archivos de ejemplos generados', () => {
  it('los archivos guardados en el repositorio estan al dia con el catalogo', () => {
    for (const [ruta, contenido] of Object.entries(archivos)) {
      assert.equal(leer(ruta), contenido, `${ruta} esta desactualizado, ejecuta npm run ejemplos:generar`);
    }
  });

  it('generar dos veces produce exactamente lo mismo', () => {
    assert.deepEqual(generarArchivos(), archivos);
  });

  describe('archivo .http', () => {
    const http = archivos['ejemplos/battle-royale.http'];

    it('declara la URL base y una peticion con nombre por cada paso', () => {
      assert.ok(http.includes(`@base = ${URL_BASE}`));
      for (const paso of PASOS) {
        assert.ok(http.includes(`# @name ${paso.id}\n${paso.metodo} {{base}}`), paso.id);
        assert.ok(http.includes(`### ${paso.titulo} (espera ${paso.esperado})`), paso.id);
      }
    });

    it('lee los ids de las respuestas anteriores', () => {
      assert.ok(http.includes('@jugadorA = {{crearJugadorA.response.body.$.data.id}}'));
      assert.ok(http.includes('@partidaId = {{crearPartida.response.body.$.data.id}}'));
      assert.ok(http.includes('POST {{base}}/partidas/{{partidaId}}/jugadores'));
    });

    it('usa numeros aleatorios para que los nicks no se repitan', () => {
      assert.ok(http.includes('"nick": "Ana_{{$randomInt 1000 9999}}"'));
    });

    it('no deja llaves simples sin resolver', () => {
      assert.equal(/(?<!\{)\{[A-Za-z]+\}(?!\})/.test(http), false);
    });
  });

  describe('coleccion de Postman', () => {
    const coleccion = JSON.parse(archivos['ejemplos/battle-royale.postman_collection.json']);
    const items = coleccion.item.flatMap((carpeta) => carpeta.item);

    it('tiene el esquema v2.1 y la variable base', () => {
      assert.match(coleccion.info.schema, /v2\.1\.0/);
      assert.deepEqual(coleccion.variable, [{ key: 'base', value: URL_BASE }]);
    });

    it('organiza las carpetas como las secciones del catalogo', () => {
      assert.deepEqual(coleccion.item.map((c) => c.name), SECCIONES);
      assert.equal(items.length, PASOS.length);
    });

    it('cada peticion verifica su status y usa la variable base', () => {
      items.forEach((item, i) => {
        const paso = PASOS.find((p) => item.name.startsWith(p.titulo));
        assert.ok(paso, item.name);
        assert.equal(item.request.method, paso.metodo);
        assert.ok(item.request.url.raw.startsWith('{{base}}/') || item.request.url.raw === '{{base}}/');
        assert.ok(item.event[0].script.exec[0].includes(`status(${paso.esperado})`), String(i));
      });
    });

    it('guarda las variables de las respuestas', () => {
      const crear = items.find((i) => i.name.startsWith('Crear el jugador A'));
      const codigo = crear.event[0].script.exec.join('\n');
      assert.ok(codigo.includes("pm.collectionVariables.set('jugadorA', cuerpo.data.id);"));
      assert.ok(codigo.includes("pm.collectionVariables.set('nickA', cuerpo.data.nick);"));
    });

    it('separa la consulta de la ruta y marca el cuerpo como json o texto', () => {
      const listado = items.find((i) => i.name.startsWith('Listar jugadores de latam'));
      assert.deepEqual(listado.request.url.path, ['jugadores']);
      assert.deepEqual(listado.request.url.query, [
        { key: 'region', value: 'latam' },
        { key: 'orden', value: 'kills' },
        { key: 'limite', value: '3' },
      ]);
      const texto = items.find((i) => i.name.startsWith('Enviar un body'));
      assert.equal(texto.request.body.options.raw.language, 'text');
      assert.deepEqual(texto.request.header, [{ key: 'Content-Type', value: 'text/plain' }]);
      const json = items.find((i) => i.name.startsWith('Crear el jugador B'));
      assert.equal(json.request.body.options.raw.language, 'json');
    });
  });

  describe('script de PowerShell', () => {
    const ps1 = archivos['ejemplos/battle-royale.ps1'];

    it('recibe la URL base como parametro', () => {
      assert.ok(ps1.startsWith(`param([string]$base = "${URL_BASE}")`));
    });

    it('invoca un paso por cada ejemplo con su status esperado', () => {
      const llamadas = ps1.split('\n').filter((l) => /\bPaso "/.test(l));
      assert.equal(llamadas.length, PASOS.length);
      PASOS.forEach((paso, i) => {
        assert.ok(llamadas[i].includes(`"${paso.titulo}" "${paso.metodo}"`), paso.id);
        assert.ok(llamadas[i].includes(` ${paso.esperado}`), paso.id);
      });
    });

    it('interpola variables de PowerShell en rutas y cuerpos', () => {
      assert.ok(ps1.includes('"/partidas/$partidaId/jugadores"'));
      assert.ok(ps1.includes('"nick": "Ana_$aleatorio"'));
      assert.ok(ps1.includes('$jugadorA = $r.data.id'));
      assert.equal(/\{(aleatorio|jugadorA|partidaId)\}/.test(ps1), false);
    });
  });

  describe('script de bash', () => {
    const sh = archivos['ejemplos/battle-royale.sh'];

    it('empieza con shebang y acepta la URL base como argumento', () => {
      assert.ok(sh.startsWith('#!/usr/bin/env bash\n'));
      assert.ok(sh.includes(`base="\${1:-${URL_BASE}}"`));
    });

    it('invoca un paso por cada ejemplo', () => {
      const llamadas = sh.split('\n').filter((l) => l.startsWith('paso "'));
      assert.equal(llamadas.length, PASOS.length);
      PASOS.forEach((paso, i) => {
        assert.ok(llamadas[i].startsWith(`paso "${paso.titulo}" ${paso.metodo} `), paso.id);
      });
    });

    it('arma el cuerpo en una linea y captura los ids', () => {
      assert.ok(sh.includes(`'{ "jugadorId": '"$jugadorA"' }'`));
      assert.ok(sh.includes('jugadorA=$(campo id)'));
      assert.ok(sh.includes('nickA=$(campo nick)'));
      assert.ok(sh.includes('"/partidas/$partidaId/eliminaciones"'));
    });
  });
});
