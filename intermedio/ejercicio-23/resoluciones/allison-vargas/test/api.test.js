import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../src/app.js';

let servidor;
let base;

before(async () => {
  await new Promise((resolver) => {
    servidor = app.listen(0, resolver);
  });
  base = `http://127.0.0.1:${servidor.address().port}/intermedio/ejercicio-23`;
});

after(() => new Promise((resolver) => servidor.close(resolver)));

async function pedir(ruta, opciones) {
  const respuesta = await fetch(`${base}${ruta}`, opciones);
  const texto = await respuesta.text();
  return { respuesta, cuerpo: texto ? JSON.parse(texto) : null };
}

const enviarJson = (ruta, cuerpo, metodo = 'POST') =>
  pedir(ruta, { method: metodo, headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) });

const procedimientoValido = {
  proceso: 'mig',
  material: 'acero_carbono',
  voltaje: 24,
  amperaje: 200,
  velocidadMmMin: 300,
  espesorMm: 10,
  soldador: 'Ana Ruiz',
};

describe('ruta principal', () => {
  it('responde el mensaje del ejercicio', async () => {
    const { respuesta, cuerpo } = await pedir('');
    assert.equal(respuesta.status, 200);
    assert.deepEqual(cuerpo, { ok: true, message: 'Ejercicio ejecutado correctamente', topic: 'testing con node test' });
  });

  it('responde 404 en una ruta desconocida', async () => {
    const { respuesta, cuerpo } = await pedir('/nada');
    assert.equal(respuesta.status, 404);
    assert.equal(cuerpo.codigo, 'RUTA_NO_ENCONTRADA');
  });
});

describe('POST /calculos/calor', () => {
  it('calcula el aporte de calor', async () => {
    const { respuesta, cuerpo } = await enviarJson('/calculos/calor', {
      proceso: 'mig', material: 'acero_carbono', voltaje: 24, amperaje: 200, velocidadMmMin: 300,
    });
    assert.equal(respuesta.status, 200);
    assert.equal(cuerpo.data.calorKjMm, 0.768);
    assert.equal(cuerpo.data.clasificacion, 'bajo');
    assert.equal(cuerpo.data.dentroDeLimite, true);
  });

  it('responde 400 con la lista de campos faltantes', async () => {
    const { respuesta, cuerpo } = await enviarJson('/calculos/calor', {});
    assert.equal(respuesta.status, 400);
    assert.equal(cuerpo.codigo, 'VALIDACION');
    assert.equal(cuerpo.errores.length, 5);
  });

  it('responde 400 si los parametros no corresponden al proceso', async () => {
    const { respuesta, cuerpo } = await enviarJson('/calculos/calor', {
      proceso: 'tig', material: 'aluminio', voltaje: 40, amperaje: 100, velocidadMmMin: 100,
    });
    assert.equal(respuesta.status, 400);
    assert.equal(cuerpo.codigo, 'RANGO_DE_PROCESO');
  });

  it('responde 400 si el body no es un JSON valido', async () => {
    const { respuesta, cuerpo } = await pedir('/calculos/calor', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{"proceso":',
    });
    assert.equal(respuesta.status, 400);
    assert.equal(cuerpo.codigo, 'JSON_INVALIDO');
  });

  it('responde 405 con el header Allow si el metodo no corresponde', async () => {
    const { respuesta, cuerpo } = await pedir('/calculos/calor');
    assert.equal(respuesta.status, 405);
    assert.equal(respuesta.headers.get('allow'), 'POST');
    assert.equal(cuerpo.codigo, 'METODO_NO_PERMITIDO');
  });
});

describe('GET /calculos/catalogo', () => {
  it('lista procesos y materiales', async () => {
    const { respuesta, cuerpo } = await pedir('/calculos/catalogo');
    assert.equal(respuesta.status, 200);
    assert.deepEqual(cuerpo.data.procesos.map((item) => item.clave), ['mig', 'tig', 'electrodo', 'arcosumergido']);
    assert.equal(cuerpo.data.materiales.length, 3);
  });
});

