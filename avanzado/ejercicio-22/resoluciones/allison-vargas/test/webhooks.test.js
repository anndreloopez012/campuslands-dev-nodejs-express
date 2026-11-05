import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { firmar, verificarFirma } from '../src/webhooks/firma.js';
import { crearDespachador } from '../src/webhooks/despachador.js';
import { validarUrl } from '../src/validators/webhooks.js';
import {
  crearPlanificadorManual, crearReloj, crearTransporteFalso, errorTimeout,
} from '../soporte/falsos.js';

const AHORA_S = 1_793_000_000;

describe('firma', () => {
  const cuerpo = '{"id":"evt_1","tipo":"proyecto.creado"}';

  it('firma timestamp y body, y verifica con cualquiera de los secretos vigentes', () => {
    const cabecera = firmar('whsec_a', cuerpo, AHORA_S);
    assert.match(cabecera, /^t=1793000000,v1=[0-9a-f]{64}$/);
    assert.deepEqual(verificarFirma(cabecera, cuerpo, ['whsec_a'], { ahoraS: AHORA_S }), { valida: true });
    assert.deepEqual(verificarFirma(cabecera, cuerpo, ['whsec_viejo', 'whsec_a'], { ahoraS: AHORA_S + 10 }), { valida: true });
  });

  it('rechaza body alterado, otro secreto, timestamps viejos y formatos raros', () => {
    const cabecera = firmar('whsec_a', cuerpo, AHORA_S);
    const motivo = (c, b = cuerpo, s = ['whsec_a'], ahora = AHORA_S) => verificarFirma(c, b, s, { ahoraS: ahora }).motivo;
    assert.equal(motivo(cabecera, cuerpo.replace('creado', 'borrado')), 'firma incorrecta');
    assert.equal(motivo(cabecera, cuerpo, ['whsec_b']), 'firma incorrecta');
    assert.equal(motivo(cabecera, cuerpo, ['whsec_a'], AHORA_S + 301), 'timestamp fuera de tolerancia');
    assert.equal(motivo('v1=abc'), 'formato invalido');
    assert.equal(motivo(undefined), 'falta la firma');
  });
});

describe('validacion de urls', () => {
  it('bloquea esquemas raros, credenciales y direcciones internas fuera del modo local', () => {
    assert.equal(validarUrl('ftp://x.test/hook', { permitirLocal: false }), 'solo se aceptan http y https');
    assert.equal(validarUrl('https://u:p@x.test/hook', { permitirLocal: false }), 'la url no puede llevar credenciales');
    assert.equal(validarUrl('https://169.254.169.254/latest', { permitirLocal: false }), 'no se permiten direcciones internas');
    assert.equal(validarUrl('http://cliente.test/hook', { permitirLocal: false }), 'en produccion solo se acepta https');
    assert.equal(validarUrl('nada', { permitirLocal: true }), 'no es una url valida');
    assert.equal(validarUrl('http://localhost:3000/hook', { permitirLocal: true }), null);
    assert.equal(validarUrl('https://cliente.test/hook', { permitirLocal: false }), null);
  });
});

function entorno(respuestas) {
  const tiempo = crearReloj();
  const planificador = crearPlanificadorManual(tiempo);
  const transporte = crearTransporteFalso(respuestas);
  const despachador = crearDespachador({ reloj: tiempo.reloj, transporte: transporte.transporte, programar: planificador.programar });
  return {
    tiempo, planificador, transporte, despachador,
  };
}

