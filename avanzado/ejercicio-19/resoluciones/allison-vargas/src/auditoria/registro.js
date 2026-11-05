import { crear } from '../errores/index.js';
import { GENESIS, calcularHash, diferencias, verificarCadena } from './cadena.js';

export const CAMPOS_PROTEGIDOS = Object.freeze(['alergias', 'telefono', 'email', 'documento']);
export const RESULTADOS = Object.freeze(['exito', 'denegado', 'fallido']);

const PROTEGIDO = '[PROTEGIDO]';

// el diff se calcula con los valores reales, pero los datos sensibles no se copian al registro:
// queda constancia de que cambiaron, no de su contenido
function protegerCambios(cambios) {
  return cambios.map((c) => (CAMPOS_PROTEGIDOS.includes(c.campo.split('.').at(-1))
    ? { campo: c.campo, antes: PROTEGIDO, despues: PROTEGIDO, protegido: true }
    : c));
}

const congelar = (objeto) => {
  for (const valor of Object.values(objeto)) if (valor && typeof valor === 'object') congelar(valor);
  return Object.freeze(objeto);
};

export function crearRegistroAuditoria({ reloj, alEscribir = () => {} }) {
  const entradas = [];

  return {
    registrar({
      actor, accion, recurso, resultado = 'exito', antes, despues, motivo, contexto = {},
    }) {
      if (!RESULTADOS.includes(resultado)) throw new TypeError(`Resultado desconocido: ${resultado}`);
      const cambios = antes === undefined && despues === undefined
        ? []
        : protegerCambios(diferencias(antes ?? {}, despues ?? {}));
      const entrada = {
        secuencia: entradas.length + 1,
        momento: reloj().toISOString(),
        actor: { id: actor.id, rol: actor.rol },
        accion,
        recurso,
        resultado,
        cambios,
        motivo: motivo ?? null,
        requestId: contexto.requestId ?? null,
        ip: contexto.ip ?? null,
        hashAnterior: entradas.at(-1)?.hash ?? GENESIS,
      };
      entrada.hash = calcularHash(entrada);
      try {
        // aca iria la escritura a un almacenamiento externo; si falla, la accion no debe quedar aplicada
        alEscribir(entrada);
      } catch (error) {
        throw crear('AUDITORIA_NO_DISPONIBLE', {}, { causa: error });
      }
      entradas.push(congelar(entrada));
      return entrada;
    },

    consultar({
      actorId, accion, recursoTipo, recursoId, resultado, desde, hasta, despuesDe = 0, limite = 50,
    } = {}) {
      const encontradas = entradas.filter((e) => e.secuencia > despuesDe
        && (actorId === undefined || e.actor.id === actorId)
        && (!accion || e.accion === accion || e.accion.startsWith(`${accion}.`))
        && (!recursoTipo || e.recurso.tipo === recursoTipo)
        && (recursoId === undefined || e.recurso.id === recursoId)
        && (!resultado || e.resultado === resultado)
        && (!desde || e.momento >= desde)
        && (!hasta || e.momento <= hasta));
      const pagina = encontradas.slice(0, limite);
      return {
        data: pagina,
        siguiente: encontradas.length > limite ? pagina.at(-1).secuencia : null,
      };
    },

    verificar: () => verificarCadena(entradas),
    todas: () => [...entradas],
    get total() { return entradas.length; },
  };
}
