import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { levantarLegacy, levantarRefactor } from '../soporte/legacy.js';

const quitarNuevos = (valor) => {
  if (Array.isArray(valor)) return valor.map(quitarNuevos);
  if (valor && typeof valor === 'object') {
    const { posicion, ...resto } = valor;
    return resto;
  }
  return valor;
};

describe('equivalencia entre la version original y la refactorizada', () => {
  let antes;
  let despues;

  beforeEach(async () => {
    antes = await levantarLegacy();
    despues = await levantarRefactor();
  });

  afterEach(async () => {
    await antes.cerrar();
    await despues.cerrar();
  });

  const ambos = async (ruta, cuerpo, metodo = 'POST') => {
    const viejo = cuerpo === undefined ? await antes.pedir(ruta) : await antes.json(ruta, cuerpo, metodo);
    const nuevo = cuerpo === undefined ? await despues.pedir(ruta) : await despues.json(ruta, cuerpo, metodo);
    return { viejo, nuevo };
  };

  const igual = async (ruta, cuerpo) => {
    const { viejo, nuevo } = await ambos(ruta, cuerpo);
    assert.equal(nuevo.cuerpo.ok, true, ruta);
    assert.deepEqual(quitarNuevos(nuevo.cuerpo.data), viejo.cuerpo, ruta);
    return nuevo;
  };

  async function cargarTorneo() {
    const equipos = [
      ['Leones', 'futbol'], ['Tigres', 'futbol'], ['Aguilas', 'futbol'], ['Halcones', 'futbol'],
      ['Rayos', 'futbol_sala'], ['Truenos', 'futbol_sala'], ['Cometas', 'futbol_sala'],
    ];
    for (const [nombre, modalidad] of equipos) await igual('/equipos', { nombre, modalidad });
    const partidos = [[1, 2, 2, 1], [3, 4, 0, 0], [1, 3, 3, 1], [2, 4, 2, 0], [4, 1, 1, 4], [5, 6, 4, 2], [6, 7, 1, 1], [7, 5, 0, 3]];
    for (const [localId, visitanteId, golesLocal, golesVisitante] of partidos) {
      await igual('/partidos', { localId, visitanteId, golesLocal, golesVisitante });
    }
  }

  it('la ruta principal responde lo mismo', async () => {
    const { viejo, nuevo } = await ambos('');
    assert.deepEqual(nuevo.cuerpo, viejo.cuerpo);
  });

  it('crear equipos y partidos devuelve los mismos datos', async () => {
    await cargarTorneo();
  });

  it('los listados devuelven lo mismo, con o sin filtro', async () => {
    await cargarTorneo();
    for (const ruta of ['/equipos', '/equipos?modalidad=futbol', '/equipos?modalidad=futbol_sala', '/equipos/3', '/equipos/7']) {
      const { viejo, nuevo } = await ambos(ruta);
      assert.deepEqual(nuevo.cuerpo.data, viejo.cuerpo, ruta);
    }
    const { viejo, nuevo } = await ambos('/partidos');
    assert.deepEqual(nuevo.cuerpo.data, viejo.cuerpo);
  });

  it('la tabla de cada modalidad es la misma, salvo el campo nuevo posicion', async () => {
    await cargarTorneo();
    for (const modalidad of ['futbol', 'futbol_sala']) {
      const { viejo, nuevo } = await ambos(`/tabla?modalidad=${modalidad}`);
      assert.deepEqual(quitarNuevos(nuevo.cuerpo.data), viejo.cuerpo, modalidad);
      assert.deepEqual(nuevo.cuerpo.data.map((f) => f.posicion), nuevo.cuerpo.data.map((_, i) => i + 1));
    }
  });

  describe('cambios intencionales en los errores', () => {
    const casos = [
      ['equipo sin datos', '/equipos', {}, 'faltan datos', 400],
      ['equipo con modalidad desconocida', '/equipos', { nombre: 'Pumas', modalidad: 'rugby' }, 'modalidad invalida', 400],
      ['equipo repetido', '/equipos', { nombre: 'leones', modalidad: 'futbol' }, 'ya existe', 409],
      ['partido sin datos', '/partidos', {}, 'faltan datos', 400],
      ['partido con equipo inexistente', '/partidos', { localId: 1, visitanteId: 40, golesLocal: 1, golesVisitante: 0 }, 'equipo no existe', 422],
      ['partido de un equipo contra si mismo', '/partidos', { localId: 1, visitanteId: 1, golesLocal: 1, golesVisitante: 0 }, 'mismo equipo', 422],
      ['partido entre modalidades', '/partidos', { localId: 1, visitanteId: 5, golesLocal: 1, golesVisitante: 0 }, 'modalidades distintas', 422],
    ];

    for (const [nombre, ruta, cuerpo, mensajeViejo, statusNuevo] of casos) {
      it(`${nombre}: antes 200 con error, ahora ${statusNuevo}`, async () => {
        await cargarTorneo();
        const { viejo, nuevo } = await ambos(ruta, cuerpo);
        assert.equal(viejo.status, 200);
        assert.equal(viejo.cuerpo.error, mensajeViejo);
        assert.equal(nuevo.status, statusNuevo);
        assert.equal(nuevo.cuerpo.ok, false);
        assert.equal(typeof nuevo.cuerpo.codigo, 'string');
      });
    }

    it('lo rechazado no cambia el estado en ninguna de las dos versiones', async () => {
      await cargarTorneo();
      for (const [, ruta, cuerpo] of casos) await ambos(ruta, cuerpo);
      const { viejo, nuevo } = await ambos('/partidos');
      assert.equal(viejo.cuerpo.length, 8);
      assert.equal(nuevo.cuerpo.data.length, 8);
    });

    it('consultar un equipo inexistente: antes 200 con error, ahora 404', async () => {
      const { viejo, nuevo } = await ambos('/equipos/9');
      assert.deepEqual(viejo.cuerpo, { error: 'no existe' });
      assert.equal(viejo.status, 200);
      assert.equal(nuevo.status, 404);
    });

    it('tabla sin modalidad o con modalidad invalida: antes 200 con error, ahora 400', async () => {
      for (const [ruta, mensaje] of [['/tabla', 'falta modalidad'], ['/tabla?modalidad=rugby', 'modalidad invalida']]) {
        const { viejo, nuevo } = await ambos(ruta);
        assert.equal(viejo.status, 200);
        assert.equal(viejo.cuerpo.error, mensaje);
        assert.equal(nuevo.status, 400);
      }
    });
  });

  describe('correcciones de comportamiento', () => {
    it('los goles como texto o negativos ya no se aceptan', async () => {
      await igual('/equipos', { nombre: 'Leones', modalidad: 'futbol' });
      await igual('/equipos', { nombre: 'Tigres', modalidad: 'futbol' });
      for (const [golesLocal, golesVisitante] of [['2', '1'], [-3, 1]]) {
        const { viejo, nuevo } = await ambos('/partidos', { localId: 1, visitanteId: 2, golesLocal, golesVisitante });
        assert.equal(viejo.cuerpo.error, undefined);
        assert.equal(nuevo.status, 400);
      }
      assert.equal((await despues.pedir('/partidos')).cuerpo.data.length, 0);
    });

    it('los empates en la tabla se resuelven por goles a favor y luego por nombre', async () => {
      for (const nombre of ['Zorros', 'Alces', 'Bravos', 'Cobras']) await igual('/equipos', { nombre, modalidad: 'futbol' });
      await igual('/partidos', { localId: 1, visitanteId: 2, golesLocal: 1, golesVisitante: 1 });
      await igual('/partidos', { localId: 3, visitanteId: 4, golesLocal: 2, golesVisitante: 2 });
      const { viejo, nuevo } = await ambos('/tabla?modalidad=futbol');
      assert.deepEqual(viejo.cuerpo.map((f) => f.nombre), ['Zorros', 'Alces', 'Bravos', 'Cobras']);
      assert.deepEqual(nuevo.cuerpo.data.map((f) => f.nombre), ['Bravos', 'Cobras', 'Alces', 'Zorros']);
    });
  });
});
