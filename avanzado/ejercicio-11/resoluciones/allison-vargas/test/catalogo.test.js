import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Catalogo } from '../src/domain/catalogo.js';
import { cancion } from '../soporte/entorno.js';

const con = (n, cambios) => ({ ...cancion(n, cambios), version: 1 });

describe('Catalogo', () => {
  it('guarda, busca y elimina canciones', () => {
    const catalogo = new Catalogo();
    catalogo.guardar(con(1));
    assert.equal(catalogo.cantidad, 1);
    assert.equal(catalogo.obtener(cancion(1).isrc).titulo, 'Tema 1');
    assert.equal(catalogo.obtener('NOEXISTE'), null);
    catalogo.eliminar(cancion(1).isrc);
    catalogo.eliminar('NOEXISTE');
    assert.equal(catalogo.cantidad, 0);
  });

  it('cuenta canciones por artista sin importar mayusculas ni acentos', () => {
    const catalogo = new Catalogo();
    catalogo.guardar(con(1, { artista: 'Mar\u00EDa Sol' }));
    catalogo.guardar(con(2, { artista: 'Mar\u00EDa Sol' }));
    assert.equal(catalogo.hayArtista('maria SOL'), true);
    assert.equal(catalogo.nombreCanonico('MARIA sol'), 'Mar\u00EDa Sol');
    assert.equal(catalogo.nombreCanonico('Otra'), 'Otra');
    assert.deepEqual(catalogo.artistas(), [{ nombre: 'Mar\u00EDa Sol', canciones: 2 }]);
  });

  it('quita al artista cuando se queda sin canciones', () => {
    const catalogo = new Catalogo();
    catalogo.guardar(con(1));
    catalogo.eliminar(cancion(1).isrc);
    assert.equal(catalogo.hayArtista('Luna Roja'), false);
    assert.deepEqual(catalogo.artistas(), []);
  });

  it('al reemplazar una cancion mueve el conteo al artista nuevo', () => {
    const catalogo = new Catalogo();
    catalogo.guardar(con(1));
    catalogo.guardar({ ...con(1), artista: 'Faro Azul', version: 2 });
    assert.deepEqual(catalogo.artistas(), [{ nombre: 'Faro Azul', canciones: 1 }]);
  });

  it('revertir deshace en orden inverso y omite lo que cambio despues', () => {
    const catalogo = new Catalogo();
    const original = con(1);
    catalogo.guardar(original);
    const nueva = { ...original, titulo: 'Cambiado', version: 2 };
    catalogo.guardar(nueva);
    const creada = con(2);
    catalogo.guardar(creada);
    const deshacer = [
      { tipo: 'actualizar', isrc: original.isrc, anterior: original, versionNueva: 2 },
      { tipo: 'crear', isrc: creada.isrc, versionNueva: 1 },
    ];
    catalogo.guardar({ ...creada, titulo: 'Tocada por otro', version: 2 });
    const r = catalogo.revertir(deshacer, 'AHORA');
    assert.deepEqual(r, { revertidas: 1, omitidasPorCambios: 1 });
    assert.equal(catalogo.obtener(original.isrc).titulo, 'Tema 1');
    assert.equal(catalogo.obtener(original.isrc).version, 3);
    assert.equal(catalogo.obtener(creada.isrc).titulo, 'Tocada por otro');
  });
});