describe('despachador', () => {
  it('envia solo a las suscripciones interesadas, con id, tipo e intento firmados', async () => {
    const { despachador, planificador, transporte } = entorno();
    const todo = despachador.suscribir({ url: 'https://a.test/h', eventos: ['*'] });
    despachador.suscribir({ url: 'https://b.test/h', eventos: ['plano.publicado'] });
    assert.match(todo.secreto, /^whsec_/);
    assert.equal(despachador.listar()[0].secreto, undefined);
    const { evento, entregas } = despachador.emitir('proyecto.creado', { id: 1 });
    assert.equal(entregas, 1);
    await planificador.correrTodo();
    const [llamada] = transporte.llamadas;
    assert.equal(llamada.url, 'https://a.test/h');
    assert.equal(llamada.cabeceras['x-webhook-id'], evento.id);
    assert.equal(llamada.cabeceras['x-webhook-evento'], 'proyecto.creado');
    assert.equal(llamada.cabeceras['x-webhook-intento'], '1');
    const ahoraS = Math.floor(Date.parse(evento.creadoEn) / 1000);
    assert.equal(verificarFirma(llamada.cabeceras['x-firma'], llamada.cuerpo, [todo.secreto], { ahoraS }).valida, true);
    assert.equal(despachador.entregas()[0].estado, 'entregada');
  });

  it('reintenta con espera exponencial y deja la entrega como fallida al quinto intento', async () => {
    const { despachador, planificador } = entorno([500, 503, errorTimeout(), 502, 500]);
    despachador.suscribir({ url: 'https://a.test/h', eventos: ['*'] });
    despachador.emitir('proyecto.creado', {});
    await planificador.correrTodo();
    assert.deepEqual(planificador.esperas, [0, 1000, 2000, 4000, 8000]);
    const [entrega] = despachador.entregas();
    assert.equal(entrega.estado, 'fallida');
    assert.deepEqual(entrega.intentos.map((i) => i.status ?? i.error), [500, 503, 'tiempo agotado', 502, 500]);
    assert.equal(despachador.entregas({ estado: 'fallida' }).length, 1);
    despachador.reintentar(entrega.id);
    await planificador.correrTodo();
    assert.equal(despachador.entrega(entrega.id).estado, 'entregada');
    assert.throws(() => despachador.reintentar(entrega.id), (e) => e.codigo === 'ENTREGA_NO_REINTENTABLE');
  });

  it('un 410 desactiva la suscripcion y deja de enviarle eventos', async () => {
    const { despachador, planificador, transporte } = entorno([410]);
    const sus = despachador.suscribir({ url: 'https://a.test/h', eventos: ['*'] });
    despachador.emitir('proyecto.creado', {});
    await planificador.correrTodo();
    assert.equal(despachador.obtener(sus.id).activa, false);
    assert.equal(despachador.entregas()[0].estado, 'descartada');
    assert.equal(despachador.emitir('proyecto.aprobado', {}).entregas, 0);
    despachador.reactivar(sus.id);
    despachador.emitir('proyecto.aprobado', {});
    await planificador.correrTodo();
    assert.equal(transporte.llamadas.length, 2);
  });

  it('rota el secreto: firma con el nuevo y el anterior vence a las 24 horas', async () => {
    const { despachador, planificador, transporte, tiempo } = entorno();
    const sus = despachador.suscribir({ url: 'https://a.test/h', eventos: ['*'] });
    const rotada = despachador.rotarSecreto(sus.id);
    assert.equal(rotada.rotacionPendiente, true);
    assert.equal(rotada.anteriorValidoHasta, '2026-11-06T12:00:00.000Z');
    despachador.emitir('proyecto.creado', {});
    await planificador.correrTodo();
    const { cabeceras, cuerpo } = transporte.llamadas[0];
    const ahoraS = Math.floor(tiempo.reloj().getTime() / 1000);
    assert.equal(verificarFirma(cabeceras['x-firma'], cuerpo, [sus.secreto], { ahoraS }).valida, false);
    assert.equal(verificarFirma(cabeceras['x-firma'], cuerpo, [rotada.secreto], { ahoraS }).valida, true);
    tiempo.avanzar(24 * 60 * 60 * 1000);
    const otra = despachador.rotarSecreto(sus.id);
    assert.equal(otra.rotacionPendiente, true);
    despachador.eliminar(sus.id);
    assert.throws(() => despachador.obtener(sus.id), (e) => e.codigo === 'SUSCRIPCION_NO_ENCONTRADA');
  });

  it('descarta entregas pendientes si la suscripcion ya no existe', async () => {
    const { despachador, planificador, transporte } = entorno();
    const sus = despachador.suscribir({ url: 'https://a.test/h', eventos: ['*'] });
    despachador.emitir('proyecto.creado', {});
    despachador.eliminar(sus.id);
    await planificador.correrTodo();
    assert.equal(transporte.llamadas.length, 0);
    assert.equal(despachador.entregas()[0].estado, 'descartada');
  });
});