describe('GET /procedimientos', () => {
  it('lista los procedimientos con paginacion y X-Total-Count', async () => {
    const { respuesta, cuerpo } = await pedir('/procedimientos');
    assert.equal(respuesta.status, 200);
    assert.equal(cuerpo.data.length, 3);
    assert.equal(respuesta.headers.get('x-total-count'), '3');
    assert.deepEqual(cuerpo.paginacion, { pagina: 1, limite: 10, total: 3, totalPaginas: 1 });
  });

  it('filtra por estado', async () => {
    const { cuerpo } = await pedir('/procedimientos?estado=aprobado');
    assert.deepEqual(cuerpo.data.map((item) => item.id), [1]);
  });

  it('ordena por calor de mayor a menor', async () => {
    const { cuerpo } = await pedir('/procedimientos?orden=calor');
    assert.deepEqual(cuerpo.data.map((item) => item.id), [3, 1, 2]);
  });

  it('pagina los resultados', async () => {
    const { cuerpo } = await pedir('/procedimientos?limite=2&pagina=2');
    assert.deepEqual(cuerpo.data.map((item) => item.id), [3]);
    assert.equal(cuerpo.paginacion.totalPaginas, 2);
  });

  it('responde 400 con un filtro invalido', async () => {
    const { respuesta, cuerpo } = await pedir('/procedimientos?proceso=laser');
    assert.equal(respuesta.status, 400);
    assert.equal(cuerpo.codigo, 'CONSULTA_INVALIDA');
  });
});

describe('GET /procedimientos/:id', () => {
  it('devuelve un procedimiento existente', async () => {
    const { respuesta, cuerpo } = await pedir('/procedimientos/2');
    assert.equal(respuesta.status, 200);
    assert.equal(cuerpo.data.proceso, 'tig');
  });

  it('responde 404 si no existe', async () => {
    const { respuesta, cuerpo } = await pedir('/procedimientos/99');
    assert.equal(respuesta.status, 404);
    assert.equal(cuerpo.codigo, 'PROCEDIMIENTO_NO_ENCONTRADO');
  });

  it('responde 400 si el id no es valido', async () => {
    const { respuesta } = await pedir('/procedimientos/abc');
    assert.equal(respuesta.status, 400);
  });
});

describe('POST /procedimientos', () => {
  it('crea un procedimiento y lo deja consultable', async () => {
    const antes = await pedir('/procedimientos');
    const { respuesta, cuerpo } = await enviarJson('/procedimientos', procedimientoValido);

    assert.equal(respuesta.status, 201);
    assert.equal(respuesta.headers.get('location'), `/intermedio/ejercicio-23/procedimientos/${cuerpo.data.id}`);
    assert.equal(cuerpo.data.estado, 'borrador');
    assert.equal(cuerpo.data.calorKjMm, 0.768);

    const despues = await pedir('/procedimientos');
    assert.equal(despues.cuerpo.paginacion.total, antes.cuerpo.paginacion.total + 1);

    const detalle = await pedir(`/procedimientos/${cuerpo.data.id}`);
    assert.equal(detalle.respuesta.status, 200);
    assert.equal(detalle.cuerpo.data.soldador, 'Ana Ruiz');
  });

  it('responde 400 si faltan campos', async () => {
    const { respuesta, cuerpo } = await enviarJson('/procedimientos', { proceso: 'mig' });
    assert.equal(respuesta.status, 400);
    assert.ok(cuerpo.errores.some((item) => item.campo === 'soldador'));
  });

  it('responde 422 si el calor supera el limite del material', async () => {
    const { respuesta, cuerpo } = await enviarJson('/procedimientos', {
      ...procedimientoValido, proceso: 'arcosumergido', material: 'acero_inoxidable', voltaje: 32, amperaje: 600, velocidadMmMin: 400,
    });
    assert.equal(respuesta.status, 422);
    assert.equal(cuerpo.codigo, 'CALOR_EXCEDIDO');
  });

  it('responde 422 si el amperaje no corresponde al proceso', async () => {
    const { respuesta, cuerpo } = await enviarJson('/procedimientos', { ...procedimientoValido, proceso: 'tig', voltaje: 12, amperaje: 450 });
    assert.equal(respuesta.status, 422);
    assert.equal(cuerpo.codigo, 'RANGO_DE_PROCESO');
    assert.equal(cuerpo.errores[0].campo, 'amperaje');
  });
});

describe('POST /procedimientos/:id/aprobar', () => {
  it('aprueba un borrador y rechaza aprobarlo otra vez', async () => {
    const primero = await enviarJson('/procedimientos/2/aprobar', {});
    assert.equal(primero.respuesta.status, 200);
    assert.equal(primero.cuerpo.data.estado, 'aprobado');

    const segundo = await enviarJson('/procedimientos/2/aprobar', {});
    assert.equal(segundo.respuesta.status, 409);
    assert.equal(segundo.cuerpo.codigo, 'PROCEDIMIENTO_YA_APROBADO');
  });

  it('responde 404 si no existe', async () => {
    const { respuesta } = await enviarJson('/procedimientos/99/aprobar', {});
    assert.equal(respuesta.status, 404);
  });

  it('responde 405 con PUT', async () => {
    const { respuesta } = await enviarJson('/procedimientos/1', {}, 'PUT');
    assert.equal(respuesta.status, 405);
  });
});
