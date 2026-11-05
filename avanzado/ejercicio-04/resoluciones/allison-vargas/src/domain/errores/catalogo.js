import {
  ErrorDeConflicto,
  ErrorDeEstado,
  ErrorDePermiso,
  ErrorDeRegla,
  ErrorNoEncontrado,
} from './base.js';

const definiciones = [];

const definir = (clase, codigo, titulo, mensaje, sugerencia, { reintentable = false } = {}) => {
  definiciones.push({ clase, codigo, titulo, mensaje, sugerencia, reintentable });
};

definir(ErrorNoEncontrado, 'JUGADOR_NO_ENCONTRADO', 'Jugador no encontrado',
  (c) => `No existe el jugador ${c.jugadorId}`,
  'Consulta GET /jugadores para ver los jugadores registrados');

definir(ErrorNoEncontrado, 'PARTIDA_NO_ENCONTRADA', 'Partida no encontrada',
  (c) => `No existe la partida ${c.partidaId}`,
  'Consulta GET /partidas para ver las partidas disponibles');

definir(ErrorNoEncontrado, 'OBJETO_NO_ENCONTRADO', 'Objeto no encontrado',
  (c) => `No existe el objeto ${c.objetoId} en esta partida`,
  'Consulta GET /partidas/:id para ver el botin disponible');

definir(ErrorDeConflicto, 'NICK_EN_USO', 'Nick en uso',
  (c) => `El nick ${c.nick} ya esta registrado`,
  'Elige otro nick; no se distingue entre mayusculas y minusculas');

definir(ErrorDeConflicto, 'JUGADOR_YA_INSCRITO', 'Jugador ya inscrito',
  (c) => `El jugador ${c.jugadorId} ya esta inscrito en la partida ${c.partidaId}`,
  'No hace falta volver a unirse');

definir(ErrorDeConflicto, 'JUGADOR_EN_OTRA_PARTIDA', 'Jugador en otra partida',
  (c) => `El jugador ${c.jugadorId} ya participa en la partida ${c.partidaId}`,
  'Sal de la otra partida o espera a que termine');

definir(ErrorDeConflicto, 'PARTIDA_LLENA', 'Partida llena',
  (c) => `La partida esta llena (${c.inscritos}/${c.capacidad})`,
  'Busca otra partida abierta o crea una nueva');

definir(ErrorDeConflicto, 'OBJETO_YA_RECOGIDO', 'Objeto ya recogido',
  (c) => `El objeto ${c.objetoId} ya fue recogido por el jugador ${c.recogidoPor}`,
  'Busca otro objeto del mismo tipo');

definir(ErrorDeConflicto, 'ARMA_REPETIDA', 'Arma repetida',
  (c) => `El jugador ya tiene un arma de tipo ${c.arma}`,
  'Solo se necesita una de cada tipo');

definir(ErrorDeConflicto, 'INVENTARIO_LLENO', 'Inventario lleno',
  (c) => `El inventario esta lleno (${c.ocupados}/${c.espacios})`,
  'Usa un botiquin antes de recoger otro objeto');

definir(ErrorDeConflicto, 'ESCUDO_COMPLETO', 'Escudo completo',
  (c) => `El escudo ya esta al maximo (${c.escudoMaximo})`,
  'Deja el escudo para otro jugador');

definir(ErrorDeConflicto, 'MUNICION_LLENA', 'Municion llena',
  (c) => `La municion ya esta al maximo (${c.municionMaxima})`,
  'Dispara antes de recoger mas municion');

definir(ErrorDeConflicto, 'VIDA_COMPLETA', 'Vida completa',
  (c) => `La vida ya esta al maximo (${c.vidaMaxima})`,
  'Guarda el botiquin para despues');

definir(ErrorDeEstado, 'PARTIDA_NO_ABIERTA', 'Partida no abierta',
  (c) => `La partida esta ${c.estado} y ya no admite cambios de inscripcion`,
  'Solo se puede unir o salir mientras la partida esta abierta');

definir(ErrorDeEstado, 'PARTIDA_NO_EN_CURSO', 'Partida no iniciada',
  () => 'La partida todavia no ha iniciado',
  'Inicia la partida con POST /partidas/:id/iniciar');

definir(ErrorDeEstado, 'PARTIDA_TERMINADA', 'Partida terminada',
  (c) => (c.ganadorId ? `La partida ya termino y gano el jugador ${c.ganadorId}` : 'La partida ya termino sin ganador'),
  'Crea una partida nueva para seguir jugando');

