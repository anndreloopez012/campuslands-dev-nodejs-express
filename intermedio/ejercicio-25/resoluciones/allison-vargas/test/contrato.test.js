import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { levantar } from '../soporte/cliente.js';
import { CATALOGO_RUTAS, BASE_RUTAS } from '../src/constants/rutas.js';

const METODOS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const conIds = (ruta) => ruta.replace(':itemId', '999').replace(':misionId', '999').replace(':id', '999');
const rutasUnicas = [...new Set(CATALOGO_RUTAS.map((entrada) => entrada.ruta))];
const metodosDe = (ruta) => CATALOGO_RUTAS.filter((entrada) => entrada.ruta === ruta).map((entrada) => entrada.metodo);

describe('contrato de rutas', () => {
  let cliente;

  before(async () => {
    cliente = await levantar();
  });

  after(() => cliente.cerrar());

  describe('cada ruta del catalogo existe', () => {
    for (const { metodo, ruta } of CATALOGO_RUTAS) {
      it(`${metodo} ${ruta}`, async () => {
        const opciones = { method: metodo };
        if (metodo === 'POST' || metodo === 'PATCH') {
          opciones.headers = { 'content-type': 'application/json' };
          opciones.body = '{}';
        }
        const { cuerpo } = await cliente.pedir(conIds(ruta), opciones);
        assert.notEqual(cuerpo?.codigo, 'RUTA_NO_ENCONTRADA');
        assert.notEqual(cuerpo?.codigo, 'METODO_NO_PERMITIDO');
      });
    }
  });

  describe('los metodos fuera del catalogo responden 405 con Allow', () => {
    for (const ruta of rutasUnicas) {
      const permitidos = metodosDe(ruta);
      for (const metodo of METODOS.filter((candidato) => !permitidos.includes(candidato))) {
        it(`${metodo} ${ruta}`, async () => {
          const { status, cabeceras, cuerpo } = await cliente.pedir(conIds(ruta), { method: metodo });
          assert.equal(status, 405);
          assert.equal(cuerpo.codigo, 'METODO_NO_PERMITIDO');
          const allow = cabeceras.get('allow').split(',').map((valor) => valor.trim()).sort();
          assert.deepEqual(allow, [...permitidos].sort());
        });
      }
    }
  });

  it('GET /rutas devuelve el catalogo completo', async () => {
    const { status, cuerpo } = await cliente.pedir('/rutas');
    assert.equal(status, 200);
    assert.equal(cuerpo.data.base, BASE_RUTAS);
    assert.deepEqual(cuerpo.data.rutas, CATALOGO_RUTAS);
  });

  it('la ruta principal responde con el formato del enunciado', async () => {
    const { status, cuerpo, cabeceras } = await cliente.pedir('');
    assert.equal(status, 200);
    assert.match(cabeceras.get('content-type'), /^application\/json/);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'testing de rutas' });
  });

  describe('rutas inexistentes', () => {
    const casos = [
      ['dentro del prefijo', `${BASE_RUTAS}/desconocida`],
      ['fuera del prefijo', '/otra-cosa'],
      ['raiz del servidor', '/'],
      ['subruta sobrante', `${BASE_RUTAS}/personajes/1/inventario/2/extra`],
      ['subruta que no existe', `${BASE_RUTAS}/personajes/1/habilidades`],
    ];
    for (const [nombre, ruta] of casos) {
      it(`responde 404 en JSON ${nombre}`, async () => {
        const { status, cuerpo, cabeceras } = await cliente.absoluta(ruta);
        assert.equal(status, 404);
        assert.match(cabeceras.get('content-type'), /^application\/json/);
        assert.equal(cuerpo.ok, false);
        assert.equal(cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
        assert.ok(cuerpo.message.includes(`GET ${ruta}`));
      });
    }
  });

  describe('comportamiento de Express que conviene conocer', () => {
    it('acepta la barra final', async () => {
      const { status, cuerpo } = await cliente.pedir('/personajes/');
      assert.equal(status, 200);
      assert.equal(cuerpo.paginacion.total, 5);
    });

    it('ignora mayusculas y minusculas en la ruta', async () => {
      const { status } = await cliente.absoluta(`${BASE_RUTAS.toUpperCase()}/PERSONAJES`);
      assert.equal(status, 200);
    });

    it('HEAD responde como GET pero sin body', async () => {
      const { status, cabeceras, cuerpo } = await cliente.pedir('/personajes', { method: 'HEAD' });
      assert.equal(status, 200);
      assert.equal(cabeceras.get('x-total-count'), '5');
      assert.equal(cuerpo, null);
    });

    it('OPTIONS responde 204 con Allow', async () => {
      const { status, cabeceras } = await cliente.pedir('/personajes/1', { method: 'OPTIONS' });
      assert.equal(status, 204);
      assert.equal(cabeceras.get('allow'), 'GET, PATCH, DELETE');
    });

    it('no revela el header x-powered-by', async () => {
      const { cabeceras } = await cliente.pedir('');
      assert.equal(cabeceras.get('x-powered-by'), null);
    });
  });

  describe('orden de las rutas', () => {
    it('/personajes/ranking no se confunde con /personajes/:id', async () => {
      const { status, cuerpo } = await cliente.pedir('/personajes/ranking');
      assert.equal(status, 200);
      assert.equal(cuerpo.paginacion.limite, 5);
      assert.equal(cuerpo.data[0].nombre, 'Kael');
    });

    it('una ruta con :id sigue recibiendo ids numericos', async () => {
      const { status, cuerpo } = await cliente.pedir('/personajes/2');
      assert.equal(status, 200);
      assert.equal(cuerpo.data.nombre, 'Elara');
    });
  });

  describe('ids invalidos en la ruta', () => {
    for (const id of ['abc', '0', '-1', '1.5', '1e2', '007', '%20', '99999999999']) {
      it(`GET /personajes/${id} responde 400`, async () => {
        const { status, cuerpo } = await cliente.pedir(`/personajes/${id}`);
        assert.equal(status, 400);
        assert.equal(cuerpo.codigo, 'ID_INVALIDO');
      });
    }

    it('valida cada parametro de una ruta con varios ids', async () => {
      const mal = await cliente.pedir('/personajes/1/inventario/xyz', { method: 'DELETE' });
      assert.equal(mal.status, 400);
      const malMision = await cliente.pedir('/personajes/1/misiones/0/completar', { method: 'POST' });
      assert.equal(malMision.status, 400);
    });
  });

  describe('parametros de consulta', () => {
    it('rechaza parametros desconocidos', async () => {
      const { status, cuerpo } = await cliente.pedir('/personajes?color=rojo');
      assert.equal(status, 400);
      assert.equal(cuerpo.codigo, 'CONSULTA_INVALIDA');
      assert.deepEqual(cuerpo.errores, [{ campo: 'color', mensaje: 'parametro no permitido' }]);
    });

    it('rechaza parametros repetidos', async () => {
      const { status } = await cliente.pedir('/personajes?clase=mago&clase=guerrero');
      assert.equal(status, 400);
    });
  });

  describe('body de las peticiones', () => {
    it('responde 400 si el JSON esta mal formado', async () => {
      const { status, cuerpo } = await cliente.pedir('/personajes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{"nombre": ',
      });
      assert.equal(status, 400);
      assert.equal(cuerpo.codigo, 'JSON_INVALIDO');
    });

    it('responde 415 si el Content-Type no es JSON', async () => {
      const { status, cuerpo } = await cliente.pedir('/personajes', {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: 'nombre=Nova',
      });
      assert.equal(status, 415);
      assert.equal(cuerpo.codigo, 'TIPO_NO_SOPORTADO');
    });

    it('responde 415 si no hay Content-Type', async () => {
      const { status } = await cliente.pedir('/personajes', { method: 'POST' });
      assert.equal(status, 415);
    });

    it('responde 400 si el body no es un objeto', async () => {
      const { status, cuerpo } = await cliente.json('/personajes', [1, 2]);
      assert.equal(status, 400);
      assert.equal(cuerpo.codigo, 'BODY_INVALIDO');
    });

    it('responde 413 si el body supera el limite', async () => {
      const { status, cuerpo } = await cliente.json('/personajes', { nombre: 'x'.repeat(12000), clase: 'mago' });
      assert.equal(status, 413);
      assert.equal(cuerpo.codigo, 'PAYLOAD_GRANDE');
    });

    it('acepta Content-Type con charset', async () => {
      const { status } = await cliente.pedir('/personajes', {
        method: 'POST',
        headers: { 'content-type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ nombre: 'Nova', clase: 'mago' }),
      });
      assert.equal(status, 201);
    });
  });
});
