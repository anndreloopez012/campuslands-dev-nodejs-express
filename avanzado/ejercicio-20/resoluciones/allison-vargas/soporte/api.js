import { crearApp, crearServicios } from '../src/app.js';
import { levantar } from './cliente.js';

export const INICIO = new Date('2026-11-05T12:00:00.000Z');

export function crearReloj(inicio = INICIO) {
  let actual = inicio.getTime();
  return { reloj: () => new Date(actual), avanzar: (ms) => { actual += ms; } };
}

// pasarela controlada desde la prueba: cada cobro queda esperando hasta que se resuelva o falle
export function crearPasarelaManual() {
  const pendientes = [];
  const cobros = [];
  let contador = 0;
  return {
    cobros,
    pendientes,
    cobrar({ monto, referencia }) {
      return new Promise((resolver, rechazar) => {
        pendientes.push({
          resolver: () => {
            contador += 1;
            const tx = { id: `tx_${contador}`, monto, referencia };
            cobros.push(tx);
            resolver(tx);
          },
          fallar: () => rechazar(new Error('timeout de la pasarela')),
        });
      });
    },
    async esperarPendiente(cantidad = 1) {
      for (let i = 0; i < 200 && pendientes.length < cantidad; i += 1) {
        await new Promise((r) => { setTimeout(r, 5); });
      }
      return pendientes.shift();
    },
  };
}

export async function levantarApi() {
  const tiempo = crearReloj();
  const pasarela = crearPasarelaManual();
  const servicios = crearServicios({ reloj: tiempo.reloj, pasarela });
  const api = await levantar(crearApp({ servicios, registro: () => {} }));
  const enviar = (ruta, cuerpo, { clave, cliente = 'cliente-uno' } = {}) => api.json(ruta, cuerpo, 'POST', {
    ...(clave === undefined ? {} : { 'idempotency-key': clave }),
    ...(cliente === null ? {} : { 'x-cliente-id': cliente }),
  });
  return {
    ...api, ...tiempo, servicios, pasarela, enviar,
  };
}

export async function conApi(prueba) {
  const api = await levantarApi();
  try {
    await prueba(api);
  } finally {
    await api.cerrar();
  }
}

export const COMISION = {
  artistaId: 2, tipo: 'personaje', descripcion: 'Una hechicera con capa de estrellas', resolucion: '4k', urgente: false,
};