definir(ErrorDeEstado, 'JUGADOR_ELIMINADO', 'Jugador eliminado',
  (c) => `El jugador ${c.jugadorId} ya fue eliminado`,
  'Un jugador eliminado solo puede observar');

definir(ErrorDeEstado, 'OBJETIVO_ELIMINADO', 'Objetivo eliminado',
  (c) => `El objetivo ${c.objetivoId} ya fue eliminado`,
  'Elige un objetivo que siga con vida');

definir(ErrorDeEstado, 'ZONA_FINAL', 'Zona final',
  (c) => `La zona ya esta en su ultima fase (${c.fase})`,
  'La zona no puede reducirse mas');

definir(ErrorDePermiso, 'JUGADOR_NO_PARTICIPA', 'Jugador fuera de la partida',
  (c) => `El jugador ${c.jugadorId} no participa en la partida ${c.partidaId}`,
  'Unete primero con POST /partidas/:id/unirse');

definir(ErrorDePermiso, 'JUGADOR_SUSPENDIDO', 'Jugador suspendido',
  (c) => `El jugador ${c.jugadorId} esta suspendido y no puede unirse a partidas`,
  'Contacta a soporte para revisar la suspension');

definir(ErrorDeRegla, 'JUGADORES_INSUFICIENTES', 'Jugadores insuficientes',
  (c) => `Se necesitan al menos ${c.minimo} jugadores y hay ${c.inscritos}`,
  'Espera a que se unan mas jugadores');

definir(ErrorDeRegla, 'FUERA_DE_MAPA', 'Fuera del mapa',
  (c) => `La posicion (${c.x}, ${c.y}) esta fuera del mapa de ${c.ancho}x${c.alto}`,
  'Usa coordenadas dentro del mapa');

definir(ErrorDeRegla, 'MOVIMIENTO_DEMASIADO_LARGO', 'Movimiento demasiado largo',
  (c) => `El movimiento de ${c.distancia} supera el maximo de ${c.maximo} por turno`,
  'Divide el recorrido en pasos mas cortos');

definir(ErrorDeRegla, 'OBJETO_LEJOS', 'Objeto fuera de alcance',
  (c) => `El objeto esta a ${c.distancia} y solo se puede recoger a ${c.alcance} o menos`,
  'Acercate al objeto antes de recogerlo');

definir(ErrorDeRegla, 'AUTO_ATAQUE', 'Auto ataque',
  () => 'Un jugador no puede dispararse a si mismo',
  'Elige a otro jugador como objetivo');

definir(ErrorDeRegla, 'SIN_ARMA', 'Sin arma',
  (c) => `El jugador ${c.jugadorId} no tiene ningun arma`,
  'Recoge una pistola o un rifle');

definir(ErrorDeRegla, 'ARMA_NO_EQUIPADA', 'Arma no equipada',
  (c) => `El jugador ${c.jugadorId} no tiene un arma de tipo ${c.arma}`,
  'Usa un arma que este en tu inventario');

definir(ErrorDeRegla, 'SIN_MUNICION', 'Sin municion',
  (c) => `El jugador ${c.jugadorId} no tiene municion`,
  'Recoge municion antes de disparar');

definir(ErrorDeRegla, 'FUERA_DE_ALCANCE', 'Objetivo fuera de alcance',
  (c) => `El objetivo esta a ${c.distancia} y el alcance de ${c.arma} es ${c.alcance}`,
  'Acercate al objetivo o usa un arma de mayor alcance');

definir(ErrorDeRegla, 'SIN_BOTIQUIN', 'Sin botiquin',
  (c) => `El jugador ${c.jugadorId} no tiene botiquines`,
  'Recoge un botiquin antes de curarte');

export const CATALOGO = Object.freeze(
  Object.fromEntries(definiciones.map((definicion) => [definicion.codigo, Object.freeze(definicion)])),
);

export const CODIGOS = Object.freeze(Object.keys(CATALOGO));

export function crear(codigo, contexto = {}, { causa } = {}) {
  const definicion = CATALOGO[codigo];
  if (!definicion) throw new TypeError(`Codigo de dominio desconocido: ${codigo}`);
  return new definicion.clase(codigo, definicion.mensaje(contexto), { contexto, causa });
}
