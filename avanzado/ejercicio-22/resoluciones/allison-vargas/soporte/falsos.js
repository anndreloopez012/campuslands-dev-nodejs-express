export const INICIO = new Date('2026-11-05T12:00:00.000Z');

export function crearReloj(inicio = INICIO) {
  let actual = inicio.getTime();
  return { reloj: () => new Date(actual), avanzar: (ms) => { actual += ms; } };
}

// en vez de setTimeout guarda las tareas; la prueba decide cuando correrlas y ve las esperas pedidas
export function crearPlanificadorManual(tiempo) {
  const pendientes = [];
  const esperas = [];
  return {
    esperas,
    programar: (fn, ms) => {
      esperas.push(ms);
      pendientes.push({ fn, ms });
    },
    async correrTodo(limite = 50) {
      for (let i = 0; i < limite && pendientes.length; i += 1) {
        const { fn, ms } = pendientes.shift();
        tiempo?.avanzar(ms);
        await fn();
      }
    },
    get pendientes() { return pendientes.length; },
  };
}

// transporte que responde con los status que la prueba indique, en orden
export function crearTransporteFalso(respuestas = []) {
  const llamadas = [];
  const cola = [...respuestas];
  return {
    llamadas,
    responder: (...mas) => cola.push(...mas),
    async transporte(peticion) {
      llamadas.push(peticion);
      const siguiente = cola.length ? cola.shift() : 200;
      if (siguiente instanceof Error) throw siguiente;
      return { status: siguiente };
    },
  };
}

export const errorTimeout = () => Object.assign(new Error('The operation was aborted due to timeout'), { name: 'TimeoutError' });
